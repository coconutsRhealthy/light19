import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor() {}

  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenuOnNavigate() {
    if (window.innerWidth < 640) {
      this.menuOpen = false;
    }
  }

  get screenIsLarge(): boolean {
    return window.innerWidth >= 640;
  }
}
