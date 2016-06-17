import {Injectable} from '@angular/core';
import {Transaction} from './transaction';
import {TransactionSerializer} from './transactionSerializer.service';
import {Db} from './db';

@Injectable()
export class LocalStoragePersistenceProvider {
    
    private storagePrefix : string;
    
    constructor(storagePrefix : string, private transactionSerializer : TransactionSerializer) {
        this.storagePrefix = storagePrefix;
    }
    
    dbs() : Array<string> {
        var dbArray = localStorage.getItem(this.storagePrefix + "_dbs");
        if (!dbArray) return [];
        return JSON.parse(dbArray);
    }
    
    addDb(dbId : string) {
        let dbArray = this.dbs();
        if (dbArray.indexOf(dbId) == -1) {
            dbArray.push(dbId);
            localStorage.setItem(this.storagePrefix + "_dbs", JSON.stringify(dbArray));
        }
    }
    
    transactions(dbId) : Array<Transaction> {
        var transactions = [];
        for ( var i = 0, len = localStorage.length; i < len; ++i ) {
            if (localStorage.key( i ).match(this.storagePrefix + "_" + dbId + "_")) {
                var transactionString = localStorage.getItem( localStorage.key( i ) );
                var transaction = this.transactionSerializer.fromJson(transactionString);
                transactions.push(transaction);
            }
        }
        return transactions;
    }
    
    
    saveTransaction(dbId : String, transaction : Transaction) {
        localStorage.setItem(this.storagePrefix + "_" + dbId + "_" + transaction.id, this.transactionSerializer.toJson(transaction));
    }
    
    keyStore(dbId : string, key : string, value : string) {
        var localKey = this.storagePrefix + "_keystore_" + dbId + "_" + key;
        if (typeof value !== 'undefined' )
            localStorage.setItem(localKey, value);

        return localStorage.getItem(localKey);

    }
    
}