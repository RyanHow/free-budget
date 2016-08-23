import {Page, Modal, NavController, NavParams, Refresher, Popover, ViewController, ModalController, PopoverController} from 'ionic-angular';
import {Component} from '@angular/core';
import {Dbms} from '../../db/dbms.service';
import {Db} from '../../db/db';
import {Category} from '../../data/records/category';
import {Transaction} from '../../data/records/transaction';
import {Budget} from '../../data/records/budget';
import {AddEditCategoryModal} from '../../modals/add-edit-category/addEditCategory';
import {AddEditCategorySimpleWeeklyModal} from '../../modals/add-edit-category-simple-weekly/addEditCategorySimpleWeekly';
import {InitCategorySimpleWeeklyTransaction} from '../../data/transactions/initCategorySimpleWeeklyTransaction';
import {EditorProvider} from '../../editorProvider.service';
import {AddEditTransactionModal} from '../../modals/add-edit-transaction/addEditTransaction';
import {AddEditTransferModal} from '../../modals/add-edit-transfer/addEditTransfer';
import {DFormatPipe} from '../../dFormat';
import {CurrencyDisplay} from '../../currencyDisplay';

@Page({
  templateUrl: 'build/pages/category/category.html',
  directives: [CurrencyDisplay],
  pipes: [DFormatPipe]
})
export class CategoryPage {
  budget : Db;
  budgetRecord : Budget;
  category : Category;
  transactions: LokiDynamicView<Transaction>;
  transactionTable: LokiCollection<Transaction>;
  
  constructor(private nav: NavController, private dbms : Dbms, private params : NavParams, private editorProvider : EditorProvider, private modalController : ModalController, private popoverController : PopoverController){
    this.nav = nav;
    this.dbms = dbms;
    
    this.budget = params.data.budget;
    let categoryTable = this.budget.transactionProcessor.table(Category)
    this.category = categoryTable.by("id", params.data.categoryId);
    this.budgetRecord = this.budget.transactionProcessor.single(Budget);
    this.transactionTable = this.budget.transactionProcessor.table(Transaction);

    this.transactions = <any> {data : function() {return []}};
  }
  
  showMore(event) {
    let popover = this.popoverController.create(CategoryPopover, {categoryPage : this});
    popover.present({
      ev: event
    });
  }
 
  editCategory() {
    let modal = this.modalController.create(AddEditCategoryModal);
    modal.data.budgetId = this.budget.id;
    modal.data.categoryId = this.category.id;

    modal.present();

  }

  editSimpleWeekly() {
    let modal = this.modalController.create(AddEditCategorySimpleWeeklyModal);
    modal.data.budgetId = this.budget.id;
    modal.data.categoryId = this.category.id;

    modal.present();

  }

  categoryWeeklyAmount() : any {
    //TODO Very inefficient way to get a value in angular
    let t = InitCategorySimpleWeeklyTransaction.getFrom(this.budget, this.category);
    if (t) return t.weeklyAmount;
  }

  addTransaction() {
    let modal = this.modalController.create(AddEditTransactionModal);
    modal.data.budgetId = this.budget.id;
    modal.data.categoryId = this.category.id;
    modal.present();

  }
  
  addTransfer() {
    let modal = this.modalController.create(AddEditTransferModal);
    modal.data.budgetId = this.budget.id;
    modal.data.fromCategoryId = this.category.id;
    modal.present();
  }
  
  editTransaction(transaction : Transaction) {
    
    let modal = this.editorProvider.getModal({"budget" : this.budget, "category" : this.category, "transaction" : transaction});
    modal.data.budgetId = this.budget.id;
    modal.data.categoryId = this.category.id;
    modal.data.transactionId = transaction.id;
    modal.present();
  }

  ionViewWillEnter() {
    this.transactions = this.transactionTable.addDynamicView("categoryTransactions_" + this.category.id)
    .applyFind({"categoryId" : this.category.id})
    //.applySimpleSort("date", true)
    .applySortCriteria([["date", true], ["id", true]]);

    JL().debug("WIll Enter Dynamic Views " + this.transactionTable.DynamicViews.length);

  }
  ionViewDidLeave() {
    this.transactionTable.removeDynamicView(this.transactions.name);
    JL().debug("Did Leave Dynamic Views " + this.transactionTable.DynamicViews.length);
    this.transactions = <any> {data : function() {return []}};

  }

  
}


@Component({
  template: `
    <ion-list>
      <button ion-item detail-none (click)="categoryPage.editSimpleWeekly();close()">Weekly Amount</button>
      <button ion-item detail-none (click)="categoryPage.editCategory();close()">Edit / Delete Category</button>
      <button ion-item detail-none (click)="categoryPage.addTransaction();close()">New Transaction</button>
      <button ion-item detail-none (click)="categoryPage.addTransfer();close()">Transfer Funds</button>
    </ion-list>
  `
})
class CategoryPopover {

  private categoryPage : CategoryPage;

  constructor(private viewCtrl: ViewController) {
    this.categoryPage = <CategoryPage>viewCtrl.data.categoryPage;
  }

  close() {
    this.viewCtrl.dismiss();
  }

}