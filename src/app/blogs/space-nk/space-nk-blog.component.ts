import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import { MetaService } from '../../services/meta.service';

const URL = 'https://diski.nl/blogs/space-nk';
const TITLE = 'Space NK kortingscode: 15% korting voor nieuwe klanten | Diski';
const DESCRIPTION =
  'Bespaar op luxe beauty bij Space NK: 15% welkomstkorting voor nieuwe klanten, ' +
  'plus onze favorieten van merken als BYOMA en Drunk Elephant.';

@Component({
  selector: 'app-space-nk-blog',
  imports: [FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './space-nk-blog.component.html',
  styles: ``
})
export class SpaceNkBlogComponent {
  copied = false;

  // See uniqlo-blog.component.ts for why this sits in the constructor.
  constructor(private meta: MetaService) {
    this.meta.updateTitle(TITLE);
    this.meta.updateMetaInfo(DESCRIPTION, 'diski.nl',
      'Space NK, Space NK kortingscode, luxe beauty, BYOMA, Drunk Elephant');
    this.meta.updateOgTags(TITLE, DESCRIPTION, URL, 'article');
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
