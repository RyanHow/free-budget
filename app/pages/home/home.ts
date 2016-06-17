import {Page, Modal, NavController} from 'ionic-angular';
import {AddBudgetModal} from '../../modals/add-budget/addBudget';
import {BudgetPage} from '../../pages/budget/budget';
import {BudgetApp} from '../../app';
import {Dbms} from '../../db/dbms.service';
import {Db} from '../../db/db';
import {InitBudgetTransaction} from '../../data/transactions/initBudgetTransaction';

@Page({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  projectMenuEnabled : boolean;
  
  constructor(private nav: NavController, private dbms : Dbms){
    this.nav = nav;
    this.projectMenuEnabled = true;
    this.dbms = dbms;
  }
  
  addBudget() {
    let modal = Modal.create(AddBudgetModal);

    modal.onDismiss((data) => {
      if (data && data.budgetName != "" ) {
        let db = this.dbms.createDb();
        db.activate();
        let t = new InitBudgetTransaction();
        t.budgetName = data.budgetName;
        db.applyTransaction(t);
        db.deactivate();

        this.nav.setRoot(BudgetPage, {'budget' : db});

      }
    });
    

    this.nav.present(modal);
  }
  
    
}