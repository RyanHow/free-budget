import {Device} from 'ionic-native';
import {Platform} from 'ionic-angular';
import {Injectable} from '@angular/core';
import {PersistenceProviderManager} from './db/persistenceProviderManager';
import {DbPersistenceProvider} from './db/dbPersistenceProvider';
import {Logger} from './logger';


@Injectable()
export class Configuration {
    private logger: Logger = Logger.get('Configuration');

    private configured: boolean = false;
    public installationId: string;
    public deviceId: string;
    public deviceName: string;
    public deviceInstallationId: string;
    public native: boolean;
    private persistence: DbPersistenceProvider;
    private cId: string = 'conf';
    
    get currencyNumericInput(): boolean {
        return this.persistence.keyStore(this.cId, 'currencyNumericInput') === 'true';
    }

    set currencyNumericInput(value: boolean) {
        this.persistence.keyStore(this.cId, 'currencyNumericInput', value ? 'true' : 'false');
    }

    get loglevel(): string {
        return this.persistence.keyStore(this.cId, 'loglevel');
    }

    set loglevel(value: string) {
        this.persistence.keyStore(this.cId, 'loglevel', value);
    }

    
    constructor(private persistenceProviderManager: PersistenceProviderManager, private platform: Platform) {

    }
    
    configure(): Promise<void> {
        this.persistence = this.persistenceProviderManager.provide();

        this.initLogLevel();

        if (this.platform.is('cordova')) {
            this.logger.info('Running cordova');
            this.native = true;
            this.logger.info('Device Info');
            this.logger.info(Device.device);
        }
        if (!this.platform.is('cordova')) {
            this.logger.info('Running web browser');
            this.native = false;
        } 

        // Device and install Ids
        if (! this.persistence.keyStore(this.cId, 'installationId')) this.persistence.keyStore(this.cId, 'installationId', 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random() * 16 | 0, v = c === 'x' ? r : r & 0x3 | 0x8; return v.toString(16); }));
        this.installationId = this.persistence.keyStore(this.cId, 'installationId');
        this.logger.info('Installation Id: ' + this.installationId);
        this.deviceId = this.native ? Device.device.uuid.toLowerCase() : this.installationId;
        this.deviceName = !this.native ? 'Web Browser' : ((<any>Device.device).name || Device.device.model || 'Mobile Device');
        if (! this.persistence.keyStore(this.cId, 'deviceId')) this.persistence.keyStore(this.cId, 'deviceId', this.deviceId);
        // Unique to this device and installation
        this.deviceInstallationId = this.deviceId + '-' + this.installationId;

        this.configured = true;

        return Promise.resolve();
    }

    initLogLevel() {
        if (this.loglevel === 'Debug') {
            this.logger.config.level = Logger.DEBUG;
        } else {
            this.logger.config.level = Logger.INFO;
        }
    }
    
    lastOpenedBudget(budgetId?: string): string {
        if (!this.configured) return null;

        return this.persistence.keyStore(this.cId, 'autoOpenBudgetId', budgetId);
    }
    
    
    
}




