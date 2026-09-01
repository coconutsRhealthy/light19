import { Component, afterNextRender } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MetaService } from '../services/meta.service';

@Component({
  selector: 'app-privacy-policy',
  imports: [FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css', './../app.component.css'],
})
export class PrivacyPolicyComponent {

  // Rendered ONLY in the browser, after hydration. Cloudflare's email
  // obfuscation rewrites any address sitting in prerendered HTML, which breaks
  // Angular hydration and strips the URL back to root — see contact.component.ts.
  // Empty during SSR and the first client paint so hydration matches, then filled.
  email = '';

  constructor(private meta: MetaService) {
    const title = "Privacyverklaring | Diski.nl";
    const description = "Lees hoe Diski (LWPH Media) omgaat met je persoonsgegevens op diski.nl en in de diski-app: welke gegevens wij verwerken, de first-party gebruiksgegevens, hoe lang we bewaren en hoe je je account verwijdert.";
    this.meta.updateTitle(title);
    this.meta.updateMetaInfo(description, "diski.nl", "Privacyverklaring Diski, Privacybeleid kortingscodes, Persoonsgegevens AVG, Cookies en lokale opslag");
    this.meta.updateOgTags(title, description, "https://diski.nl/privacy-policy/");

    afterNextRender(() => {
      this.email = 'info' + '@' + 'diski.nl';
    });
  }

}
