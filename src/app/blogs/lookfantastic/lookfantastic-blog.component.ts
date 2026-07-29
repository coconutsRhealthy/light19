import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import { MetaService } from '../../services/meta.service';

const URL = 'https://diski.nl/blogs/lookfantastic/';
const TITLE = 'Lookfantastic kortingscode: bespaar tot 25% | Diski';
const DESCRIPTION =
  'Zo bespaar je het meeste bij Lookfantastic: een werkende kortingscode tot ' +
  '25%, studentenkorting, gratis verzending en de populaire Beauty Box.';

@Component({
  selector: 'app-lookfantastic-blog',
  imports: [FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './lookfantastic-blog.component.html',
  styles: ``
})
export class LookfantasticBlogComponent {
  copied = false;

  // See uniqlo-blog.component.ts for why this sits in the constructor.
  constructor(private meta: MetaService) {
    this.meta.updateTitle(TITLE);
    this.meta.updateMetaInfo(DESCRIPTION, 'diski.nl',
      'Lookfantastic, Lookfantastic kortingscode, beauty, Beauty Box, studentenkorting');
    this.meta.updateOgTags(TITLE, DESCRIPTION, URL, 'article');
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
