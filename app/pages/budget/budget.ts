import {Page, Modal, NavController, NavParams, Refresher} from 'ionic-angular';
import {Dbms} from '../../db/dbms.service';
import {Db} from '../../db/db';
import {Category} from '../../data/records/category';
import {CategoryPage} from '../../pages/category/category';
import {Budget} from '../../data/records/budget';
import {AddEditCategoryModal} from '../../modals/add-edit-category/addEditCategory';
import {EngineFactory} from '../../engine/engineFactory.service';
import {CurrencyDisplay} from '../../currencyDisplay';

@Page({
  templateUrl: 'build/pages/budget/budget.html',
  directives: [CurrencyDisplay]
})
export class BudgetPage {
  projectMenuEnabled : boolean;
  budget : Db;
  budgetRecord : Budget;
  categories : Category[]
  
  constructor(private nav: NavController, private dbms : Dbms, private params : NavParams, private engineFactory : EngineFactory){
    this.nav = nav;
    this.projectMenuEnabled = true;
    this.dbms = dbms;
    
    this.budget = this.params.data.budget;
    engineFactory.getEngine(this.budget);
    this.budget.activate();
    
    this.categories = this.budget.transactionProcessor.table(Category).data;
    this.budgetRecord = this.budget.transactionProcessor.single(Budget);
  }
  
  addCategory() {
    let modal = Modal.create(AddEditCategoryModal);
    modal.data.budgetId = this.budget.id;

    this.nav.present(modal);

  }
  
  openCategory(category : Category) {
    this.nav.push(CategoryPage, {"budget" : this.budget, "categoryId" : category.id});
  }
  
  deleteBudget() {
    
  }
  
  ionViewDidUnload() {
    // TODO: CHeck this is called appropriately (ie. on a different setRoot(), but not on navigating to a child page)
   // this.budget.deactivate();
  }

}