import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-uniqlo-blog',
  imports: [FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './uniqlo-blog.component.html',
  styles: ``
})
export class UniqloBlogComponent {
  copied = false;

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
