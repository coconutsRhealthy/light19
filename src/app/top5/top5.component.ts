import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { AffiliateLinkService } from '../services/affiliate-link.service';
import { LogosService } from '../services/logos.service';
import { AnalyticsEventService } from '../services/analytics-event.service';
import { MetaService } from '../services/meta.service';

interface TopShop {
  name: string;
  url: string;
  affiliateKey?: string;
}

interface Category {
  title: string;
  shops: TopShop[];
}

@Component({
  selector: 'app-top5',
  imports: [FooterComponent, NavbarComponent],
  templateUrl: './top5.component.html',
  styleUrls: ['./top5.component.css', './../app.component.css']
})
export class Top5Component {
  currentMonth: string;
  logos: { [companyName: string]: string } = {};

  // -1 = "Alle categorieën" (the default): show every category's Top 5.
  // A concrete index narrows the view to just that one category.
  selectedIndex = -1;

  get activeCategory(): Category {
    return this.categories[this.selectedIndex];
  }

  /** Categories to render: all of them in "Alle categorieën" mode, else just the picked one. */
  get visibleCategories(): Category[] {
    return this.selectedIndex < 0 ? this.categories : [this.categories[this.selectedIndex]];
  }

  categories: Category[] = [
    {
      title: 'Baby & Kind',
      shops: [
        { name: 'Kinder Wonderland', url: 'https://www.kinderwonderland.nl', affiliateKey: 'kinderwonderland' },
        { name: 'Prenatal', url: 'https://www.prenatal.nl', affiliateKey: 'prenatal' },
        { name: 'Bugaboo', url: 'https://www.bugaboo.com/nl-nl', affiliateKey: 'bugaboo' },
        { name: 'kidzsupplies', url: 'https://www.kidzsupplies.nl', affiliateKey: 'kidzsupplies' },
        { name: 'Pink & Blue', url: 'https://pinkandbluekidswear.nl', affiliateKey: 'pinkandblue' }
      ]
    },
    {
      title: 'Beauty',
      shops: [
        { name: 'LOOKFANTASTIC', url: 'https://www.lookfantastic.nl', affiliateKey: 'lookfantastic' },
        { name: 'Space NK', url: 'https://www.spacenk.com', affiliateKey: 'spacenk.com' },
        { name: 'ICI Paris XL', url: 'https://www.iciparisxl.nl', affiliateKey: 'iciparisxl' },
        { name: 'Parfumdreams', url: 'https://www.parfumdreams.nl', affiliateKey: 'parfumdreams.nl' },
        { name: 'Olivida', url: 'https://www.olivida.nl', affiliateKey: 'olivida.nl' }
      ]
    },
    {
      title: 'Bespaartips',
      shops: [
        { name: 'Secret Sales', url: 'https://www.secretsales.com/nl', affiliateKey: 'secretsales.nl' },
        { name: 'Etsy', url: 'https://www.etsy.com/nl', affiliateKey: 'etsy'  },
        { name: 'Eurojackpot', url: 'https://www.eurojackpot.nl', affiliateKey: 'eurojackpot' },
        { name: 'Lucky Day', url: 'https://www.luckyday.nl', affiliateKey: 'luckyday' },
        { name: 'CashbackXL', url: 'https://www.cashbackxl.nl', affiliateKey: 'cashbackxl' }
      ]
    },
    {
      title: 'Cadeaus',
      shops: [
        { name: 'Bol.com', url: 'https://www.bol.com/nl/nl', affiliateKey: 'bol.com' },
        { name: 'Amazon', url: 'https://www.amazon.nl', affiliateKey: 'amazon' },
        { name: 'iBood', url: 'https://www.ibood.com', affiliateKey: 'ibood' },
        { name: 'Greetz', url: 'https://www.greetz.nl', affiliateKey: 'greetz.nl' },
        { name: 'Bijenkorf', url: 'https://www.debijenkorf.nl', affiliateKey: 'bijenkorf' },
      ]
    },
    {
      title: 'Computer & Software',
      shops: [
        { name: 'Acer', url: 'https://www.acer.com/nl-nl', affiliateKey: 'acer' },
        { name: 'Asus', url: 'https://www.asus.com/nl', affiliateKey: 'asus' },
        { name: 'Logitech', url: 'https://www.logitech.com/nl-nl', affiliateKey: 'logitech' },
        { name: 'NordVPN', url: 'https://www.nordvpn.com/nl', affiliateKey: 'nordvpn' },
        { name: 'Dell', url: 'https://www.dell.com/nl-nl', affiliateKey: 'dell' },
      ]
    },
    {
      title: 'Dagje uit',
      shops: [
        { name: 'VakantieVeilingen', url: 'https://www.vakantieveilingen.nl', affiliateKey: 'vakantieveilingen' },
        { name: 'Efteling', url: 'https://www.efteling.com', affiliateKey: 'efteling' },
        { name: 'Landal', url: 'https://www.landal.nl', affiliateKey: 'landal' },
        { name: 'Walibi', url: 'https://www.walibi.nl', affiliateKey: 'walibi' },
        { name: 'Pathé', url: 'https://www.pathe.nl', affiliateKey: 'pathe' },
      ]
    },
    {
      title: 'Deals',
      shops: [
        { name: 'Otrium', url: 'https://www.otrium.nl', affiliateKey: 'otrium' },
        { name: 'Action', url: 'https://www.action.com/nl-nl', affiliateKey: 'action' },
        { name: 'Lounge by Zalando', url: 'https://www.zalando-lounge.nl', affiliateKey: 'lounge by zalando' },
        { name: 'AliExpress', url: 'https://www.aliexpress.com', affiliateKey: 'aliexpress' },
        { name: 'Temu', url: 'https://www.temu.com', affiliateKey: 'temu' }
      ]
    },
    {
      title: 'Dieren',
      shops: [
        { name: 'Zooplus', url: 'https://www.zooplus.nl', affiliateKey: 'zooplus.nl' },
        { name: 'Just Russel', url: 'https://www.justrussel.com/nl', affiliateKey: 'justrussel.nl' },
        { name: 'Bol.com', url: 'https://www.bol.com/nl/nl', affiliateKey: 'bol.com' },
        { name: 'Pets Place', url: 'https://www.petsplace.nl', affiliateKey: 'petsplace' },
        { name: 'Welkoop', url: 'https://www.welkoop.nl', affiliateKey: 'welkoop' }
      ]
    },
    {
      title: 'Electronica',
      shops: [
        { name: 'Dyson', url: 'https://www.dyson.nl', affiliateKey: 'dyson' },
        { name: 'Ninja', url: 'https://www.ninjakitchen.nl', affiliateKey: 'ninjakitchen' },
        { name: 'Samsung', url: 'https://www.samsung.com/nl', affiliateKey: 'samsung' },
        { name: 'Coolblue', url: 'https://www.coolblue.nl', affiliateKey: 'coolblue' },
        { name: 'Amazon', url: 'https://www.amazon.nl', affiliateKey: 'amazon' }
      ]
    },
    {
      title: 'Eten & Drinken',
      shops: [
        { name: 'PLUS', url: 'https://www.plus.nl', affiliateKey: 'plus' },
        { name: 'Megafoodstunter', url: 'https://www.megafoodstunter.nl', affiliateKey: 'megafoodstunter' },
        { name: 'Picnic', url: 'https://www.picnic.nl', affiliateKey: 'picnic' },
        { name: 'Thuisbezorgd', url: 'https://www.thuisbezorgd.nl', affiliateKey: 'thuisbezorgd' },
        { name: 'HelloFresh', url: 'https://www.hellofresh.nl', affiliateKey: 'hellofresh.nl' }
      ]
    },
    {
      title: 'Finance',
      shops: [
        { name: 'Revolut', url: 'https://www.revolut.com/nl-NL', affiliateKey: 'revolut' },
        { name: 'GoDutch', url: 'https://www.godutch.com', affiliateKey: 'godutch' },
        { name: 'Centraal Beheer', url: 'https://www.centraalbeheer.nl', affiliateKey: 'centraalbeheer' },
        { name: 'Brand New Day', url: 'https://www.brandnewday.nl', affiliateKey: 'brandnewday' },
        { name: 'Bunq', url: 'https://www.bunq.com/nl', affiliateKey: 'bunq' }
      ]
    },
    {
      title: 'Foto & Print',
      shops: [
        { name: 'Albelli', url: 'https://www.albelli.nl', affiliateKey: 'albelli' },
        { name: 'PrintAbout', url: 'https://www.printabout.nl', affiliateKey: 'printabout' },
        { name: 'Fotofabriek', url: 'https://www.fotofabriek.nl', affiliateKey: 'fotofabriek' },
        { name: 'Smartphoto', url: 'https://www.smartphoto.nl', affiliateKey: 'smartphoto.nl' },
        { name: 'MyPoster', url: 'https://www.myposter.nl', affiliateKey: 'myposter' }
      ]
    },
    {
      title: 'Huis & Tuin',
      shops: [
        { name: 'VidaXL', url: 'https://www.vidaxl.nl', affiliateKey: 'vidaxl' },
        { name: 'Tuinmeubelshop', url: 'https://www.tuinmeubelshop.nl', affiliateKey: 'tuinmeubelshop.nl' },
        { name: 'NADUVI', url: 'https://www.naduvi.nl', affiliateKey: 'naduvi.nl' },
        { name: '123jaloezie', url: 'https://www.123jaloezie.nl', affiliateKey: '123jaloezie.nl' },
        { name: 'Lampenlicht', url: 'https://www.lampenlicht.nl', affiliateKey: 'lampenlicht.nl' }
      ]
    },
    {
      title: 'Internetproviders',
      shops: [
        { name: 'Independer', url: 'https://www.independer.nl', affiliateKey: 'Independer Zorg' },
        { name: 'Ziggo', url: 'https://www.ziggo.nl', affiliateKey: 'ziggo' },
        { name: 'KPN', url: 'https://www.kpn.com', affiliateKey: 'kpn' },
        { name: 'Odido', url: 'https://www.odido.nl', affiliateKey: 'odido mobiel' },
        { name: 'United Consumers', url: 'https://www.unitedconsumers.com', affiliateKey: 'unitedconsumers' }
      ]
    },
    {
      title: 'Koken',
      shops: [
        { name: 'Ninja', url: 'https://www.ninjakitchen.nl', affiliateKey: 'ninjakitchen' },
        { name: 'KitchenAid', url: 'https://www.kitchenaid.nl', affiliateKey: 'kitchenaid' },
        { name: 'DeLonghi', url: 'https://www.delonghi.com/nl-nl', affiliateKey: 'delonghi' },
        { name: 'Tefal', url: 'https://www.tefal.nl', affiliateKey: 'tefal' },
        { name: 'Smeg', url: 'https://www.smeg.com/nl', affiliateKey: 'smeg' }
      ]
    },
    {
      title: 'Mobiliteit',
      shops: [
        { name: 'Tenways', url: 'https://www.tenways.com', affiliateKey: 'tenways' },
        { name: 'Veloretti', url: 'https://www.veloretti.com', affiliateKey: 'veloretti' },
        { name: 'Gazelle', url: 'https://www.gazelle.nl', affiliateKey: 'gazelle' },
        { name: 'VanMoof', url: 'https://www.vanmoof.com', affiliateKey: 'vanmoof' },
        { name: 'Grundig', url: 'https://www.grundig-bike.com', affiliateKey: 'grundig' }
      ]
    },
    {
      title: 'Mode man',
      shops: [
        { name: 'Muchachomalo', url: 'https://www.muchachomalo.com', affiliateKey: 'muchachomalo' },
        { name: 'Lounge by Zalando', url: 'https://www.zalando-lounge.nl', affiliateKey: 'lounge by zalando' },
        { name: 'JHP Fashion', url: 'https://www.jhpfashion.nl', affiliateKey: 'jhpfashion.nl' },
        { name: 'Jeans Centre', url: 'https://www.jeanscentre.nl', affiliateKey: 'jeanscentre.nl' },
        { name: 'boohooMAN', url: 'https://www.boohooman.com', affiliateKey: 'boohooman' }
      ]
    },
    {
      title: 'Mode vrouw',
      shops: [
        { name: 'NA-KD', url: 'https://www.na-kd.com/nl', affiliateKey: 'nakdfashion' },
        { name: 'Hunkemoller', url: 'https://www.hunkemoller.nl', affiliateKey: 'hunkemoller' },
        { name: 'Stradivarius', url: 'https://www.stradivarius.com/nl', affiliateKey: 'stradivarius' },
        { name: 'Boohoo.com', url: 'https://www.boohoo.com', affiliateKey: 'boohoo' },
        { name: 'Shein', url: 'https://www.shein.com', affiliateKey: 'shein' }
      ]
    },
    {
      title: 'Reizen',
      shops: [
        { name: 'Booking.com', url: 'https://www.booking.com', affiliateKey: 'booking.com' },
        { name: 'Sixt', url: 'https://www.sixt.nl', affiliateKey: 'sixt' },
        { name: 'Flixbus', url: 'https://www.flixbus.nl', affiliateKey: 'flixbus' },
        { name: 'eDreams', url: 'https://www.edreams.nl', affiliateKey: 'edreams' },
        { name: 'ANWB Webwinkel', url: 'https://www.anwb.nl', affiliateKey: 'anwbwinkel' },
      ]
    },
    {
      title: 'Sieraden',
      shops: [
        { name: 'Melano Jewelry', url: 'https://www.melanojewelry.com', affiliateKey: 'melanojewelry' },
        { name: 'Je mappelle', url: 'https://www.jemappelle.nl', affiliateKey: 'jemappelle' },
        { name: 'Daniel Wellington', url: 'https://www.danielwellington.com/nl', affiliateKey: 'danielwellington' },
        { name: 'My Jewellery', url: 'https://www.my-jewellery.com/nl-nl', affiliateKey: 'myjewellery' },
        { name: 'iPhone Cases', url: 'https://www.iphonecases.nl', affiliateKey: 'iphone-cases.nl' }
      ]
    },
    {
      title: 'Slapen',
      shops: [
        { name: 'Zelesta', url: 'https://www.zelesta.nl', affiliateKey: 'zelesta.nl' },
        { name: 'Emma', url: 'https://www.emma-sleep.nl', affiliateKey: 'emmasleepnl' },
        { name: 'Matt Sleeps', url: 'https://www.mattsleeps.com/nl' },
        { name: 'Tempur', url: 'https://www.tempur.nl' },
        { name: 'Auping', url: 'https://www.auping.com/nl' }
      ]
    },
    {
      title: 'Sneakers',
      shops: [
        { name: 'Nike', url: 'https://www.nike.com/nl', affiliateKey: 'nike' },
        { name: 'adidas', url: 'https://www.adidas.nl', affiliateKey: 'adidas' },
        { name: 'JD Sports', url: 'https://www.jdsports.nl' },
        { name: 'Size?', url: 'https://www.sizeofficial.nl', affiliateKey: 'size' },
        { name: 'Foot Locker', url: 'https://www.footlocker.nl', affiliateKey: 'footlocker' }
      ]
    },
    {
      title: 'Sport',
      shops: [
        { name: 'Aybl', url: 'https://www.aybl.com' },
        { name: 'Gymshark', url: 'https://www.gymshark.com/nl', affiliateKey: 'gymshark' },
        { name: 'Plutosport', url: 'https://www.plutosport.nl', affiliateKey: 'plutosport' },
        { name: 'Tennispoint', url: 'https://www.tennispoint.nl', affiliateKey: 'tennis-point.nl' },
        { name: 'Bergfreunde', url: 'https://www.bergfreunde.nl' }
      ]
    },
    {
      title: 'Streaming',
      shops: [
        { name: 'CANAL+', url: 'https://www.canalplus.com' },
        { name: 'SkyShowtime', url: 'https://www.skyshowtime.com/nl' },
        { name: 'Amazon Prime', url: 'https://www.primevideo.com' },
        { name: 'HBO', url: 'https://www.hbomax.com/nl' },
        { name: 'Disney+', url: 'https://www.disneyplus.com/nl' }
      ]
    },
    {
      title: 'Supplementen',
      shops: [
        { name: 'Myprotein', url: 'https://www.myprotein.nl', affiliateKey: 'myproteinnl' },
        { name: 'Lucovitaal', url: 'https://www.lucovitaal.nl', affiliateKey: 'lucovitaal' },
        { name: 'Bulk', url: 'https://www.bulk.com/nl', affiliateKey: 'bulk.com' },
        { name: 'Vitaepro', url: 'https://www.vitaepro.nl', affiliateKey: 'vitaepro.nl' },
        { name: 'Bodylab', url: 'https://www.bodylab.nl', affiliateKey: 'bodylab.nl' }
      ]
    },
    {
      title: 'Telefoonabonnementen',
      shops: [
        { name: '50plus Mobiel', url: 'https://www.50plusmobiel.nl', affiliateKey: '50plusmobiel' },
        { name: 'Ben', url: 'https://www.ben.nl' },
        { name: 'Ziggo', url: 'https://www.ziggo.nl', affiliateKey: 'ziggo' },
        { name: 'Odido Mobiel', url: 'https://www.odido.nl/mobiel', affiliateKey: 'odido mobiel' },
        { name: 'Simyo', url: 'https://www.simyo.nl' }
      ]
    },
    {
      title: 'Verzekeringen',
      shops: [
        { name: 'FBTO', url: 'https://www.fbto.nl', affiliateKey: 'FBTO Zorg' },
        { name: 'Figopet', url: 'https://www.figopet.nl' },
        { name: 'Insify', url: 'https://www.insify.nl' },
        { name: 'ASR', url: 'https://www.asr.nl' },
        { name: 'Centraal Beheer', url: 'https://www.centraalbeheer.nl' }
      ]
    },
    {
      title: 'Zorgverzekeringen',
      shops: [
        { name: 'FBTO', url: 'https://www.fbto.nl', affiliateKey: 'FBTO Zorg' },
        { name: 'Zorgkiezer', url: 'https://www.zorgkiezer.nl', affiliateKey: 'zorgkiezer' },
        { name: 'Independer', url: 'https://www.independer.nl', affiliateKey: 'Independer Zorg' },
        { name: 'Vink Vink', url: 'https://www.vinkvink.nl' },
        { name: 'ASR', url: 'https://www.asr.nl' }
      ]
    }
  ];

  ngOnInit() {
    this.logosService.getAllLogos().subscribe(data => {
      this.logos = data;
    });
  }

  constructor(private affiliateLinkService: AffiliateLinkService, private logosService: LogosService, private analyticsEventService: AnalyticsEventService, private meta: MetaService) {
    const today = new Date();
    const monthName = today.toLocaleString('nl-NL', { month: 'long' });
    const year = today.getFullYear();

    this.currentMonth = `${monthName} ${year}`;

    // Without this the page inherited the generic index.html head — it was the
    // last route in the build still serving the homepage <title>.
    const title = `Top 5 beste webshops per categorie in ${this.currentMonth} | Diski`;
    const description =
      `De vijf populairste webshops per categorie in ${this.currentMonth}: van mode en ` +
      `sneakers tot wonen, elektronica en reizen. Met de kortingscodes die er werken.`;
    this.meta.updateTitle(title);
    this.meta.updateMetaInfo(description, 'diski.nl',
      'top 5 webshops, beste webshops, kortingscode, online shoppen per categorie');
    this.meta.updateOgTags(title, description, 'https://diski.nl/top5/');
  }

  /** Switch the visible category. */
  selectCategory(index: number): void {
    this.selectedIndex = index;
  }

  resolveShopUrl(shop: TopShop): string {
    const key = shop.affiliateKey?.trim();

    if (!key) {
      return shop.url;
    }

    const affiliateUrl = this.affiliateLinkService.getAffiliateLink(key);
    return affiliateUrl || shop.url;
  }

  // Only called from the template when hasLogo(shop) is true, so a real logo exists.
  getLogoUrl(shop: TopShop): string {
    const key = shop.affiliateKey?.trim();
    return (key && this.logos[key]) || '';
  }

  /** True when the shop has a real logo (not just the generic fallback). */
  hasLogo(shop: TopShop): boolean {
    const key = shop.affiliateKey?.trim();
    return !!key && this.logos[key] !== undefined;
  }

  /** First letter for the no-logo placeholder tile. */
  logoInitial(shop: TopShop): string {
    return (shop.name?.trim().charAt(0) || '?').toUpperCase();
  }

  sendEventToGa(shop: TopShop): void {
    this.analyticsEventService.sendEventToGa(
      'Top5',
      'top5_' + shop.name
    );
  }
}
