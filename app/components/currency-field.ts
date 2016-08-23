import {IONIC_DIRECTIVES, TextInput, Platform} from 'ionic-angular';
import {Directive, Input, Output, ElementRef, HostBinding} from '@angular/core';
import {PriceFormat} from '../priceFormat';
import {FormBuilder, Validators, ControlGroup, Control, NgModel, NgControl} from '@angular/common';
import {Configuration} from '../configuration.service';

@Directive({
    selector: '[currency-field]',
    providers: [NgModel],
    host: {
        '(ngModelChange)': 'onNgModelChange($event)',
        '(input)': 'onInput($event)',
        '(focus)': 'onFocus($event)',
        '(click)': 'onClick($event)'
        //'[type]': 'hostType'
    }
})
export class CurrencyField extends PriceFormat {

    private usePriceFormat : boolean;

    constructor(ctrl:NgControl, model : NgModel, private eleRef : ElementRef, private configuration : Configuration, private platform : Platform) {
        super(model, ctrl, eleRef);
        this.usePriceFormat = this.configuration.currencyNumericInput;

        //eleRef.nativeElement.setAttribute("type", "number");
        if (this.usePriceFormat && platform.is("ios")) eleRef.nativeElement.setAttribute("pattern", "[0-9]*");
        if (this.usePriceFormat && platform.is("android")) eleRef.nativeElement.setAttribute("pattern", "\d*");
        eleRef.nativeElement.setAttribute("step", "0.01");
        eleRef.nativeElement.setAttribute("inputmode", "number");
        eleRef.nativeElement.setAttribute("novalidate", "true");
        //type="number" pattern="[0-9]*" step="0.01" inputmode="numeric" novalidate
    }

    ngOnInit() {
        if (this.usePriceFormat) super.ngOnInit();
    }
    
    onInput() {
        if (this.usePriceFormat) super.onInput();
    }

    onClick(event) {
    }

    onFocus(event) {
        if (this.usePriceFormat) {
            let elem = this.element.childNodes[0];

            if(elem != null) {
                if(elem.createTextRange) {
                    var range = elem.createTextRange();
                    range.move('character', elem.value.length);
                    range.select();
                } else if(elem.setSelectionRange) {
                    elem.setSelectionRange(elem.value.length, elem.value.length);
                    setTimeout(() => elem.setSelectionRange(elem.value.length, elem.value.length), 1);
                    setTimeout(() => elem.setSelectionRange(elem.value.length, elem.value.length), 10);
                    setTimeout(() => elem.setSelectionRange(elem.value.length, elem.value.length), 100);
                    setTimeout(() => elem.setSelectionRange(elem.value.length, elem.value.length), 300);
                }
            }
        }
    }
    
    onNgModelChange(nv : any) {
        if (this.usePriceFormat) super.onNgModelChange(nv);
    }
}
