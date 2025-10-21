import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  menuOpen = false;
  menuItems = ['Home', 'Over', 'Diensten', 'Projecten', 'Contact'];

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
