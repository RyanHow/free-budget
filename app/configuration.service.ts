import {Device} from 'ionic-native';
import {Injectable} from '@angular/core';


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

    get loglevel() : string {
        return localStorage.getItem("loglevel");
    }

    set loglevel(value : string) {
        localStorage.setItem("loglevel", value);
    }

    
    constructor() {
        
    }
    
    configure() : Promise<void> {
        this.initLogLevel();

        if (! localStorage.getItem("installationId")) localStorage.setItem("installationId", 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);}));
        JL().info("Installation Id: " + localStorage.getItem("installationId"));
        this.installationId = localStorage.getItem("installationId");
        this.deviceId = this.native ? Device.device.uuid.toLowerCase() : this.installationId;
        this.deviceName = !this.native ? "Web Browser" : ((<any>Device.device).name || Device.device.model || "Mobile Device");
        // Unique to this device and installation
        this.deviceInstallationId = this.deviceId + "-" + this.installationId;
        
        return Promise.resolve();
    }

    initLogLevel() {
        if (this.loglevel == "Debug") {
            JL().setOptions({level:JL.getDebugLevel()});
        } else {
            JL().setOptions({level:JL.getInfoLevel()});
        }
    }
    
    lastOpenedBudget(budgetId? : string) {
        if (budgetId) {
            localStorage.setItem("autoOpenBudgetId", budgetId);
        }
        return localStorage.getItem("autoOpenBudgetId");
        
    }
    
    
    
}




