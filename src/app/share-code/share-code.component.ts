import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MetaService } from '../services/meta.service';

@Component({
  selector: 'app-share-code',
  imports: [FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './share-code.component.html',
  styles: ``
})
export class ShareCodeComponent {
  constructor(private meta: MetaService) {
    this.meta.updateTitle('Samenwerken met Diski | Deel jouw kortingscode');
    this.meta.updateMetaInfo(
      'Heb je een eigen kortingscode? Deel hem met de shoppers van Diski. Stuur ons een mailtje, dan kijken we samen wat er mogelijk is — van een plaatsing tot een langere samenwerking.',
      'diski.nl',
      'samenwerken met Diski, kortingscode delen, partnership, influencer korting, code insturen'
    );
  }
}
