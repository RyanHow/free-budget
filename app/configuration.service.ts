import {Device} from 'ionic-native';
import {Injectable} from '@angular/core';
import {TransactionSerializer} from './db/transactionSerializer.service';
import {Transaction} from './data/records/transaction';
import {EditorProvider, ModalProvider} from './editorProvider.service';
// Other imports below that depend on Configuration - TODO: Separate out so the configurator is separate from the configuration to stop the 2 way dependencies

@Injectable()
export class Configuration {
    
    public installationId : string;
    public deviceId : string;
    public deviceName : string;
    public deviceInstallationId : string;
    public native : boolean;
    
    //TODO: Move all this to a single object, serialise and deserialise to JSON (and store in websql or localStorage depending on environment)

    get currencyNumericInput() : boolean {
        return localStorage.getItem("currencyNumericInput") === "true";
    }

    set currencyNumericInput(value : boolean) {
        localStorage.setItem("currencyNumericInput", value ? "true" : "false");
    }

    
    constructor(private transactionSerializer : TransactionSerializer, private editorProvider : EditorProvider) {
        
    }
    
    configure() {
        this.transactionSerializer.registerType(InitCategoryTransaction);
        this.transactionSerializer.registerType(InitCategoryTransferTransaction);
        this.transactionSerializer.registerType(InitSimpleTransaction);
        this.transactionSerializer.registerType(InitBudgetTransaction);
        this.transactionSerializer.registerType(InitCategorySimpleWeeklyTransaction);
                
        this.editorProvider.registerModalProvider(new TransactionModalProvider(new InitCategoryTransferTransaction().getTypeId(), AddEditTransferModal));
        this.editorProvider.registerModalProvider(new TransactionModalProvider(new InitSimpleTransaction().getTypeId(), AddEditTransactionModal));

        if (! localStorage.getItem("installationId")) localStorage.setItem("installationId", 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);}));
        JL().info("Installation Id: " + localStorage.getItem("installationId"));
        this.installationId = localStorage.getItem("installationId");
        this.deviceId = this.native ? Device.device.uuid.toLowerCase() : this.installationId;
        this.deviceName = !this.native ? "Web Browser" : ((<any>Device.device).name || Device.device.model || "Mobile Device");
        // Unique to this device and installation
        this.deviceInstallationId = this.deviceId + "-" + this.installationId;
        
    }
    
    lastOpenedBudget(budgetId? : string) {
        if (budgetId) {
            localStorage.setItem("autoOpenBudgetId", budgetId);
        }
        return localStorage.getItem("autoOpenBudgetId");
        
    }
    
    
    
}

class TransactionModalProvider extends ModalProvider {
    
    constructor(private transactionType : string, private modalClass : any) {
        super();
    }
        
    provide(params :any) : any {
        if (params.transaction && params.transaction.config && params.transaction.config.transactionType == this.transactionType) return this.modalClass;
    }
}



import {InitBudgetTransaction} from './data/transactions/initBudgetTransaction';
import {InitCategoryTransaction} from './data/transactions/initCategoryTransaction';
import {InitSimpleTransaction} from './data/transactions/initSimpleTransaction';
import {InitCategoryTransferTransaction} from './data/transactions/initCategoryTransferTransaction';
import {InitCategorySimpleWeeklyTransaction} from './data/transactions/initCategorySimpleWeeklyTransaction';
import {AddEditTransferModal} from './modals/add-edit-transfer/addEditTransfer';
import {AddEditTransactionModal} from './modals/add-edit-transaction/addEditTransaction';
