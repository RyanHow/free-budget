import {Page, Modal, ModalController, NavController} from 'ionic-angular';
import {AddBudgetModal} from '../../modals/add-budget/addBudget';
import {BudgetPage} from '../../pages/budget/budget';
import {Dbms} from '../../db/dbms.service';
import {InitBudgetTransaction} from '../../data/transactions/initBudgetTransaction';

@Page({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
  projectMenuEnabled : boolean;
  
  constructor(private nav: NavController, private dbms : Dbms, private modalController : ModalController){
    this.nav = nav;
    this.projectMenuEnabled = true;
    this.dbms = dbms;
  }
  
  addBudget() {
    let modal = this.modalController.create(AddBudgetModal);

    modal.onDidDismiss((data) => {
      if (data && data.budgetName != "" ) {
        let db = this.dbms.createDb().then(db => {
          db.activate();
          let t = new InitBudgetTransaction();
          t.budgetName = data.budgetName;
          db.applyTransaction(t);
          db.deactivate();

          this.nav.setRoot(BudgetPage, {'budget' : db});
        });
      }
    });
    

    modal.present();
  }
  
    
}
