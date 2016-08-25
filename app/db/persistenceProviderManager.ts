import {Injectable} from '@angular/core';
import {DbPersistenceProvider} from './dbPersistenceProvider';
import {LocalStoragePersistenceProvider} from './localStoragePersistenceProvider';
import {TransactionSerializer} from './transactionSerializer.service';

@Injectable()
export class PersistenceProviderManager  {

    private persistenceProvider : DbPersistenceProvider;
 
    constructor(private transactionSerializer : TransactionSerializer) {
        
    }

    provide() : DbPersistenceProvider {
        if (this.persistenceProvider == null) {
            this.persistenceProvider = new LocalStoragePersistenceProvider("A", this.transactionSerializer);
        }

        return this.persistenceProvider;
    }
}