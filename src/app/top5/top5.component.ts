import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { MetaService } from '../services/meta.service';

interface TopShop {
  name: string;
  url: string;
}

@Component({
  selector: 'app-top5',
  imports: [FooterComponent, NavbarComponent],
  templateUrl: './top5.component.html',
  styleUrls: ['./top5.component.css']
})
export class Top5Component {
  currentMonth: string;

  categories: { title: string; shops: TopShop[] }[] = [
    {
      title: 'Beauty',
      shops: [
        { name: 'Douglas', url: 'https://www.douglas.nl' },
        { name: 'The Body Shop', url: 'https://www.thebodyshop.com' },
        { name: 'ICI Paris XL', url: 'https://www.iciparisxl.nl' },
        { name: 'Sephora', url: 'https://www.sephora.com' },
        { name: 'Rituals', url: 'https://www.rituals.com' }
      ]
    },
    {
      title: 'Fashion',
      shops: [
        { name: 'Zalando', url: 'https://www.zalando.nl' },
        { name: 'ASOS', url: 'https://www.asos.com' },
        { name: 'H&M', url: 'https://www2.hm.com' },
        { name: 'Nike', url: 'https://www.nike.com' },
        { name: 'Adidas', url: 'https://www.adidas.com' }
      ]
    },
    {
      title: 'Lifestyle',
      shops: [
        { name: 'Bol.com', url: 'https://www.bol.com' },
        { name: 'Coolblue', url: 'https://www.coolblue.nl' },
        { name: 'FonQ', url: 'https://www.fonq.nl' },
        { name: 'HEMA', url: 'https://www.hema.nl' },
        { name: 'Blokker', url: 'https://www.blokker.nl' }
      ]
    },
    {
      title: 'Sport',
      shops: [
        { name: 'Decathlon', url: 'https://www.decathlon.nl' },
        { name: 'Intersport', url: 'https://www.intersport.nl' },
        { name: 'Nike', url: 'https://www.nike.com' },
        { name: 'Adidas', url: 'https://www.adidas.com' },
        { name: 'Puma', url: 'https://www.puma.com' }
      ]
    },
    {
      title: 'Bespaartips',
      shops: [
        { name: 'Secret Sales', url: '...' },
        { name: 'Etsy', url: '...' },
        { name: 'Eurojackpot', url: '...' },
        { name: 'Lucky Day', url: '...' },
        { name: 'CashbackXL', url: '...' }
      ]
    },
    {
      title: 'Deals',
      shops: [
        { name: 'Otrium', url: '...' },
        { name: 'Action', url: '...' },
        { name: 'Lounge by Zalando', url: '...' },
        { name: 'Aliexpress', url: '...' },
        { name: 'Temu', url: '...' }
      ]
    },
    {
      title: 'Electronica',
      shops: [
        { name: 'Dyson', url: '...' },
        { name: 'Shark', url: '...' },
        { name: 'Samsung', url: '...' },
        { name: 'Coolblue', url: '...' },
        { name: 'Amazon', url: '...' }
      ]
    },
    {
      title: 'Huis & Tuin',
      shops: [
        { name: 'VidaXL', url: '...' },
        { name: '123jaloezie', url: '...' },
        { name: 'Lampenlicht', url: '...' },
        { name: 'Tuinmeubelshop', url: '...' },
        { name: 'NADUVI', url: '...' }
      ]
    },
    {
      title: 'Koken',
      shops: [
        { name: 'KitchenAid', url: '...' },
        { name: 'Ninja', url: '...' },
        { name: 'Tefal', url: '...' },
        { name: 'Picnic', url: '...' },
        { name: 'HelloFresh', url: '...' }
      ]
    }
  ];

  categoriesOpen: boolean[] = [];

  constructor(private meta: MetaService) {
    this.meta.setNoIndex()
    const today = new Date();
    const monthName = today.toLocaleString('nl-NL', { month: 'long' });
    const year = today.getFullYear();
    this.currentMonth = `${monthName} ${year}`;

    this.categoriesOpen = this.categories.map(() => false);
  }

  toggleCategory(index: number) {
    this.categoriesOpen[index] = !this.categoriesOpen[index];
  }
}
