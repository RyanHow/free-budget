import {IONIC_DIRECTIVES, Menu, NavController, Nav, App} from 'ionic-angular';
import {Component, Input, ViewChild} from '@angular/core';
import {Dbms} from '../../db/dbms.service';
import {Db} from '../../db/db';
import {Configuration} from '../../configuration.service';
import {BudgetPage} from '../../pages/budget/budget';
import {HomePage} from '../../pages/home/home';
import {DevPage} from '../../pages/dev/dev';
import {SettingsPage} from '../../pages/settings/settings';

@Component({
  selector: 'main-menu-content',
  templateUrl: 'build/components/main-menu-content/main-menu-content.html',
  directives: [IONIC_DIRECTIVES]
})

export class MainMenuContent {
  
  @Input()
  menu : Menu;
  @Input()
  nav : Nav;
  budgets :Db[];

  constructor(private dbms : Dbms, private app : App, private configuration : Configuration) {
    this.dbms = dbms;
    this.budgets = dbms.dbs;
    this.app = app;
  }
  
  budgetName(budget : Db) : string {
    return budget.name() || "New Budget (" + budget.id + ")";
  }
  
  openBudget(budget : Db) {
    this.configuration.autoOpenBudget(budget.id);
    this.nav.setRoot(BudgetPage, {'budget' : budget});
  }
  
  goHome() {
    this.nav.setRoot(HomePage);
  }
  
  goDev() {
    this.nav.setRoot(DevPage);
  }

  goSettings() {
    this.nav.setRoot(SettingsPage);
  }


}