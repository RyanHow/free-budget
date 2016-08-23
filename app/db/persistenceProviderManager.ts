import {Injectable} from '@angular/core';
import {DbPersistenceProvider} from './dbPersistenceProvider';
import {LocalStoragePersistenceProvider} from './localStoragePersistenceProvider';
import {Configuration} from '../configuration.service';
import {TransactionSerializer} from './transactionSerializer.service';

@Injectable()
export class PersistenceProviderManager  {

    private persistenceProvider : DbPersistenceProvider;
 
    constructor(private configuration : Configuration, private transactionSerializer : TransactionSerializer) {
        
    }

    provide() : DbPersistenceProvider {
        if (this.persistenceProvider == null) {
            this.persistenceProvider = new LocalStoragePersistenceProvider("A", this.transactionSerializer);
        }

        return this.persistenceProvider;
    }
}