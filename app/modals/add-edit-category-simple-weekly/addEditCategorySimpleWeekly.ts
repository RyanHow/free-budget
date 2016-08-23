import {Page, Modal, NavController, ViewController, NavParams, Alert} from 'ionic-angular';
import {FormBuilder, Validators, ControlGroup, Control} from '@angular/common';
import {Db} from '../../db/db';
import {Category} from '../../data/records/category';
import {Transaction} from '../../data/records/transaction';
import {Dbms} from '../../db/dbms.service';
import {CurrencyField} from '../../components/currency-field';
import {InitCategorySimpleWeeklyTransaction} from '../../data/transactions/initCategorySimpleWeeklyTransaction';
import {Component} from '@angular/core';
import {Utils} from '../../utils';

@Component({
  templateUrl: "build/modals/add-edit-category-simple-weekly/add-edit-category-simple-weekly.html",
  directives: [CurrencyField]
})
export class AddEditCategorySimpleWeeklyModal {
  form: ControlGroup;
  budget: Db;
  category: Category;
  transaction: InitCategorySimpleWeeklyTransaction;
  balance: any;
  weeklyAmount: any;
  myType: String = "";
  
  constructor(public viewCtrl: ViewController, private formBuilder: FormBuilder, private navParams: NavParams, private dbms : Dbms, private nav : NavController) {
    this.viewCtrl = viewCtrl;
    this.nav = nav;
    
    this.form = formBuilder.group({
      //balance: ["", Validators.required],
      //weeklyAmount: ["", Validators.required],
      balanceDate: ["", Validators.required]
    });
    this.budget = dbms.getDb(navParams.data.budgetId);
    this.category = this.budget.transactionProcessor.table(Category).by("id", navParams.data.categoryId);    
    this.transaction = InitCategorySimpleWeeklyTransaction.getFrom(this.budget, this.category);

    (<Control>this.form.controls["balanceDate"]).updateValue(Utils.nowIonic());

    if (!this.transaction) {
      this.transaction = new InitCategorySimpleWeeklyTransaction();
      this.transaction.categoryId = this.category.id;
    } else {
      //(<Control>this.form.controls["weeklyAmount"]).updateValue(this.transaction.weeklyAmount);
      //(<Control>this.form.controls["balance"]).updateValue(this.category.balance);
      this.balance = this.category.balance;
      this.weeklyAmount = this.transaction.weeklyAmount;
    }

  }
  
  submit(event : Event) {
    event.preventDefault();

    // TODO: Get the sum of transactions with date of TODAY
    // Subtract from the balance here
    this.transaction.balanceDate = Utils.toYYYYMMDDFromIonic(this.form.controls["balanceDate"].value);

    let todaysTotal = this.budget.transactionProcessor.table(Transaction).chain()
      .find({'categoryId' : this.category.id}).find({'date' : { '$gte' : this.transaction.balanceDate}}).mapReduce(t => t.amount, tt => tt.length == 0 ? new Big(0) : tt.reduce((a, b) => a.plus(b)));
        
    this.transaction.balance =  new Big(this.balance).plus(todaysTotal);
    this.transaction.weeklyAmount =  new Big(this.weeklyAmount);
    this.budget.applyTransaction(this.transaction);

    this.viewCtrl.dismiss();
  }
  
  cancel() {
    this.viewCtrl.dismiss();    
  }


} 