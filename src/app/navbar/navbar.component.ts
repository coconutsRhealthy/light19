import { Component, Inject } from '@angular/core';
import { NgClass, DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgClass],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  menuOpen = false;
  currentPath: string;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.currentPath = this.normalizePath(this.document.location?.pathname || '/');
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  isActive(path: string, exact = true): boolean {
    const target = this.normalizePath(path);

    return exact
      ? this.currentPath === target
      : this.currentPath.startsWith(target);
  }

  private normalizePath(path: string): string {
    const normalized = path.replace(/\/+$/, '');
    return normalized === '' ? '/' : normalized;
  }
}
