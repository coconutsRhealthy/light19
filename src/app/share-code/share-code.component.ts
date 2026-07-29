import { Component, afterNextRender } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MetaService } from '../services/meta.service';

@Component({
  selector: 'app-share-code',
  imports: [FooterComponent, NavbarComponent],
  templateUrl: './share-code.component.html',
  styles: ``
})
export class ShareCodeComponent {

  // Rendered ONLY in the browser, after hydration. A visible email (or mailto)
  // in the prerendered HTML gets rewritten by Cloudflare's email-obfuscation,
  // which breaks Angular hydration (the URL strips back to root). Empty during
  // SSR + first client paint (so hydration matches), then filled. Mirrors the
  // Contact page's approach.
  shareEmail = '';

  constructor(private meta: MetaService) {
    const title = 'Samenwerken met Diski | Deel jouw kortingscode';
    const description =
      'Heb je een eigen kortingscode? Deel hem met de shoppers van Diski. Stuur ons een mailtje, dan kijken we samen wat er mogelijk is — van een plaatsing tot een langere samenwerking.';
    this.meta.updateTitle(title);
    this.meta.updateMetaInfo(
      description,
      'diski.nl',
      'samenwerken met Diski, kortingscode delen, partnership, influencer korting, code insturen'
    );
    this.meta.updateOgTags(title, description, 'https://diski.nl/code-delen/');

    afterNextRender(() => {
      this.shareEmail = 'wouter' + '@' + 'diski.nl';
    });
  }
}
