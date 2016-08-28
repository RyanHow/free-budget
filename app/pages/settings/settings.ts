import {Page, NavController} from 'ionic-angular';
import {Configuration} from '../../configuration.service';

@Page({
  templateUrl: 'build/pages/settings/settings.html'
})
export class SettingsPage {
  
  constructor(private nav: NavController, private configuration: Configuration) {
  }
  
    
}
