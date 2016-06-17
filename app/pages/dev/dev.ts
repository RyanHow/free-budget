import {Page, Modal, NavController} from 'ionic-angular';
import {AddBudgetModal} from '../../modals/add-budget/addBudget';
import {BudgetPage} from '../../pages/budget/budget';
import {BudgetApp} from '../../app';
import {Dbms} from '../../db/dbms.service';
import {Db} from '../../db/db';
import {InitBudgetTransaction} from '../../data/transactions/initBudgetTransaction';

@Page({
  templateUrl: 'build/pages/dev/dev.html'
})
export class DevPage {
  
  testamount1 = "hi there";
  _testamount2;
  get testamount2() {
    return this._testamount2;
  }
  set testamount2(value) {
    this._testamount2 = value.toUpperCase();
  }
  testamount3 = "ASD";
  
  constructor(private nav: NavController, private dbms : Dbms){

  }
    
  toUpper3(nv : string) {
    this.testamount3 = nv.toUpperCase();
  }
}
