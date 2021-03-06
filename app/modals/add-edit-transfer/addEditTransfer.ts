import {NavController, ViewController, NavParams, AlertController} from 'ionic-angular';
import {Db} from '../../db/db';
import {Category} from '../../data/records/category';
import {Transaction} from '../../data/records/transaction';
import {Dbms} from '../../db/dbms.service';
import {InitCategoryTransferTransaction} from '../../data/transactions/initCategoryTransferTransaction';
import {CurrencyField} from '../../components/currency-field';
import {Component} from '@angular/core';
import {Utils} from '../../utils';

@Component({
  templateUrl: 'build/modals/add-edit-transfer/add-edit-transfer.html',
  directives: [CurrencyField]
})
export class AddEditTransferModal {

  data: { date?: string; description?: string; amount?: string; categoryFrom?: any; categoryTo?: any; } = {};

  budget: Db;
  editing: boolean;
  transfer: InitCategoryTransferTransaction;
  categories: Category[];
  transactionRecord: Transaction;

  constructor(public viewCtrl: ViewController, private navParams: NavParams, private dbms: Dbms, private nav: NavController, private alertController: AlertController) {
    this.budget = dbms.getDb(navParams.data.budgetId);
    
    this.categories = this.budget.transactionProcessor.table(Category).data;


    if (navParams.data.transactionId) {
      this.editing = true;
      this.transactionRecord = this.budget.transactionProcessor.table(Transaction).by('id', navParams.data.transactionId);
      this.transfer = InitCategoryTransferTransaction.getFrom(this.budget, this.transactionRecord);
      
      this.data.date = Utils.toIonicFromYYYYMMDD(this.transfer.date);
      this.data.amount = this.transfer.amount + '';
      this.data.description = this.transfer.description;
      this.data.categoryFrom = this.transfer.fromCategoryId;
      this.data.categoryTo = this.transfer.toCategoryId;
    } else {
      this.editing = false;
      this.transfer = new InitCategoryTransferTransaction();
      this.data.categoryFrom = navParams.data.fromCategoryId;
      this.data.date = Utils.nowIonic();
    }
    
    
  }
  
  submit(event: Event) {
    event.preventDefault();
    
    this.transfer.amount = new Big(this.data.amount);
    this.transfer.date = Utils.toYYYYMMDDFromIonic(this.data.date);
    this.transfer.description = this.data.description;
    this.transfer.fromCategoryId = +this.data.categoryFrom;
    this.transfer.toCategoryId = +this.data.categoryTo;
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