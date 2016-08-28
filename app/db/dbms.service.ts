import {Injectable} from '@angular/core';
import {Db} from './db';
import {DbPersistenceProvider} from './dbPersistenceProvider';
import {PersistenceProviderManager} from './persistenceProviderManager';
import * as Loki from 'lokijs';
import {UUID} from 'angular2-uuid';
import {TransactionSerializer} from './transactionSerializer.service';

@Injectable()
export class Dbms {
    
    private loki: Loki;
    private persistenceProvider: DbPersistenceProvider;
    public dbs: Array<Db>;
    private dbMap: Map<string, Db>;
    public initialising: boolean;
        
    constructor(private transactionSerializer: TransactionSerializer, persistenceProviderManager: PersistenceProviderManager) {
        this.persistenceProvider = persistenceProviderManager.provide();
        this.loki = new Loki(null);
        this.loki.autosaveDisable();
        this.dbs = [];
        this.dbMap = new Map<string, Db>();

    }
    
    init(): Promise<void> {
        this.initialising = true;

        let inits = new Array<Promise<any>>();

        this.persistenceProvider.dbs().forEach((dbId) => {
            inits.push(this.createDb(dbId));
        });

        // this.fireEvent("initialised", true);

        return Promise.all(inits).then(() => { this.initialising = false; });
    }
    
    
    getDb(id: string): Db {
        return this.dbMap.get(id);
    }
    
    createDb(id?: string): Promise<Db> {
        
        if (!id) id = UUID.UUID().split('-').join('');

        let db = new Db(id, this, this.persistenceProvider, this.loki, this.transactionSerializer);
        
        this.dbs.push(db);
        this.dbMap.set(id, db);

        if (!this.initialising) {
            return this.persistenceProvider.addDb(id).then(() => {
                return db.init().then(() => db);
            });
        } else {
            return db.init().then(() => db);
        }

    }

    deleteDb(id: string) {
        let db = this.getDb(id);
        this.dbs.splice(this.dbs.indexOf(db), 1);
        this.dbMap.delete(id);
        db.fireEvent('deleted', {});
        this.persistenceProvider.unlinkDb(id);
    }
}