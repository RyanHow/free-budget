import {Platform, Nav, ionicBootstrap} from 'ionic-angular';
import {ViewChild, Component} from '@angular/core';
import {StatusBar} from 'ionic-native';
import {HomePage} from './pages/home/home';
import {BudgetPage} from './pages/budget/budget';
import {MainMenuContent} from './components/main-menu-content/mainMenuContent';
import {Dbms} from './db/dbms.service';
import {PersistenceProviderManager} from './db/PersistenceProviderManager';
import {EditorProvider, ModalProvider} from './editorProvider.service';
import {Configuration} from './configuration.service';
import {TransactionSerializer} from './db/transactionSerializer.service';
import {EngineFactory} from './engine/engineFactory.service';
import {Device} from 'ionic-native';
import {InitBudgetTransaction} from './data/transactions/initBudgetTransaction';
import {InitCategoryTransaction} from './data/transactions/initCategoryTransaction';
import {InitSimpleTransaction} from './data/transactions/initSimpleTransaction';
import {InitCategoryTransferTransaction} from './data/transactions/initCategoryTransferTransaction';
import {InitCategorySimpleWeeklyTransaction} from './data/transactions/initCategorySimpleWeeklyTransaction';
import {AddEditTransferModal} from './modals/add-edit-transfer/addEditTransfer';
import {AddEditTransactionModal} from './modals/add-edit-transaction/addEditTransaction';

JL().info('Reading App');

@Component({
  templateUrl: 'build/app.html',
  directives: [MainMenuContent]
})
export class BudgetApp {
  rootPage: any; // = HomePage;
  ready: boolean;
  @ViewChild(Nav) nav: Nav;

  constructor(platform: Platform, private configuration: Configuration, dbms: Dbms, persistenceProviderManager: PersistenceProviderManager, private transactionSerializer: TransactionSerializer, private editorProvider: EditorProvider) {
    JL().info('Constructing App');
    
    platform.ready().then(() => {
      JL().info('Platform Ready');
      if (platform.is('cordova')) {
        JL().info('Running cordova');
        configuration.native = true;
        JL().info('Device Info');
        JL().info(Device.device);
      }
      if (!platform.is('cordova')) {
        JL().info('Running web browser');
        configuration.native = false;
      } 

      JL().info('Initialising Persistence Provider');
      persistenceProviderManager.provide().init().then(() => {
        JL().info('Initialising Persistence Provider');
        JL().info('Loading Configuration');
        return configuration.configure();
      }).then(() => {
        this.registerTransactions();
        this.registerEditorProviders();
        JL().info('Loading Configuration Done');
        JL().info('Initialising Dbms');
        return dbms.init();
      }).then(() => {
        JL().info('Initialising Dbms Done');
        
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        StatusBar.styleDefault();
        
        this.ready = true;
          if (configuration.lastOpenedBudget()) {
            try {
              let budget = dbms.getDb(configuration.lastOpenedBudget());
              this.nav.setRoot(BudgetPage, {'budget' : budget});
            } catch (e) {
              JL().error({msg: 'Unable to auto open budget', exception: e});            
              this.nav.setRoot(HomePage);
            }
          } else {
              this.nav.setRoot(HomePage);
          }

        }).catch(err => {
          JL().fatalException('Error in initialisation', err);
        });


      });
    
    
  }
  
  registerEditorProviders() {
    this.editorProvider.registerModalProvider(new TransactionModalProvider(new InitCategoryTransferTransaction().getTypeId(), AddEditTransferModal));
    this.editorProvider.registerModalProvider(new TransactionModalProvider(new InitSimpleTransaction().getTypeId(), AddEditTransactionModal));
  }

  registerTransactions() {
    this.transactionSerializer.registerType(InitCategoryTransaction);
    this.transactionSerializer.registerType(InitCategoryTransferTransaction);
    this.transactionSerializer.registerType(InitSimpleTransaction);
    this.transactionSerializer.registerType(InitBudgetTransaction);
    this.transactionSerializer.registerType(InitCategorySimpleWeeklyTransaction);
  }

}

class TransactionModalProvider extends ModalProvider {
    
    constructor(private transactionType: string, private modalClass: any) {
        super();
    }
        
    provide(params: any): any {
        if (params.transaction && params.transaction.config && params.transaction.config.transactionType === this.transactionType) return this.modalClass;
    }
}


ionicBootstrap(BudgetApp, [
  Dbms,
  EditorProvider,
  Configuration,
  TransactionSerializer,
  EngineFactory,
  PersistenceProviderManager
]);