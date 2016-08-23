import {Platform, NavController, Nav, ionicBootstrap} from 'ionic-angular';
import {Injectable, ViewChild, Component} from '@angular/core';
import {StatusBar} from 'ionic-native';
import {HomePage} from './pages/home/home';
import {BudgetPage} from './pages/budget/budget';
import {MainMenuContent} from './components/main-menu-content/mainMenuContent'
import {CurrencyDisplay} from './currencyDisplay'
import {Dbms} from './db/dbms.service';
import {PersistenceProviderManager} from './db/PersistenceProviderManager';
import {EditorProvider} from './editorProvider.service';
import {Configuration} from './configuration.service';
import {Db} from './db/db';
import {TransactionSerializer} from './db/transactionSerializer.service';
import {EngineFactory} from './engine/engineFactory.service';
import {Device} from 'ionic-native';
import {PriceFormat} from './priceFormat';
import {UppercaseDirective} from './uppercase';
import {NoFocusDirective} from './nofocus';

JL().info("Reading App");

@Component({
  templateUrl: 'build/app.html',
  directives: [MainMenuContent]
})
export class BudgetApp {
  rootPage: any;// = HomePage;
  ready: boolean;
  @ViewChild(Nav) nav: Nav

  constructor(platform: Platform, configuration : Configuration, dbms : Dbms, persistenceProviderManager : PersistenceProviderManager) {
    JL().info("Constructing App");
    
    platform.ready().then(() => {
      JL().info("Platform Ready");
      if (platform.is("cordova")) {
        JL().info("Running cordova");
        configuration.native = true;
        JL().info("Device Info");
        JL().info(Device.device);
      }
      if (!platform.is("cordova")) {
        JL().info("Running web browser");
        configuration.native = false;
      } 

      JL().info("Initialising Persistence Provider");
      persistenceProviderManager.provide().init().then(() => {
        JL().info("Initialising Persistence Provider");
        JL().info("Loading Configuration");
        return configuration.configure();
      }).then(() => {
        JL().info("Loading Configuration Done");
        JL().info("Initialising Dbms");
        return dbms.init();
      }).then(() => {
        JL().info("Initialising Dbms Done");
        
        // Okay, so the platform is ready and our plugins are available.
        // Here you can do any higher level native things you might need.
        StatusBar.styleDefault();
        
        this.ready = true;
          if (configuration.lastOpenedBudget()) {
            try {
              let budget = dbms.getDb(configuration.lastOpenedBudget());
              this.nav.setRoot(BudgetPage, {'budget' : budget});
            } catch (e) {
              JL().error({msg: "Unable to auto open budget", exception: e});            
              this.nav.setRoot(HomePage);
            }
          } else {
              this.nav.setRoot(HomePage);
          }

        }).catch(err => {
          JL().fatalException("Error in initialisation", err);
        });


      });
    
    
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