import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import { MetaService } from '../../services/meta.service';

const URL = 'https://diski.nl/blogs/uniqlo';
const TITLE = 'Uniqlo AIRism: 5 zomerstukken die je koel houden | Diski';
const DESCRIPTION =
  "Uniqlo's AIRism is het antwoord op het zomerkleding-dilemma: goed uitzien én " +
  'koel blijven. Dit zijn de 5 stukken die elke euro waard zijn, plus hoe de ' +
  'sneldrogende stof werkt.';

@Component({
  selector: 'app-uniqlo-blog',
  imports: [FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './uniqlo-blog.component.html',
  styles: ``
})
export class UniqloBlogComponent {
  copied = false;

  // Static copy, so the tags are set in the constructor like the other content
  // pages (contact, privacy-policy, prikbord) rather than in ngOnInit — that
  // way they're already in place for the prerender.
  constructor(private meta: MetaService) {
    this.meta.updateTitle(TITLE);
    this.meta.updateMetaInfo(DESCRIPTION, 'diski.nl',
      'Uniqlo, AIRism, Uniqlo AIRism, zomerkleding, Uniqlo kortingscode');
    this.meta.updateOgTags(TITLE, DESCRIPTION, URL, 'article');
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
