import {Page, Modal, NavController, ViewController, NavParams, Alert, AlertController} from 'ionic-angular';
import {FormBuilder, Validators, ControlGroup, Control} from '@angular/common';
import {Db} from '../../db/db';
import {Category} from '../../data/records/category';
import {Transaction} from '../../data/records/transaction';
import {Dbms} from '../../db/dbms.service';
import {InitSimpleTransaction} from '../../data/transactions/initSimpleTransaction';
import {CurrencyField} from '../../components/currency-field';
import {Configuration} from '../../configuration.service';
import {NoFocusDirective} from '../../noFocus';
import {Component} from '@angular/core';
import {Utils} from '../../utils';

@Component({
  templateUrl: "build/modals/add-edit-transaction/add-edit-transaction.html",
  directives: [CurrencyField, NoFocusDirective]
})
export class AddEditTransactionModal {
  form: ControlGroup;
  budget: Db;
  editing: boolean;
  category: Category;
  transaction: Transaction;
  field: any = {};
  expense : boolean = true;
  
  constructor(private configuration : Configuration, public viewCtrl: ViewController, private formBuilder: FormBuilder, private navParams: NavParams, private dbms : Dbms, private nav : NavController, private alertController : AlertController) {
    this.viewCtrl = viewCtrl;
    this.nav = nav;
    
    this.form = formBuilder.group({
      "date": ["", Validators.required],
      "description": ["", Validators.required]
    });
    this.budget = dbms.getDb(navParams.data.budgetId);
    this.category = this.budget.transactionProcessor.table(Category).by("id", navParams.data.categoryId);

    if (navParams.data.transactionId) {
      this.editing = true;
      this.transaction = this.budget.transactionProcessor.table(Transaction).by("id", navParams.data.transactionId);

      (<Control>this.form.controls["date"]).updateValue(Utils.toIonicFromYYYYMMDD(this.transaction.date));
      if (this.transaction.amount.cmp(Big(0)) < 0) {
        this.expense = false;
        this.field.amount = this.transaction.amount.times(-1);
      } else {
        this.field.amount = this.transaction.amount;
      }
      (<Control>this.form.controls["description"]).updateValue(this.transaction.description);
    } else {
      this.editing = false;
      (<Control>this.form.controls["date"]).updateValue(Utils.nowIonic());
    }
    
  }
    
  submit(event : Event) {
    event.preventDefault();

    var t : InitSimpleTransaction;
    if (! this.editing) {
      t = new InitSimpleTransaction();
    } else {
      t = InitSimpleTransaction.getFrom(this.budget, this.transaction);
    }    
    
    t.amount = new Big((this.field.amount+"").replace(",", ""));
    if (!this.expense) {
      t.amount = t.amount.times(-1);
    }
    t.date = Utils.toYYYYMMDDFromIonic(this.form.controls["date"].value);
    t.description = this.form.controls["description"].value;
    t.categoryId = this.category.id;
    this.budget.applyTransaction(t);

    this.viewCtrl.dismiss();
  }
  
  cancel() {
    this.viewCtrl.dismiss();    
  }
  
  deleteTransactionConfirm() {
    let confirm = this.alertController.create({
      title: 'Delete?',
      message: 'Are you sure you want to delete this transaction?',
      buttons: [
        {
          text: 'Cancel'
        } , {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            confirm.dismiss().then(() => {
              this.deleteTransaction();
            });
            return false;
          }
        }
      ]
    });

    confirm.present();
  }
  
  deleteTransaction() {
    let t = InitSimpleTransaction.getFrom(this.budget, this.transaction);
    this.budget.deleteTransaction(t);
    
    this.viewCtrl.dismiss();
  }
  
  toggleExpense() {
    this.expense = !this.expense;
  }
} 