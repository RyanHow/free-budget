import {IONIC_DIRECTIVES, TextInput} from 'ionic-angular';
import {Component, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'currency-input',
    template: '<input [type]="type" [(ngModel)]="_value" (blur)="inputBlurred($event)" (focus)="inputFocused($event)" [placeholder]="placeholder" class="text-input">' +
        '<input [type]="type" aria-hidden="true" next-input *ngIf="_useAssist">' +
        '<button clear [hidden]="!clearInput" type="button" class="text-input-clear-icon" (click)="clearTextInput()" (mousedown)="clearTextInput()"></button>' +
        '<div (touchstart)="pointerStart($event)" (touchend)="pointerEnd($event)" (mousedown)="pointerStart($event)" (mouseup)="pointerEnd($event)" class="input-cover" tappable *ngIf="_useAssist"></div>',
    directives: [
        //NextInput,   // TODO: These are private, not in a module, so doesn't work
        //NativeInput,
    ],
    encapsulation: ViewEncapsulation.None,

})

export class CurrencyInput extends TextInput {
}
