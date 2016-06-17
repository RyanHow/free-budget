import {Page, Modal, NavController, NavParams, Refresher} from 'ionic-angular';
import {Dbms} from '../../db/dbms.service';
import {Db} from '../../db/db';
import {Category} from '../../data/records/category';
import {Transaction} from '../../data/records/transaction';
import {Budget} from '../../data/records/budget';
import {AddEditCategoryModal} from '../../modals/add-edit-category/addEditCategory';
import {AddEditCategorySimpleWeeklyModal} from '../../modals/add-edit-category-simple-weekly/addEditCategorySimpleWeekly';
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
  
  constructor(private nav: NavController, private dbms : Dbms, private params : NavParams, private editorProvider : EditorProvider){
    this.nav = nav;
    this.dbms = dbms;
    
    this.budget = params.data.budget;
    let categoryTable = this.budget.transactionProcessor.table(Category)
    this.category = categoryTable.by("id", params.data.categoryId);
    this.budgetRecord = this.budget.transactionProcessor.single(Budget);
    this.transactionTable = this.budget.transactionProcessor.table(Transaction);

    this.transactions = <any> {data : function() {return []}};
  }
  
 
  editCategory() {
    let modal = Modal.create(AddEditCategoryModal);
    modal.data.budgetId = this.budget.id;
    modal.data.categoryId = this.category.id;

    this.nav.present(modal);

  }

  editSimpleWeekly() {
    let modal = Modal.create(AddEditCategorySimpleWeeklyModal);
    modal.data.budgetId = this.budget.id;
    modal.data.categoryId = this.category.id;

    this.nav.present(modal);

  }

  addTransaction() {
    let modal = Modal.create(AddEditTransactionModal);
    modal.data.budgetId = this.budget.id;
    modal.data.categoryId = this.category.id;
    this.nav.present(modal);

  }
  
  addTransfer() {
    let modal = Modal.create(AddEditTransferModal);
    modal.data.budgetId = this.budget.id;
    modal.data.fromCategoryId = this.category.id;
    this.nav.present(modal);
  }
  
  editTransaction(transaction : Transaction) {
    
    let modal = this.editorProvider.getModal({"budget" : this.budget, "category" : this.category, "transaction" : transaction});
    modal.data.budgetId = this.budget.id;
    modal.data.categoryId = this.category.id;
    modal.data.transactionId = transaction.id;
    this.nav.present(modal);
  }

  ionViewWillEnter() {
    this.transactions = this.transactionTable.addDynamicView("categoryTransactions_" + this.category.id).applyFind({"categoryId" : this.category.id}).applySimpleSort("date", true);
    JL().debug("WIll Enter Dynamic Views " + this.transactionTable.DynamicViews.length);

  }
  ionViewDidLeave() {
    this.transactionTable.removeDynamicView(this.transactions.name);
    JL().debug("Did Leave Dynamic Views " + this.transactionTable.DynamicViews.length);
    this.transactions = <any> {data : function() {return []}};

  }

  
}