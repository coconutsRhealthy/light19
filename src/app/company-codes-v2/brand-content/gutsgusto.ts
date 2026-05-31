import { BrandContent } from './brand-content.model';

/**
 * Copy grounded in Guts & Gusto's real influencer captions (ai_canonical='gutsgusto':
 * 183 captions, ~75 creators, strong NL + DE presence). Two code types in the data:
 * personal "NAAM15" influencer codes = 15% off excl. sale (short validity), plus
 * brand-wide promos like VACAYPAY (10% incl. sale) and free-shipping codes.
 */
export const gutsgustoContent: BrandContent = {
  slug: 'gutsgusto',
  name: 'Guts & Gusto',

  related: ['nakdfashion', 'ginatricot', 'loavies', 'pinkgellac', 'myjewellery', 'armedangels',
            'emmasleepnl', 'parfumado', 'edited.nl', 'orangebag', 'terstal', 'safira'],

  heroLede:
    'Alle werkende Guts & Gusto kortingscodes op één plek — van persoonlijke influencer-codes ' +
    'voor 15% korting tot merkbrede acties zoals 10% korting en gratis verzending. ' +
    'Dagelijks gecontroleerd door onze redactie.',

  about: [
    'Guts & Gusto is een Nederlands modemerk voor dames, bekend om vrouwelijke looks, jurken en ' +
    'kantoor-outfits. Naast de webshop heeft het merk ook fysieke winkels, en inmiddels is het ' +
    'ook in Duitsland erg populair (te herkennen aan @gutsgusto.de).',

    'Het merk steunt sterk op influencer-marketing: in onze data delen tientallen creators — vooral ' +
    'uit Nederland en Duitsland — hun persoonlijke kortingscode, vrijwel altijd goed voor 15% korting. ' +
    'Daarnaast deelt Guts & Gusto zelf regelmatig merkbrede actiecodes.'
  ],

  why: [
    { h: 'Vrouwelijke mode', p: 'Jurken, blazers en kantoorlooks, met steeds nieuwe seizoenscollecties.' },
    { h: 'Persoonlijke influencer-codes', p: 'Vaak NAAM15 voor 15% korting op alles behalve sale.' },
    { h: 'Merkbrede acties', p: 'Daarnaast codes als 10% op de hele collectie of gratis verzending.' },
    { h: 'Online én in de winkel', p: 'De meeste codes werken in de webshop en in de fysieke winkels.' }
  ],

  trending: [
    'Zomerjurken en feestelijke looks',
    'Kantoor- en blazerlooks',
    'Midsize-vriendelijke styling',
    'Lente- en zomercollectie',
    'Sjaals en accessoires'
  ],

  codeInfo: [
    'Bij Guts & Gusto zijn er twee soorten codes. Persoonlijke influencer-codes (vaak NAAM15, zoals ' +
    'FLEUR15 of GABRIELA15) geven 15% korting op alles behalve sale, en zijn meestal maar kort geldig.',

    'Daarnaast deelt Guts & Gusto zelf merkbrede actiecodes, zoals 10% korting op de hele collectie ' +
    '(soms inclusief sale) of gratis verzending. We verzamelen beide soorten hieronder, zodat je de ' +
    'voordeligste voor jouw bestelling kunt kiezen.'
  ],

  creators: [
    '@gabrieladegraaf', '@leonacathrina', '@anna___braun', '@fleurnijbacker',
    '@gretalck', '@jennifer.grst', '@luisa.snd', '@dani_nanaa'
  ],

  tips: [
    { h: 'Influencer-code = 15%', p: 'Een NAAM15-code geeft 15% korting op alles behalve sale-artikelen.' },
    { h: 'Vergelijk met de merkacties', p: 'Een merkbrede code als VACAYPAY (10% incl. sale) kan op afgeprijsde items voordeliger zijn.' },
    { h: 'Wees snel', p: 'De influencer-codes zijn vaak maar kort geldig ("nur kurze Zeit"); check de datum.' },
    { h: 'Werkt ook in de winkel', p: 'De meeste codes gelden zowel online als in de fysieke winkels.' }
  ],

  faq: [
    {
      q: 'Hoeveel korting krijg ik met een Guts & Gusto kortingscode?',
      a: 'Persoonlijke influencer-codes geven 15% korting op alles behalve sale. Merkbrede acties zijn ' +
         'vaak 10% (soms inclusief sale).'
    },
    {
      q: 'Geldt de kortingscode ook op sale?',
      a: 'Influencer-codes meestal niet. Merkbrede codes zoals VACAYPAY gelden soms wél op sale-artikelen.'
    },
    {
      q: 'Werkt de code ook in de winkel?',
      a: 'Ja, de meeste Guts & Gusto codes werken zowel online als in de fysieke winkels.'
    },
    {
      q: 'Hoe lang is een Guts & Gusto kortingscode geldig?',
      a: 'De influencer-codes zijn vaak maar kort geldig. Daarom controleert onze redactie de codes dagelijks.'
    },
    {
      q: 'Waar komt Guts & Gusto vandaan?',
      a: 'Guts & Gusto is een Nederlands modemerk voor dames, dat ook in Duitsland een grote schare fans heeft.'
    }
  ]
};
