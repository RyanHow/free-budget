import {Page, Modal, NavController, ViewController, NavParams, Alert, AlertController} from 'ionic-angular';
import {FormBuilder, Validators, ControlGroup, Control} from '@angular/common';
import {Db} from '../../db/db';
import {Category} from '../../data/records/category';
import {Transaction} from '../../data/records/transaction';
import {Dbms} from '../../db/dbms.service';
import {InitCategoryTransferTransaction} from '../../data/transactions/initCategoryTransferTransaction';
import {CurrencyField} from '../../components/currency-field';
import {Component} from '@angular/core';
import {Utils} from '../../utils';

@Component({
  templateUrl: "build/modals/add-edit-transfer/add-edit-transfer.html",
  directives: [CurrencyField]
})
export class AddEditTransferModal {
  form: ControlGroup;
  budget: Db;
  editing: boolean;
  transfer: InitCategoryTransferTransaction;
  categories: Category[];
  transactionRecord: Transaction;
  amount : any;

  constructor(public viewCtrl: ViewController, private formBuilder: FormBuilder, private navParams: NavParams, private dbms : Dbms, private nav : NavController, private alertController : AlertController) {
    this.viewCtrl = viewCtrl;
    this.nav = nav;
    
    this.form = formBuilder.group({
      "date": ["", Validators.required],
      //"amount": ["", Validators.required],
      "description": ["", Validators.required],
      "categoryFrom": ["", Validators.required],
      "categoryTo": ["", Validators.required]
    });
    this.budget = dbms.getDb(navParams.data.budgetId);
    
    this.categories = this.budget.transactionProcessor.table(Category).data;


    if (navParams.data.transactionId) {
      this.editing = true;
      this.transactionRecord = this.budget.transactionProcessor.table(Transaction).by("id", navParams.data.transactionId);
      this.transfer = InitCategoryTransferTransaction.getFrom(this.budget, this.transactionRecord);
      
      (<Control>this.form.controls["date"]).updateValue(Utils.toIonicFromYYYYMMDD(this.transfer.date));
      //(<Control>this.form.controls["amount"]).updateValue(this.transfer.amount);
      this.amount = this.transfer.amount;
      (<Control>this.form.controls["description"]).updateValue(this.transfer.description);
      (<Control>this.form.controls["categoryFrom"]).updateValue(this.transfer.fromCategoryId);
      (<Control>this.form.controls["categoryTo"]).updateValue(this.transfer.toCategoryId);
    } else {
      this.editing = false;
      this.transfer = new InitCategoryTransferTransaction();
      (<Control>this.form.controls["categoryFrom"]).updateValue(navParams.data.fromCategoryId);
      (<Control>this.form.controls["date"]).updateValue(Utils.nowIonic());
    }
    
    
  }
  
  submit(event : Event) {
    event.preventDefault();
    
    //this.transfer.amount = new Big(this.form.controls["amount"].value);
    this.transfer.amount = new Big(this.amount);
    this.transfer.date = Utils.toYYYYMMDDFromIonic(this.form.controls["date"].value);
    this.transfer.description = this.form.controls["description"].value;
    this.transfer.fromCategoryId = +this.form.controls["categoryFrom"].value;
    this.transfer.toCategoryId = +this.form.controls["categoryTo"].value;
    this.budget.applyTransaction(this.transfer);

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
    this.budget.deleteTransaction(this.transfer);
    
    this.viewCtrl.dismiss();
  }
} 