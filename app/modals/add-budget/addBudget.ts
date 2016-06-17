import {Page, Modal, NavController, ViewController} from 'ionic-angular';
import {FormBuilder, Validators, ControlGroup} from '@angular/common';

@Page({
  templateUrl: "build/modals/add-budget/add-budget.html"
})
export class AddBudgetModal {
  form: ControlGroup;
  
  constructor(public viewCtrl: ViewController, private formBuilder: FormBuilder) {
    this.viewCtrl = viewCtrl;
    this.form = formBuilder.group({
      budgetName: ["", Validators.required]
    });
    
  }
  
  submit(event : Event) {
    this.viewCtrl.dismiss({"budgetName" :this.form.controls["budgetName"].value});
    event.preventDefault();
  }
  
  cancel() {
    this.viewCtrl.dismiss();    
  }
} 