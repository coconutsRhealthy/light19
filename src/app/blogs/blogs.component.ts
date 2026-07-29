import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MetaService } from '../services/meta.service';

const URL = 'https://diski.nl/blogs/';
const TITLE = 'Blogs over slim shoppen en besparen | Diski';
const DESCRIPTION =
  'Onze artikelen over slim online shoppen: van de beste AIRism-zomerstukken ' +
  'van Uniqlo tot besparen op beauty bij Lookfantastic en Space NK.';

interface BlogPost {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  emoji: string;
  // Tailwind bg utility for the card's image block (brand palette).
  tint: string;
  // Preview image reused from the article itself; falls back to emoji if absent.
  image?: string;
}

@Component({
  selector: 'app-blogs',
  imports: [FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './blogs.component.html',
  styles: ``
})
export class BlogsComponent {
  // See uniqlo-blog.component.ts for why this sits in the constructor.
  constructor(private meta: MetaService) {
    this.meta.updateTitle(TITLE);
    this.meta.updateMetaInfo(DESCRIPTION, 'diski.nl',
      'blog, slim shoppen, besparen, kortingscode, beauty, mode');
    this.meta.updateOgTags(TITLE, DESCRIPTION, URL);
  }

  posts: BlogPost[] = [
    {
      slug: 'uniqlo',
      category: 'Fashion & Style',
      title: 'Uniqlo, 5 zomerpieces die je koel houden',
      excerpt: 'De vijf beste AIRism-stukken om je zomergarderobe rond op te bouwen — plus hoe de sneldrogende stof echt werkt, en een FAQ.',
      date: 'Juni 2026',
      emoji: '👕',
      tint: 'tw-bg-sky',
      image: '/blog/uniqlo/airism-1.avif',
    },
    {
      slug: 'lookfantastic',
      category: 'Beauty & Skincare',
      title: 'Lookfantastic, de plek voor kwaliteit beauty voor een goede prijs',
      excerpt: 'Zo bespaar je het meeste bij Lookfantastic: van kortingscode en studentenkorting tot de populaire Beauty Box en FAQ.',
      date: 'Juni 2026',
      emoji: '✨',
      tint: 'tw-bg-butter',
      image: '/blog/lookfantastic/olaplex.avif',
    },
    {
      slug: 'space-nk',
      category: 'Beauty & Skincare',
      title: 'Space-NK, de site voor luxe beauty met unieke merken',
      excerpt: 'De beste manieren om te besparen bij Space NK. Inclusief welkomstcode, productaanbevelingen en stap-voor-stap uitleg.',
      date: 'April 2026',
      emoji: '💄',
      tint: 'tw-bg-dot/40',
      image: '/blog/space-nk/byoma.jpg',
    },
  ];
}
