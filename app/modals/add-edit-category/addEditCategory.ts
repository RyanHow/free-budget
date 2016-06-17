import {Page, Modal, NavController, ViewController, NavParams, Alert} from 'ionic-angular';
import {FormBuilder, Validators, ControlGroup, Control} from '@angular/common';
import {Db} from '../../db/db';
import {Category} from '../../data/records/category';
import {Dbms} from '../../db/dbms.service';
import {InitCategoryTransaction} from '../../data/transactions/initCategoryTransaction';

@Page({
  templateUrl: "build/modals/add-edit-category/add-edit-category.html"
})
export class AddEditCategoryModal {
  form: ControlGroup;
  budget: Db;
  editing: boolean;
  category: Category;
  
  constructor(public viewCtrl: ViewController, private formBuilder: FormBuilder, private navParams: NavParams, private dbms : Dbms, private nav : NavController) {
    this.viewCtrl = viewCtrl;
    this.nav = nav;
    
    this.form = formBuilder.group({
      categoryName: ["", Validators.required]
    });
    this.budget = dbms.getDb(navParams.data.budgetId);
    
    if (navParams.data.categoryId) {
      this.editing = true;
      this.category = this.budget.transactionProcessor.table(Category).by("id", navParams.data.categoryId);
      (<Control>this.form.controls["categoryName"]).updateValue(this.category.name);
    } else {
      this.editing = false;
    }
    
  }
  
  submit(event : Event) {
    event.preventDefault();

    var t;
    if (! this.editing) {
      t = new InitCategoryTransaction();
    } else {
      t = InitCategoryTransaction.getFrom(this.budget, this.category);
    }
    
    t.categoryName = this.form.controls["categoryName"].value;
    this.budget.applyTransaction(t);

    this.viewCtrl.dismiss();
  }
  
  cancel() {
    this.viewCtrl.dismiss();    
  }
  
  deleteCategoryConfirm() {
    let confirm = Alert.create({
      title: 'Delete?',
      message: 'Are you sure you want to delete this category and everything in it?',
      buttons: [
        {
          text: 'Cancel'
        } , {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            confirm.dismiss().then(() => {
              this.deleteCategory();
            });
            return false;
          }
        }
      ]
    });

    this.nav.present(confirm);
  }
  
  deleteCategory() {
    let t = InitCategoryTransaction.getFrom(this.budget, this.category);
    this.budget.deleteTransaction(t);
    
    this.viewCtrl.dismiss().then(() => {
      this.nav.pop();
    });
  }
} 