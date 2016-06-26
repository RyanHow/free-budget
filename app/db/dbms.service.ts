import {Injectable} from '@angular/core';
import {Db} from './db';
import {LocalStoragePersistenceProvider} from './localStoragePersistenceProvider';
import * as Loki from 'lokijs';
import {UUID} from 'angular2-uuid';
import {TransactionSerializer} from './transactionSerializer.service';

@Injectable()
export class Dbms {
    
    private loki : Loki;
    private persistenceProvider : LocalStoragePersistenceProvider;
    public dbs : Array<Db>;
    private dbMap : Map<string, Db>;
    public initialising : boolean;
        
    constructor(private transactionSerializer : TransactionSerializer) {
        this.loki = new Loki(null);
        this.loki.autosaveDisable();
        this.persistenceProvider = new LocalStoragePersistenceProvider("A", transactionSerializer);
        
        this.dbs = [];
        this.dbMap = new Map<string, Db>();

    }
    
    init() {
        this.initialising = true;


        this.persistenceProvider.dbs().forEach((dbId) => {
            this.createDb(dbId);
        });

        this.initialising = false;

        //this.fireEvent("initialised", true);
    }
    
    
    getDb(id : string) : Db {
        return this.dbMap.get(id);
    }
    
    createDb(id? : string) : Db {
        
        if (!id) id = UUID.UUID();

        let db = new Db(id, this, this.persistenceProvider, this.loki, this.transactionSerializer);
        
        this.dbs.push(db);
        this.dbMap.set(id, db);

        if (!this.initialising) {
            this.persistenceProvider.addDb(id);
        }

        return db;
    }

    deleteDb(id : string) {
        let db = this.getDb(id);
        this.dbs.splice(this.dbs.indexOf(db), 1);
        this.dbMap.delete(id);
        db.fireEvent("deleted", {});
        this.persistenceProvider.transactions(id).forEach(transaction => {
            this.persistenceProvider.deleteTransaction(id, transaction.id);
        });
        this.persistenceProvider.unlinkDb(id);
    }
}