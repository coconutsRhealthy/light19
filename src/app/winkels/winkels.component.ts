import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DiscountsService } from '../services/discounts.service';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-winkels',
  imports: [RouterModule, FooterComponent, NavbarComponent, FormsModule],
  templateUrl: './winkels.component.html',
  styleUrls: ['./winkels.component.css']
})
export class WinkelsComponent implements OnInit {

  allShops: string[] = [];
  offers: { [shop: string]: string } = {};
  letters: string[] = ['Alle'];

  searchTerm = '';
  selectedLetter = 'Alle';
  loading = true;

  constructor(private discountsService: DiscountsService, private meta: MetaService) {}

  ngOnInit(): void {
    this.setMeta();

    this.discountsService.getDiscounts().subscribe((data) => {
      const seen = new Set<string>();
      const shops: string[] = [];

      for (const line of data) {
        const [rawCompany, , percentage] = line.split(', ');
        const shop = this.clean(rawCompany);
        if (!shop) continue;
        // first occurrence in the feed is the latest offer for that shop
        if (!seen.has(shop)) {
          seen.add(shop);
          shops.push(shop);
          this.offers[shop] = percentage;
        }
      }

      this.allShops = shops.sort((a, b) => a.localeCompare(b));
      this.letters = this.buildLetters(this.allShops);
      this.loading = false;
    });
  }

  private clean(company: string): string {
    const i = company.indexOf(' (');
    return (i !== -1 ? company.substring(0, i) : company).trim();
  }

  private buildLetters(shops: string[]): string[] {
    const present = new Set<string>();
    for (const s of shops) {
      const c = s.charAt(0).toUpperCase();
      present.add(/[A-Z]/.test(c) ? c : '#');
    }
    const alpha = Array.from(present).filter(l => l !== '#').sort();
    return ['Alle', ...(present.has('#') ? ['#'] : []), ...alpha];
  }

  get filteredShops(): string[] {
    const term = this.searchTerm.toLowerCase().trim();
    return this.allShops.filter((s) => {
      const okLetter = this.selectedLetter === 'Alle'
        || (this.selectedLetter === '#' ? /^[^a-zA-Z]/.test(s) : s.toUpperCase().startsWith(this.selectedLetter));
      const okText = !term || s.toLowerCase().includes(term);
      return okLetter && okText;
    });
  }

  selectLetter(letter: string): void {
    this.selectedLetter = letter;
  }

  formatOffer(raw: string): string {
    if (!raw) return '';
    return (!raw.includes('€') && !raw.includes('vzk') && !raw.includes('gifts')) ? raw + '%' : raw;
  }

  private setMeta(): void {
    const monthYear = this.meta.getDateString();
    this.meta.updateTitle('Alle winkels met kortingscodes in ' + monthYear);
    this.meta.updateMetaInfo(
      'Overzicht van webshops met werkende kortingscodes in ' + monthYear + '; Bespaar met deze kortingscodes op online shoppen via diski.nl',
      'diski.nl', 'Kortingscode, Korting'
    );
  }
}
