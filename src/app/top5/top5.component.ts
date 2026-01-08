import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

interface TopShop {
  name: string;
  url: string;
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

  /**
   * Index van de opengeklapte categorie
   * null = alles ingeklapt
   */
  expandedIndexes = new Set<number>();

  categories: Category[] = [
    {
      title: 'Baby & Kind',
      shops: [
        { name: 'Kinder Wonderland', url: 'https://www.kinderwonderland.nl' },
        { name: 'Prenatal', url: 'https://www.prenatal.nl' },
        { name: 'Bugaboo', url: 'https://www.bugaboo.com/nl-nl' },
        { name: 'kidzsupplies', url: 'https://www.kidzsupplies.nl' },
        { name: 'Pink or Blue', url: 'https://www.pinkorblue.nl' }
      ]
    },
    {
      title: 'Beauty',
      shops: [
        { name: 'LOOKFANTASTIC', url: 'https://www.lookfantastic.nl' },
        { name: 'Space NK', url: 'https://www.spacenk.com' },
        { name: 'ICI Paris XL', url: 'https://www.iciparisxl.nl' },
        { name: 'Parfumdreams', url: 'https://www.parfumdreams.nl' },
        { name: 'Olivida', url: 'https://www.olivida.nl' }
      ]
    },
    {
      title: 'Bespaartips',
      shops: [
        { name: 'Secret Sales', url: 'https://www.secretsales.com/nl' },
        { name: 'Etsy', url: 'https://www.etsy.com/nl' },
        { name: 'Eurojackpot', url: 'https://www.eurojackpot.nl' },
        { name: 'Lucky Day', url: 'https://www.luckyday.nl' },
        { name: 'CashbackXL', url: 'https://www.cashbackxl.nl' }
      ]
    },
    {
      title: 'Cadeaus',
      shops: [
        { name: 'Bol.com', url: 'https://www.bol.com/nl/nl' },
        { name: 'Amazon', url: 'https://www.amazon.nl' },
        { name: 'iBood', url: 'https://www.ibood.com' },
        { name: 'Greetz', url: 'https://www.greetz.nl' },
        { name: 'Bijenkorf', url: 'https://www.debijenkorf.nl' }
      ]
    },
    {
      title: 'Computer & Software',
      shops: [
        { name: 'Acer', url: 'https://www.acer.com/nl-nl' },
        { name: 'Asus', url: 'https://www.asus.com/nl' },
        { name: 'Logitech', url: 'https://www.logitech.com/nl-nl' },
        { name: 'NordVPN', url: 'https://www.nordvpn.com/nl' },
        { name: 'Dell', url: 'https://www.dell.com/nl-nl' }
      ]
    },
    {
      title: 'Dagje uit',
      shops: [
        { name: 'VakantieVeilingen', url: 'https://www.vakantieveilingen.nl' },
        { name: 'Efteling', url: 'https://www.efteling.com' },
        { name: 'Landal', url: 'https://www.landal.nl' },
        { name: 'Walibi', url: 'https://www.walibi.nl' },
        { name: 'Pathé', url: 'https://www.pathe.nl' }
      ]
    },
    {
      title: 'Deals',
      shops: [
        { name: 'Otrium', url: 'https://www.otrium.nl' },
        { name: 'Action', url: 'https://www.action.com/nl-nl' },
        { name: 'Lounge by Zalando', url: 'https://www.zalando-lounge.nl' },
        { name: 'AliExpress', url: 'https://www.aliexpress.com' },
        { name: 'Temu', url: 'https://www.temu.com' }
      ]
    },
    {
      title: 'Dieren',
      shops: [
        { name: 'Zooplus', url: 'https://www.zooplus.nl' },
        { name: 'Just Russel', url: 'https://www.justrussel.com/nl' },
        { name: 'Bol.com', url: 'https://www.bol.com/nl/nl' },
        { name: 'Pets Place', url: 'https://www.petsplace.nl' },
        { name: 'Welkoop', url: 'https://www.welkoop.nl' }
      ]
    },
    {
      title: 'Electronica',
      shops: [
        { name: 'Dyson', url: 'https://www.dyson.nl' },
        { name: 'Ninja', url: 'https://www.ninjakitchen.nl' },
        { name: 'Samsung', url: 'https://www.samsung.com/nl' },
        { name: 'Coolblue', url: 'https://www.coolblue.nl' },
        { name: 'Amazon', url: 'https://www.amazon.nl' }
      ]
    },
    {
      title: 'Eten & Drinken',
      shops: [
        { name: 'PLUS', url: 'https://www.plus.nl' },
        { name: 'Megafoodstunter', url: 'https://www.megafoodstunter.nl' },
        { name: 'Picnic', url: 'https://www.picnic.nl' },
        { name: 'Thuisbezorgd', url: 'https://www.thuisbezorgd.nl' },
        { name: 'HelloFresh', url: 'https://www.hellofresh.nl' }
      ]
    },
    {
      title: 'Finance',
      shops: [
        { name: 'Revolut', url: 'https://www.revolut.com/nl-NL' },
        { name: 'GoDutch', url: 'https://www.godutch.com' },
        { name: 'Centraal Beheer', url: 'https://www.centraalbeheer.nl' },
        { name: 'Brand New Day', url: 'https://www.brandnewday.nl' },
        { name: 'Bunq', url: 'https://www.bunq.com/nl' }
      ]
    },
    {
      title: 'Foto & Print',
      shops: [
        { name: 'Albelli', url: 'https://www.albelli.nl' },
        { name: 'PrintAbout', url: 'https://www.printabout.nl' },
        { name: 'Fotofabriek', url: 'https://www.fotofabriek.nl' },
        { name: 'Smartphoto', url: 'https://www.smartphoto.nl' },
        { name: 'MyPoster', url: 'https://www.myposter.nl' }
      ]
    },
    {
      title: 'Huis & Tuin',
      shops: [
        { name: 'VidaXL', url: 'https://www.vidaxl.nl' },
        { name: 'Tuinmeubelshop', url: 'https://www.tuinmeubelshop.nl' },
        { name: 'NADUVI', url: 'https://www.naduvi.nl' },
        { name: '123jaloezie', url: 'https://www.123jaloezie.nl' },
        { name: 'Lampenlicht', url: 'https://www.lampenlicht.nl' }
      ]
    },
    {
      title: 'Internetproviders',
      shops: [
        { name: 'Independer', url: 'https://www.independer.nl' },
        { name: 'Ziggo', url: 'https://www.ziggo.nl' },
        { name: 'KPN', url: 'https://www.kpn.com' },
        { name: 'Odido', url: 'https://www.odido.nl' },
        { name: 'United Consumers', url: 'https://www.unitedconsumers.com' }
      ]
    },
    {
      title: 'Koken',
      shops: [
        { name: 'Ninja', url: 'https://www.ninjakitchen.nl' },
        { name: 'KitchenAid', url: 'https://www.kitchenaid.nl' },
        { name: 'DeLonghi', url: 'https://www.delonghi.com/nl-nl' },
        { name: 'Tefal', url: 'https://www.tefal.nl' },
        { name: 'Smeg', url: 'https://www.smeg.com/nl' }
      ]
    },
    {
      title: 'Mobiliteit',
      shops: [
        { name: 'Tenways', url: 'https://www.tenways.com' },
        { name: 'Veloretti', url: 'https://www.veloretti.com' },
        { name: 'Gazelle', url: 'https://www.gazelle.nl' },
        { name: 'VanMoof', url: 'https://www.vanmoof.com' },
        { name: 'Grundig', url: 'https://www.grundig-bike.com' }
      ]
    },
    {
      title: 'Mode man',
      shops: [
        { name: 'Muchachomalo', url: 'https://www.muchachomalo.com' },
        { name: 'Lounge by Zalando', url: 'https://www.zalando-lounge.nl' },
        { name: 'JHP Fashion', url: 'https://www.jhpfashion.nl' },
        { name: 'Jeans Centre', url: 'https://www.jeanscentre.nl' },
        { name: 'boohooMAN', url: 'https://www.boohooman.com' }
      ]
    },
    {
      title: 'Mode vrouw',
      shops: [
        { name: 'Na-KD', url: 'https://www.na-kd.com/nl' },
        { name: 'Hunkemoller', url: 'https://www.hunkemoller.nl' },
        { name: 'Stradivarius', url: 'https://www.stradivarius.com/nl' },
        { name: 'Boohoo.com', url: 'https://www.boohoo.com' },
        { name: 'Shein', url: 'https://www.shein.com' }
      ]
    },
    {
      title: 'Reizen',
      shops: [
        { name: 'Booking.com', url: 'https://www.booking.com' },
        { name: 'Sixt', url: 'https://www.sixt.nl' },
        { name: 'Flixbus', url: 'https://www.flixbus.nl' },
        { name: 'eDreams', url: 'https://www.edreams.nl' },
        { name: 'ANWB Webwinkel', url: 'https://www.anwb.nl' }
      ]
    },
    {
      title: 'Sieraden',
      shops: [
        { name: 'Melano Jewelry', url: 'https://www.melanojewelry.com' },
        { name: 'Je mappelle', url: 'https://www.jemappelle.nl' },
        { name: 'Daniel Wellington', url: 'https://www.danielwellington.com/nl' },
        { name: 'My Jewellery', url: 'https://www.my-jewellery.com/nl' },
        { name: 'iPhone Cases', url: 'https://www.iphonecases.nl' }
      ]
    },
    {
      title: 'Slapen',
      shops: [
        { name: 'Zelesta', url: 'https://www.zelesta.nl' },
        { name: 'Emma', url: 'https://www.emma-sleep.nl' },
        { name: 'Matt Sleeps', url: 'https://www.mattsleeps.com/nl' },
        { name: 'Tempur', url: 'https://www.tempur.nl' },
        { name: 'Auping', url: 'https://www.auping.com/nl' }
      ]
    },
    {
      title: 'Sneakers',
      shops: [
        { name: 'Nike', url: 'https://www.nike.com/nl' },
        { name: 'adidas', url: 'https://www.adidas.nl' },
        { name: 'JD Sports', url: 'https://www.jdsports.nl' },
        { name: 'Size?', url: 'https://www.sizeofficial.nl' },
        { name: 'Foot Locker', url: 'https://www.footlocker.nl' }
      ]
    },
    {
      title: 'Sport',
      shops: [
        { name: 'Aybl', url: 'https://www.aybl.com' },
        { name: 'Gymshark', url: 'https://www.gymshark.com/nl' },
        { name: 'Plutosport', url: 'https://www.plutosport.nl' },
        { name: 'Tennispoint', url: 'https://www.tennispoint.nl' },
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
        { name: 'Myprotein', url: 'https://www.myprotein.nl' },
        { name: 'Lucovitaal', url: 'https://www.lucovitaal.nl' },
        { name: 'Bulk', url: 'https://www.bulk.com/nl' },
        { name: 'Vitaepro', url: 'https://www.vitaepro.nl' },
        { name: 'Bodylab', url: 'https://www.bodylab.nl' }
      ]
    },
    {
      title: 'Telefoonabonnementen',
      shops: [
        { name: '50plus Mobiel', url: 'https://www.50plusmobiel.nl' },
        { name: 'Ben', url: 'https://www.ben.nl' },
        { name: 'Ziggo', url: 'https://www.ziggo.nl' },
        { name: 'Odido Mobiel', url: 'https://www.odido.nl/mobiel' },
        { name: 'Simyo', url: 'https://www.simyo.nl' }
      ]
    },
    {
      title: 'Verzekeringen',
      shops: [
        { name: 'FBTO', url: 'https://www.fbto.nl' },
        { name: 'Figopet', url: 'https://www.figopet.nl' },
        { name: 'Insify', url: 'https://www.insify.nl' },
        { name: 'ASR', url: 'https://www.asr.nl' },
        { name: 'Centraal Beheer', url: 'https://www.centraalbeheer.nl' }
      ]
    },
    {
      title: 'Zorgverzekeringen',
      shops: [
        { name: 'FBTO', url: 'https://www.fbto.nl' },
        { name: 'Zorgkiezer', url: 'https://www.zorgkiezer.nl' },
        { name: 'Independer', url: 'https://www.independer.nl' },
        { name: 'Vink Vink', url: 'https://www.vinkvink.nl' },
        { name: 'ASR', url: 'https://www.asr.nl' }
      ]
    }
  ];

  constructor() {
    const today = new Date();
    const monthName = today.toLocaleString('nl-NL', { month: 'long' });
    const year = today.getFullYear();

    this.currentMonth = `${monthName} ${year}`;
  }

  /**
   * Open / sluit een categorie
   */
  toggleCategory(index: number): void {
    if (this.expandedIndexes.has(index)) {
      this.expandedIndexes.delete(index);
    } else {
      this.expandedIndexes.add(index);
    }
  }
}
