import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { NavbarComponent } from '../../navbar/navbar.component';
import { MetaService } from '../../services/meta.service';

const URL = 'https://diski.nl/blogs/uniqlo-actie-augustus/';
const TITLE = 'UNIQLO actie: onze 5 favoriete pieces met korting | Diski';
const DESCRIPTION =
  'Van 20 tot en met 30 augustus geeft UNIQLO korting op tientallen items. ' +
  'Dit zijn de 5 pieces die wij zelf in ons mandje leggen, van parka tot mini bag.';

/** The campaign window. Shown in the copy and used for the Article dates. */
const ACTIE_START_ISO = '2026-08-20';
const ACTIE_EIND_ISO = '2026-08-30';

/** One of the five picks. Prices are in euros; `save` is derived, not typed in,
 *  so the "samen 24 euro" total below can never drift from the cards. */
interface Pick {
  num: string;
  name: string;
  image: string;
  alt: string;
  oldPrice: number;
  newPrice: number;
  body: string;
  tip: string;
  /** tidd.ly affiliate link to the product. */
  link: string;
}

const PICKS: Pick[] = [
  {
    num: '01',
    name: 'BLOCKTECH Parka',
    image: '/blog/uniqlo-actie-augustus/parka.webp',
    alt: 'UNIQLO BLOCKTECH Parka in beige',
    oldPrice: 79.90,
    newPrice: 69.90,
    body: "Dé jas voor de komende maanden. Winddicht, waterafstotend en toch licht, dus perfect voor elke fietsrit door de regen. De beige kleur oogt veel duurder dan het prijskaartje en met tien euro korting is dit de beste deal van de actie.",
    tip: 'Neem een maatje ruimer als je hem straks over een hoodie wilt dragen.',
    link: 'https://tidd.ly/4gohJgX',
  },
  {
    num: '02',
    name: 'Jersey Barrel Fit Broek',
    image: '/blog/uniqlo-actie-augustus/barrel-broek.webp',
    alt: 'UNIQLO Jersey Barrel Fit Broek in olijfgroen',
    oldPrice: 39.90,
    newPrice: 34.90,
    body: 'De barrel fit is hét broekmodel van dit moment: wijd bij de heup, smaller bij de enkel. Deze jersey versie zit als een joggingbroek maar oogt gekleed, en de olijfgroene kleur combineert met alles wat al in je kast hangt.',
    tip: 'Stop er een simpel shirt in en je outfit is af.',
    link: 'https://tidd.ly/4greEfX',
  },
  {
    num: '03',
    name: 'AIRism Katoenen T-Shirt',
    image: '/blog/uniqlo-actie-augustus/airism-shirt.webp',
    alt: 'UNIQLO AIRism katoenen T-shirt in roze',
    oldPrice: 14.90,
    newPrice: 12.90,
    body: 'Onze favoriete basic. Voelt als katoen, droogt bijna twee keer zo snel en blijft de hele dag fris. Voor 12,90 euro sla je hier gewoon een kleine voorraad van in.',
    tip: 'De roze tint is verrassend draagbaar, maar wit en zwart blijven de veiligste keuzes.',
    link: 'https://tidd.ly/4qqVHi1',
  },
  {
    num: '04',
    name: 'Straight Fit Joggingbroek',
    image: '/blog/uniqlo-actie-augustus/joggingbroek.webp',
    alt: 'UNIQLO Straight Fit joggingbroek in donkerbruin',
    oldPrice: 34.90,
    newPrice: 29.90,
    body: 'De rechte pijp maakt deze joggingbroek net wat volwassener dan het klassieke model. Zware sweatstof, comfortabele taille en de donkerbruine kleur is dit seizoen de slimme keuze. Met een sneaker en een simpel shirt is dit de makkelijkste outfitformule van het najaar.',
    tip: 'Combineer met de full zip hoodie uit dezelfde actie voor een complete set.',
    link: 'https://tidd.ly/4gru2sV',
  },
  {
    num: '05',
    name: 'Round Mini Shoulder Bag',
    image: '/blog/uniqlo-actie-augustus/mini-bag.webp',
    alt: 'UNIQLO Round Mini Shoulder Bag in donkergroen',
    oldPrice: 14.90,
    newPrice: 12.90,
    body: 'De mini bag die wereldwijd viraal ging en alles kan: telefoon, pasjes, sleutels en oordopjes passen er precies in. De donkergroene versie oogt het duurst en staat bij vrijwel elke outfit. 🧡',
    tip: 'Wees er snel bij, dit item is ervaringsgewijs als eerste uitverkocht.',
    link: 'https://tidd.ly/4xkHJ3V',
  },
];

const FAQ = [
  {
    q: 'Wanneer loopt de UNIQLO actie?',
    a: 'Van 20 tot en met 30 augustus 2026. Daarna gelden de normale prijzen weer.',
  },
  {
    q: 'Heb ik een kortingscode nodig?',
    a: 'Nee. De actieprijzen gelden automatisch, dus je hoeft niets in te voeren bij het afrekenen.',
  },
  {
    q: 'Is dit hetzelfde als de UNIQLO sale?',
    a: 'Nee. De sale bevat aflopende voorraad, deze actie geeft tijdelijk korting op items uit de lopende collectie. Na 30 augustus gaan de prijzen weer omhoog.',
  },
];

@Component({
  selector: 'app-uniqlo-actie-augustus-blog',
  imports: [FooterComponent, NavbarComponent, RouterLink],
  templateUrl: './uniqlo-actie-augustus-blog.component.html',
  styles: ``
})
export class UniqloActieAugustusBlogComponent {
  picks = PICKS;
  faq = FAQ;

  /** Summed from the cards so the headline number always matches them. */
  totalSaving = PICKS.reduce((sum, p) => sum + (p.oldPrice - p.newPrice), 0);

  // See uniqlo-blog.component.ts for why the tags are set in the constructor
  // rather than ngOnInit: static copy, so they must be in place for the prerender.
  constructor(private meta: MetaService) {
    this.meta.updateTitle(TITLE);
    this.meta.updateMetaInfo(DESCRIPTION, 'diski.nl',
      'UNIQLO, UNIQLO actie, UNIQLO korting, UNIQLO aanbieding, kortingscode UNIQLO');
    this.meta.updateOgTags(TITLE, DESCRIPTION, URL, 'article');

    this.meta.setJsonLd('uniqlo-actie-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Diski', 'item': 'https://diski.nl/' },
        { '@type': 'ListItem', 'position': 2, 'name': 'Blogs', 'item': 'https://diski.nl/blogs/' },
        { '@type': 'ListItem', 'position': 3, 'name': 'UNIQLO actie augustus', 'item': URL },
      ],
    });

    this.meta.setJsonLd('uniqlo-actie-article', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': URL + '#article',
      'headline': 'UNIQLO actie: onze 5 favoriete pieces met korting',
      'description': DESCRIPTION,
      'datePublished': ACTIE_START_ISO,
      'dateModified': ACTIE_START_ISO,
      'inLanguage': 'nl-NL',
      'author': { '@type': 'Organization', 'name': 'Redactie Diski', 'url': 'https://diski.nl/' },
      'publisher': { '@id': 'https://diski.nl/#organization' },
      'mainEntityOfPage': { '@id': URL },
      'about': { '@type': 'Organization', 'name': 'UNIQLO' },
    });

    this.meta.setJsonLd('uniqlo-actie-faq', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': FAQ.map(item => ({
        '@type': 'Question',
        'name': item.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': item.a },
      })),
    });
  }

  /** "79,90", but "24" for round amounts — Dutch shops drop an empty cent pair,
   *  and the savings (10, 5, 2, 24) are all whole euros. */
  price(value: number): string {
    const fixed = value.toFixed(2);
    return fixed.endsWith('.00') ? fixed.slice(0, -3) : fixed.replace('.', ',');
  }

  /** The campaign end, for the "loopt t/m" line. Kept next to the schema dates
   *  so the copy and the structured data can't drift apart. */
  readonly actieEindIso = ACTIE_EIND_ISO;
}
