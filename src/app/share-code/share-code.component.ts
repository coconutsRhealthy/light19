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
  // Dummy story images for now — swap the src values for the real shareables later.
  // Vertical 9:16 crops so they preview like an Instagram story.
  storyImages = [
    { src: 'https://picsum.photos/seed/diski1/360/640', alt: 'Diski story afbeelding 1' },
    { src: 'https://picsum.photos/seed/diski2/360/640', alt: 'Diski story afbeelding 2' },
    { src: 'https://picsum.photos/seed/diski3/360/640', alt: 'Diski story afbeelding 3' },
    { src: 'https://picsum.photos/seed/diski4/360/640', alt: 'Diski story afbeelding 4' },
    { src: 'https://picsum.photos/seed/diski5/360/640', alt: 'Diski story afbeelding 5' },
  ];

  constructor(private meta: MetaService) {
    this.meta.updateTitle('Deel jouw kortingscode op Diski | Zo werkt het');
    this.meta.updateMetaInfo(
      'Wil je jouw kortingscode zichtbaar maken voor duizenden shoppers? Deel een Diski-story op Instagram met een link naar diski.nl, mail ons op info@diski.nl en wij zetten jouw code zo snel mogelijk online.',
      'diski.nl',
      'kortingscode delen, code insturen, Diski, samenwerken, influencer korting'
    );
  }
}
