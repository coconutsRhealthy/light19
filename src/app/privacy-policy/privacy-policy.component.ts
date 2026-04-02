import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-privacy-policy',
  imports: [FooterComponent, NavbarComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css', './../app.component.css'],
})
export class PrivacyPolicyComponent {

}
