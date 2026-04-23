import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-blogs',
  imports: [FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './blogs.component.html',
  styles: ``
})
export class BlogsComponent {}
