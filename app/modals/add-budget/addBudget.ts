import {Modal, NavController, ViewController, NavParams} from 'ionic-angular';
import {FormBuilder, Validators, ControlGroup, Control} from '@angular/common';
import {Component} from '@angular/core';

@Component({
  templateUrl: "build/modals/add-budget/add-budget.html"
})
export class AddBudgetModal {
  form: ControlGroup;
  editing: boolean;
  
  constructor(public viewCtrl: ViewController, private formBuilder: FormBuilder, private navParams: NavParams) {
    this.viewCtrl = viewCtrl;
    this.form = formBuilder.group({
      budgetName: ["", Validators.required]
    });

    if (navParams.data && navParams.data.budgetName) {
      this.editing = true;
      (<Control>this.form.controls["budgetName"]).updateValue(navParams.data.budgetName);
    } else {
      this.editing = false;
    }


    
  }
  
  submit(event : Event) {
    this.viewCtrl.dismiss({"budgetName" :this.form.controls["budgetName"].value});
    event.preventDefault();
  }
  
  cancel() {
    this.viewCtrl.dismiss();    
  }
} 