import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-space-nk-blog',
  imports: [FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './space-nk-blog.component.html',
  styles: ``
})
export class SpaceNkBlogComponent {
  copied = false;

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
