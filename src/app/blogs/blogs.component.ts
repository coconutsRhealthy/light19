import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

interface BlogPost {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  emoji: string;
  // Tailwind bg utility for the card's image block (brand palette, no images).
  tint: string;
}

@Component({
  selector: 'app-blogs',
  imports: [FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './blogs.component.html',
  styles: ``
})
export class BlogsComponent {
  posts: BlogPost[] = [
    {
      slug: 'uniqlo',
      category: 'Fashion & Style',
      title: 'Uniqlo AIRism — 5 summer pieces that keep you cool',
      excerpt: 'The five best AIRism pieces to build your summer wardrobe around — plus how the quick-dry fabric actually works, and an FAQ.',
      date: 'Juni 2025',
      emoji: '👕',
      tint: 'tw-bg-sky',
    },
    {
      slug: 'lookfantastic',
      category: 'Beauty & Skincare',
      title: 'Lookfantastic kortingscode — bespaar tot 25% op beauty',
      excerpt: 'Zo bespaar je het meeste bij Lookfantastic: van kortingscode en studentenkorting tot de populaire Beauty Box en FAQ.',
      date: 'Juni 2026',
      emoji: '✨',
      tint: 'tw-bg-butter',
    },
    {
      slug: 'space-nk',
      category: 'Beauty & Skincare',
      title: 'Space NK kortingscode — bespaar op luxe beauty',
      excerpt: 'De beste manieren om te besparen bij Space NK. Inclusief welkomstcode, productaanbevelingen en stap-voor-stap uitleg.',
      date: 'April 2026',
      emoji: '💄',
      tint: 'tw-bg-dot/40',
    },
  ];

  // The newest post leads as the featured article; the rest fill the grid.
  get featured(): BlogPost {
    return this.posts[0];
  }
  get rest(): BlogPost[] {
    return this.posts.slice(1);
  }
}
