import {IONIC_DIRECTIVES, Menu, NavController, Nav} from 'ionic-angular';
import {Component, Input} from '@angular/core';
import {PriceFormat} from "./priceFormat";

@Component({
  selector: 'currency-display',
  template: '<span [class.positive-currency]="positive && highlightPositive" [class.negative-currency]="!positive && highlightNegative">{{formattedCurrencyCached}}</span>'
})

export class CurrencyDisplay {
  
  @Input()
  value : any;
  
  checkValue : any;
  formattedCurrencyCached : string;
  positive : boolean;
  
  @Input()
  highlightPositive : boolean;
  
  @Input()
  highlightNegative : boolean;
  
  @Input()
  invertedCurrency : boolean;

  @Input()
  showPositive : boolean;
  
  ngOnInit() {
    //this.formatCurrency();
    
  }
  
  ngOnChanges() {
    //JL().debug("Changes");
    this.formatCurrency();
  }
  
  formatCurrency() {

    // If they are defined, then they are true, otherwise they will be falsy
    if (typeof this.highlightPositive !== "undefined") this.highlightPositive = true;
    if (typeof this.highlightNegative !== "undefined") this.highlightNegative = true;
    if (typeof this.invertedCurrency !== "undefined") this.invertedCurrency = true;
    if (typeof this.showPositive !== "undefined") this.showPositive = true;
    
        
    if (this.checkValue === this.value) return this.formattedCurrencyCached;
    this.checkValue = this.value;
    
    let pf = new PriceFormat(<any>{}, <any>{});
    let formattedVal = pf.formatIt(pf.fix_it(this.value));
    
    this.positive = true;
    if (parseFloat(this.value) < 0) {
        this.positive = false;
        if (this.highlightNegative) formattedVal = "(" + formattedVal + ")";
    }
    if (this.invertedCurrency) this.positive = !this.positive;
    
    if (this.showPositive && !this.highlightPositive && formattedVal != "0.00") {
        formattedVal = (this.positive ? "+" : "-") + formattedVal;
    } 

    this.formattedCurrencyCached = formattedVal;

    return this.formattedCurrencyCached;

  }
  

}