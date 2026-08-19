import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
// Both bars are commented out with their tags in navbar.component.html (waitlist
// 2026-07-31, boodschappen 2026-08-19). Angular warns (TS-998113) about a standalone
// import the template no longer uses, so each import has to be re-enabled together
// with its tag.
// import { AppWaitlistBarComponent } from '../app-waitlist-bar/app-waitlist-bar.component';
// import { BoodschappenBarComponent } from '../boodschappen-bar/boodschappen-bar.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule /*, BoodschappenBarComponent, AppWaitlistBarComponent */],
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
