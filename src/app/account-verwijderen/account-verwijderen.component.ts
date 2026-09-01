import { Component, afterNextRender } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MetaService } from '../services/meta.service';

const URL = 'https://diski.nl/account-verwijderen/';
const TITLE = 'Account of gegevens verwijderen bij diski | Diski';
const DESCRIPTION =
  'Zo verwijder je je diski-account of losse gegevens: in de app via Profiel → ' +
  'Verwijder account, of per e-mail. Inclusief wat er precies wordt gewist en ' +
  'binnen welke termijn.';

/**
 * The URL filled in at BOTH "Delete account URL" and "Delete data URL" in the
 * Play Console Data Safety form. Google fetches it during review, so it has to
 * resolve to this page rather than falling through to the homepage.
 *
 * Google checks three things and the copy covers all three: the app/developer is
 * named, the steps are prominent, and it states exactly what is deleted or kept
 * and for how long.
 *
 * noindex: it exists to be reachable and citable, not to rank. Kept out of the
 * sitemap as well (see scripts/fill-routes.js).
 */
@Component({
  selector: 'app-account-verwijderen',
  imports: [FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './account-verwijderen.component.html',
  styles: ``,
})
export class AccountVerwijderenComponent {

  // Rendered ONLY in the browser, after hydration. Cloudflare's email
  // obfuscation rewrites any address sitting in prerendered HTML, which breaks
  // Angular hydration and strips the URL back to root — see contact.component.ts.
  // Empty during SSR and the first client paint so hydration matches, then filled.
  email = '';
  constructor(private meta: MetaService) {
    this.meta.updateTitle(TITLE);
    this.meta.updateMetaInfo(DESCRIPTION, 'diski.nl', 'account verwijderen, gegevens verwijderen, diski app');
    this.meta.updateOgTags(TITLE, DESCRIPTION, URL);
    this.meta.setNoIndex();

    afterNextRender(() => {
      this.email = 'info' + '@' + 'diski.nl';
    });
  }
}
