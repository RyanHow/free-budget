import {Page, NavController, NavParams, ViewController, ModalController, PopoverController} from 'ionic-angular';
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
import {InitCategoryTransferTransaction} from '../../data/transactions/initCategoryTransferTransaction';
import {DFormatPipe} from '../../dFormat';
import {CurrencyDisplay} from '../../currencyDisplay';
import {Logger} from '../../logger';

@Page({
  templateUrl: 'build/pages/category/category.html',
  directives: [CurrencyDisplay],
  pipes: [DFormatPipe]
})
export class CategoryPage {
  private logger: Logger = Logger.get('CategoryPage');

  budget: Db;
  budgetRecord: Budget;
  category: Category;
  transactions: LokiDynamicView<Transaction>;
  transactionTable: LokiCollection<Transaction>;
  
  constructor(private nav: NavController, private dbms: Dbms, private params: NavParams, private editorProvider: EditorProvider, private modalController: ModalController, private popoverController: PopoverController) {
    this.nav = nav;
    this.dbms = dbms;
    
    this.budget = params.data.budget;
    let categoryTable = this.budget.transactionProcessor.table(Category);
    this.category = categoryTable.by('id', params.data.categoryId);
    this.budgetRecord = this.budget.transactionProcessor.single(Budget);
    this.transactionTable = this.budget.transactionProcessor.table(Transaction);

    this.transactions = <any> {data : function() {return []; }};
  }

  transferOtherCategoryName(t: Transaction): string {
    // TODO inefficient? store information in an easy to get way in the transaction config section. or call it x? - performance over memory...
    let transfer = InitCategoryTransferTransaction.getFrom(this.budget, t);
    let categoryId = transfer.fromCategoryId === this.category.id ? transfer.toCategoryId : transfer.fromCategoryId;
    return this.budget.transactionProcessor.table(Category).by('id', categoryId.toString()).name;
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

  categoryWeeklyAmount(): any {
    // TODO Very inefficient way to get a value in angular
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
  
  editTransaction(transaction: Transaction) {
    
    let modal = this.editorProvider.getModal({'budget' : this.budget, 'category' : this.category, 'transaction' : transaction});
    modal.data.budgetId = this.budget.id;
    modal.data.categoryId = this.category.id;
    modal.data.transactionId = transaction.id;
    modal.present();
  }

  ionViewWillEnter() {
    this.transactions = this.transactionTable.addDynamicView('categoryTransactions_' + this.category.id)
    .applyFind({'categoryId' : this.category.id})
    .applySortCriteria([['date', true], ['id', true]]);

    this.logger.debug('WIll Enter Dynamic Views ' + this.transactionTable.DynamicViews.length);

  }
  ionViewDidLeave() {
    this.transactionTable.removeDynamicView(this.transactions.name);
    this.logger.debug('Did Leave Dynamic Views ' + this.transactionTable.DynamicViews.length);
    this.transactions = <any> {data : function() {return []; }};

  }

  
}


@Component({
  template: `
    <ion-list>
      <button ion-item detail-none (click)="close(categoryPage.editSimpleWeekly)">Weekly Amount</button>
      <button ion-item detail-none (click)="close(categoryPage.editCategory)">Edit / Delete Category</button>
      <button ion-item detail-none (click)="close(categoryPage.addTransaction)">New Transaction</button>
      <button ion-item detail-none (click)="close(categoryPage.addTransfer)">Transfer Funds</button>
    </ion-list>
  `
})
class CategoryPopover {

  private categoryPage: CategoryPage;

  constructor(private viewCtrl: ViewController) {
    this.categoryPage = <CategoryPage>viewCtrl.data.categoryPage;
  }

  close(thenFn: Function) {
    this.viewCtrl.dismiss({navOptions: {animate: false, transitionDelay: 0}}).then(() => { thenFn.call(this.categoryPage); });
  }

}