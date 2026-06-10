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
      'We delen graag jouw kortingscode met duizenden shoppers en staan open voor een langere samenwerking. Van een simpele plaatsing tot een revenue-share of cross-promotie — mail info@diski.nl en we denken graag mee.',
      'diski.nl',
      'samenwerken met Diski, kortingscode delen, partnership, revenue share, influencer korting, code insturen'
    );
  }
}
