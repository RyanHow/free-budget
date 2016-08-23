import {IONIC_DIRECTIVES, TextInput} from 'ionic-angular';
import {Component, Input, Output} from '@angular/core';
import {PriceFormat} from '../../priceFormat';
import {FormBuilder, Validators, ControlGroup, Control} from '@angular/common';
import {Configuration} from '../../configuration.service';

@Component({
    selector: 'currency-input',
    template: '<ion-input *ngIf="configuration.currencyNumericInput" type="text" [(ngModel)]="currencyValue" priceFormat pattern="[0-9]*"' +
              'step="0.01" inputmode="numeric" novalidate [attr.autofocus]="editing ? null : true"></ion-input>' +
              '<ion-input *ngIf="!configuration.currencyNumericInput" type="number" [(ngModel)]="currencyValue" step="0.01" [attr.autofocus]="editing ? null : true"></ion-input>',
    directives: [
        PriceFormat
    ]
})
export class CurrencyInput {

    @Input()
    @Output()
    currencyValue : any;

    editing : boolean = true; // TODO

    constructor(private configuration : Configuration) {

    }

}
