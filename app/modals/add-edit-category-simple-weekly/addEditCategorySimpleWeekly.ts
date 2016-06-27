import {Page, Modal, NavController, ViewController, NavParams, Alert} from 'ionic-angular';
import {FormBuilder, Validators, ControlGroup, Control} from '@angular/common';
import {Db} from '../../db/db';
import {Category} from '../../data/records/category';
import {Dbms} from '../../db/dbms.service';
import {InitCategorySimpleWeeklyTransaction} from '../../data/transactions/initCategorySimpleWeeklyTransaction';
import {Component} from '@angular/core';

@Component({
  templateUrl: "build/modals/add-edit-category-simple-weekly/add-edit-category-simple-weekly.html"
})
export class AddEditCategorySimpleWeeklyModal {
  form: ControlGroup;
  budget: Db;
  category: Category;
  transaction: InitCategorySimpleWeeklyTransaction;
  
  constructor(public viewCtrl: ViewController, private formBuilder: FormBuilder, private navParams: NavParams, private dbms : Dbms, private nav : NavController) {
    this.viewCtrl = viewCtrl;
    this.nav = nav;
    
    this.form = formBuilder.group({
      balance: ["", Validators.required],
      weeklyAmount: ["", Validators.required],
      balanceDate: ["", Validators.required]
    });
    this.budget = dbms.getDb(navParams.data.budgetId);
    this.category = this.budget.transactionProcessor.table(Category).by("id", navParams.data.categoryId);    
    this.transaction = InitCategorySimpleWeeklyTransaction.getFrom(this.budget, this.category);

    if (!this.transaction) {
      this.transaction = new InitCategorySimpleWeeklyTransaction();
      this.transaction.categoryId = this.category.id;
      (<Control>this.form.controls["balanceDate"]).updateValue("20160520");
    } else {
      (<Control>this.form.controls["balanceDate"]).updateValue(this.transaction.balanceDate);
      (<Control>this.form.controls["weeklyAmount"]).updateValue(this.transaction.weeklyAmount);
      (<Control>this.form.controls["balance"]).updateValue(this.transaction.balance);
    }

  }
  
  submit(event : Event) {
    event.preventDefault();

    this.transaction.balance =  new Big(this.form.controls["balance"].value);
    this.transaction.weeklyAmount =  new Big(this.form.controls["weeklyAmount"].value);
    this.transaction.balanceDate =  this.form.controls["balanceDate"].value;
    this.budget.applyTransaction(this.transaction);

    this.viewCtrl.dismiss();
  }
  
  cancel() {
    this.viewCtrl.dismiss();    
  }


} 