import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppWaitlistBarComponent } from '../app-waitlist-bar/app-waitlist-bar.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, AppWaitlistBarComponent],
  templateUrl: './navbar.component.html',
  // The host must generate no box of its own, or it would sit between the page
  // and the sticky wrapper in the template and break the wrapper's stickiness.
  styles: [':host { display: contents; }'],
})
export class NavbarComponent {
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
