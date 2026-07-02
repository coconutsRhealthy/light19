import { Component, afterNextRender } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MetaService } from '../services/meta.service';

@Component({
  selector: 'app-contact',
  imports: [FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './contact.component.html'
})
export class ContactComponent {

  // The contact email is rendered ONLY in the browser, after hydration. If it
  // sits in the prerendered HTML, Cloudflare's email-obfuscation rewrites the
  // text node, which breaks Angular hydration (the URL strips back to root).
  // Empty during SSR + first client paint (so hydration matches), then filled.
  contactEmail = '';

  constructor(private meta: MetaService) {
    this.meta.updateTitle("Neem Contact Op met Diski | Kortingscodes en Samenwerkingen");
    this.meta.updateMetaInfo("Duizenden online shoppers maken gebruik van de kortingscodes die Diski deelt. Heb je vragen, verzoeken of ideeën voor samenwerkingen of adverteren? Neem contact op en ontdek hoe we samen kunnen werken via Diski.nl en @wiegeeftkorting.", "diski.nl", "Samenwerken met Diski, Adverteren op kortingscode platform, Kortingscodes voor online shoppers, Samenwerkingen met bedrijven");

    afterNextRender(() => {
      this.contactEmail = 'info' + '@' + 'diski.nl';
    });
  }

}
