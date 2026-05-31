import { BrandContent } from './brand-content.model';

/**
 * Zalando copy. NB: Zalando has almost no influencer captions in our data
 * (its codes come from elsewhere), so this is general/verifiable copy rather
 * than caption-grounded — the opposite end of the spectrum from NA-KD.
 */
export const zalandoContent: BrandContent = {
  slug: 'zalando',
  name: 'Zalando',

  // Zalando is caption-poor, so no reliable co-occurrence — this is a curated
  // default pool (popular fashion shops) demonstrating the thin-shop fallback.
  related: ['nakdfashion', 'shein', 'ginatricot', 'gutsgusto', 'loavies', 'temu',
            'bjornborg', 'gymshark'],

  heroLede:
    'Alle werkende Zalando kortingscodes en aanbiedingen op één plek. Handmatig getest en ' +
    'dagelijks gecontroleerd door onze redactie.',

  about: [
    'Zalando is de grootste online modewinkel van Europa, opgericht in 2008 in Berlijn. In ' +
    'Nederland biedt Zalando meer dan 5.000 merken in dames-, heren- en kindermode, van schoenen ' +
    'en kleding tot beauty en accessoires.',

    'Bekende voordelen zijn gratis verzending en retour binnen Nederland, een bezorging vaak al ' +
    'de volgende dag en een ruime retourtermijn.'
  ],

  why: [
    { h: 'Groot assortiment', p: 'Ruim 5.000 merken onder één dak, voor dames, heren en kinderen.' },
    { h: 'Gratis verzending & retour', p: 'Geen verzendkosten binnen Nederland en eenvoudig retourneren.' },
    { h: 'Snelle levering', p: 'Bestellingen zijn vaak al de volgende dag in huis.' },
    { h: 'Achteraf betalen', p: 'Bekijk eerst je bestelling en betaal daarna.' }
  ],

  tips: [
    { h: 'Download de app', p: 'Voor app-only acties en een welkomstkorting voor nieuwe klanten.' },
    { h: 'Shop tijdens de sale', p: 'Combineer sale-prijzen met een extra kortingscode waar mogelijk.' },
    { h: 'Let op seizoensmomenten', p: 'Black Friday, Cyber Monday en de uitverkoop geven de hoogste kortingen.' },
    { h: 'Maak een account', p: 'Abonnees krijgen vaak als eerste een persoonlijke kortingscode per e-mail.' }
  ],

  faq: [
    {
      q: 'Hoe gebruik ik een Zalando kortingscode?',
      a: 'Kopieer de code op deze pagina, ga naar Zalando, leg je artikelen in het winkelmandje ' +
         'en plak de code in het veld "Kortingscode of cadeaubon" tijdens het afrekenen.'
    },
    {
      q: 'Heeft Zalando altijd een werkende kortingscode?',
      a: 'Zalando geeft niet doorlopend openbare kortingscodes uit, maar er zijn bijna altijd ' +
         'lopende acties zoals gratis verzending en seizoenssales. Onze redactie controleert dit dagelijks.'
    },
    {
      q: 'Kan ik meerdere kortingscodes combineren bij Zalando?',
      a: 'Nee, Zalando staat doorgaans maar één kortingscode per bestelling toe. Kies de code met ' +
         'het hoogste voordeel voor jouw winkelmandje.'
    },
    {
      q: 'Is retourneren bij Zalando gratis?',
      a: 'Ja, Zalando biedt gratis retourneren in Nederland. Je gebruikt het meegeleverde ' +
         'retourlabel en geeft het pakket af bij een afhaalpunt.'
    }
  ]
};
