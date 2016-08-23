import {Injectable} from '@angular/core';
import {Modal, ModalController} from 'ionic-angular';

@Injectable()
export class EditorProvider {
        
    private modalProviders : Array<ModalProvider>;
        
    constructor(private modalController : ModalController) {
        this.modalProviders = [];
    }
    
    registerModalProvider(provider : ModalProvider) {
        this.modalProviders.unshift(provider);
    }
       
    getModal(params : any) : Modal {
        for (var i = 0; i < this.modalProviders.length; i++) {
            let modalClass = this.modalProviders[i].provide(params);
            if (modalClass) return this.modalController.create(modalClass);
        }

        JL().fatal({msg: "No modal provider found", params: params});
        throw new Error("No modal provider for " + params);      
    }
    
}

export abstract class ModalProvider {
    abstract provide(params : any) : any;
}
