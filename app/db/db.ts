import {LocalStoragePersistenceProvider} from './localStoragePersistenceProvider';
import {Dbms} from './dbms.service';
import {Transaction} from './transaction';
import {TransactionProcessor} from './transactionProcessor';
import {TransactionSerializer} from './transactionSerializer.service';

export class Db {
    
    private persistenceProvider : LocalStoragePersistenceProvider;
    public id : string;
    private dbms : Dbms;
    private loki : Loki;
    private transactions: LokiCollection<Transaction>;
    public sortedTransactions: LokiDynamicView<Transaction>;
    private active : boolean;
    private activating : boolean;
    private transactionIdHead : number;
    private eventListeners : Array<any>;
    transactionProcessor : TransactionProcessor;

    toJSON() {
        return this.id;
    }

    constructor(id : string, dbms : Dbms , persistenceProvider : LocalStoragePersistenceProvider, loki : Loki, private transactionSerializer : TransactionSerializer) {
        this.id = id;
        this.dbms = dbms;
        this.persistenceProvider = persistenceProvider;
        this.loki = loki;
        this.active = false;
        this.transactionProcessor = new TransactionProcessor(this, loki);
        
        this.transactions = loki.addCollection<Transaction>("transactions_" + id);
        this.transactions.ensureUniqueIndex("id");
        this.eventListeners = [];
                
        this.persistenceProvider.transactions(this.id).forEach((transaction) => {
            this.transactions.insert(transaction);
        });

        this.sortedTransactions = this.transactions.addDynamicView("sortedTransactions_" + id);
        this.sortedTransactions.applySimpleSort('id');


    }
    
    isActive() : boolean {
        return this.active;
    }
    
    activate() {
        if (this.active) return;
        
        // Only if active... so do this on "activate" ?
        this.activating = true;
        for (var index = 0; index < this.sortedTransactions.data().length; index++) {
            this.applyTransaction(this.sortedTransactions.data()[index]);
        }
        this.activating = false;

        this.active = true;
        
        this.fireEvent("activated", {db : this});

    }
    
    isActivating() {
        return this.activating;
    }
    
    deactivate() {
        if (! this.active) return;
        
        //TODO: Delete tables (not transactions, but generated tables)
        this.active = false;
    }

    name(name? : string) : string {
        return this.localSetting("name", name);
    }
    
    transactionIdLocalGen(localGenId? : any) : number {
        var id = this.localSetting("localGenId", localGenId);
        if (!id) return 1;
        if (parseInt(id) < 1 || parseInt(id) > 999) throw new Error("localGenId must be between 1 - 999 inclusive. Value is: " + localGenId);
        return parseInt(id);
    }

    localSetting(key : string, valueString? : string) : string {
        return this.persistenceProvider.keyStore(this.id, key, valueString);
    }
    
    // Returns the next transaction Id above the head transaction (So does not increment, incrementing occurs on processing)
    nextTransactionId() {
        return ~~((~~((this.transactionIdHead ? this.transactionIdHead : 0) / 1000) + 1) * 1000) + this.transactionIdLocalGen();
    }

    private updateTransactionIdHead(transaction : Transaction) {
        if (!this.transactionIdHead || transaction.id > this.transactionIdHead) this.transactionIdHead = transaction.id;
    }
    
    /**
     * Applying a transaction will execute it and persist it in the database.
     * 
     * The transaction must be a new one, or attached to a database, not a clone
     */
    applyTransaction(transaction : Transaction) {

        if (transaction.id) this.updateTransactionIdHead(transaction);
        
        // Ignore deleted transactions
        if (transaction.deleted && !transaction.applied) return; 
        
        // If they are flagged deleted and applied, then do then actually delete it
        if (transaction.deleted && transaction.applied) {
            this.deleteTransaction(transaction);
            return;
        }

        // Give a new transaction an Id
        if (!transaction.id) {
            transaction.id = this.nextTransactionId();
            this.updateTransactionIdHead(transaction);
        }
        
        // Process transactions
        if (this.active || this.activating) {
            if (!transaction.applied) {
                transaction.apply(this.transactionProcessor);
                transaction.applied = true;
                
            } else {
                transaction.update(this.transactionProcessor);
            }
        }
        if (!this.isActivating()) {
            this.saveTransaction(transaction);
        }
        
        this.fireEvent("transaction-applied", {'transaction' : transaction});
    }
    
    getTransaction<T extends Transaction>(transactionId : number) : T {
        return <T>this.transactions.by("id", <any> transactionId);
    }
    
    /**
     * Saving a transaction will persist it, but not apply it
     * This should only be called internally, or if extra transaction
     * data is needing to be saved without any modifications to the transaction itself
     * 
     * The transaction must be a new one, or attached to a database, not a clone
     */
    saveTransaction(transaction : Transaction) {
        // Determine which one... it doesn't matter
        if (this.getTransaction(transaction.id) == null) {
            this.transactions.insert(transaction);
        } else {
            this.transactions.update(transaction);
        }
        
        this.persistenceProvider.saveTransaction(this.id, this.transactionSerializer.cloneTransaction(transaction));
    }
        
    /**
     * Undo a transaction and remove it from the database
     */
    deleteTransaction(transaction : Transaction) {
        transaction.deleted = true;
        if (this.getTransaction(transaction.id) == null) {
            this.transactions.insert(transaction);
        } else {
            this.transactions.update(transaction);
        }

        this.persistenceProvider.saveTransaction(this.id, this.transactionSerializer.cloneTransaction(transaction));
        this.undoTransaction(transaction);
    }
    
    undoTransaction(transaction : Transaction) {
        if (!transaction.applied) return;
        transaction.undo(this.transactionProcessor);
        transaction.applied = false;
    }
    
    
    
    addEventListener(listener) {
        this.eventListeners.push(listener);
    }
    

    fireEvent(eventName, data) {
        // TODO: Register dbs.service as a listener, and have it emit events, so replication can listen at a "global" level rather than to every db
        JL("db").debug(eventName + " data: " + JSON.stringify(data));
        this.eventListeners.forEach(function(l) {l(eventName, data);});
    }


}