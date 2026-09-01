import { Component, afterNextRender } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MetaService } from '../services/meta.service';

const URL = 'https://diski.nl/actievoorwaarden/';
const TITLE = 'Actievoorwaarden "Nodig vrienden uit" | Diski';
const DESCRIPTION =
  'De actievoorwaarden van de wekelijkse winactie in de diski-app: wie mag ' +
  'meedoen, hoe je meedoet, hoe de trekking verloopt en hoe de prijs wordt ' +
  'uitgekeerd.';

/**
 * Legal page for the in-app referral giveaway. The app links here from
 * Profiel -> Nodig vrienden uit, and the Gedragscode promotionele kansspelen
 * 2014 requires the terms to be published somewhere findable.
 *
 * noindex: this exists to be reachable and citable, not to rank. It is
 * deliberately kept out of the sitemap too (see scripts/fill-routes.js).
 */
@Component({
  selector: 'app-actievoorwaarden',
  imports: [FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './actievoorwaarden.component.html',
  styles: ``,
})
export class ActievoorwaardenComponent {

  // Rendered ONLY in the browser, after hydration. Cloudflare's email
  // obfuscation rewrites any address sitting in prerendered HTML, which breaks
  // Angular hydration and strips the URL back to root — see contact.component.ts.
  // Empty during SSR and the first client paint so hydration matches, then filled.
  email = '';
  // Static copy, so the tags are set in the constructor like the other content
  // pages — they must be in place for the prerender.
  constructor(private meta: MetaService) {
    this.meta.updateTitle(TITLE);
    this.meta.updateMetaInfo(DESCRIPTION, 'diski.nl', 'actievoorwaarden, winactie, diski app');
    this.meta.updateOgTags(TITLE, DESCRIPTION, URL);
    this.meta.setNoIndex();

    afterNextRender(() => {
      this.email = 'info' + '@' + 'diski.nl';
    });
  }
}
