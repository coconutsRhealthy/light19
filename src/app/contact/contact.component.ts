import { Component, OnInit, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MetaService } from '../services/meta.service';

@Component({
  selector: 'app-contact',
  imports: [FooterComponent, NavbarComponent, FormsModule, RouterLink],
  templateUrl: './contact.component.html'
})
export class ContactComponent implements OnInit {

  // Bound to the contact form. There's no backend mailer, so the form composes
  // a mailto: in the browser on submit — keeping the email out of prerendered
  // HTML (avoids the Cloudflare email-obfuscation hydration bug).
  name = '';
  email = '';
  subject = '';
  message = '';

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

  ngOnInit(): void {
  }

  /** Open the visitor's mail client with the message pre-filled. */
  submit(): void {
    const to = 'info' + '@' + 'diski.nl';
    const subject = this.subject.trim() || 'Bericht via diski.nl';
    const sender = this.name.trim() + (this.email.trim() ? ` (${this.email.trim()})` : '');
    const body = `${this.message.trim()}\n\n— ${sender}`;
    window.location.href =
      `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

}
