import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  menuOpen = false;
  menuItems = ['Home', 'Over', 'Diensten', 'Projecten', 'Contact'];

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
