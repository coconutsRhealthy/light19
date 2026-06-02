import { BrandContent } from './brand-content.model';

/**
 * Copy grounded in Mother's Earth's real influencer captions (py_diski_influencers DB,
 * ai_canonical = 'mothersearth'): 21 captions from 11 NL creators in the duurzaam-
 * huishouden / plasticvrije-was niche. Recurring mechanic: persoonlijke creator-code
 * "<NAAM>15" = 15% korting op alles (discount_pattern: 15% dominant, soms 20%/10%).
 * Captions draaien rond wasstrips/laundry sheets, geurparels (scent beads),
 * vaatwasstrips en de multipurpose cleaner — plasticvrij, PVA-vrij, plantaardig.
 */
export const mothersearthContent: BrandContent = {
  slug: 'mothersearth',
  name: "Mother's Earth",
  related: ['achateshop.com', 'wildrefill', 'calliegifts', 'smartphoto.nl',
            'nakdfashion', 'paulaschoice.nl', 'pinkgellac', 'charlottetilbury',
            'deplay', 'desenio', 'everdrop'],
  heroLede:
    "Alle werkende Mother's Earth kortingscodes en influencer-codes op één plek — " +
    'meestal goed voor 15% korting op je hele bestelling. Verzameld uit de codes ' +
    'die NL-creators delen en dagelijks gecontroleerd door onze redactie.',
  about: [
    "Mother's Earth is een merk voor duurzaam schoonmaken en wassen. Het bekendste " +
    'product zijn de wasstrips (laundry sheets): dunne, voorgedoseerde velletjes die ' +
    'volledig oplossen in de wasmachine en zonder plastic fles of microplastics komen. ' +
    'Daarnaast zien we in de captions geurparels (scent beads), vaatwasstrips en een ' +
    'multipurpose cleaner — telkens met de nadruk op plasticvrij, PVA-vrij en ' +
    'plantaardige ingrediënten.',
    'In onze data delen ruim 11 Nederlandse creators Mother’s Earth, vaak mom- en ' +
    'home-accounts die bewust kiezen voor minder chemicaliën in huis. Ze bieden bijna ' +
    'altijd dezelfde deal aan: een persoonlijke code voor 15% korting, geuren als ' +
    'Spring Breeze, Ocean Breeze en Fresh Pine komen herhaaldelijk voorbij.'
  ],
  why: [
    { h: 'Plasticvrij wassen', p: 'Wasstrips en vaatwasstrips lossen volledig op — geen plastic flessen of bakjes, geen microplastics in je wasje.' },
    { h: 'Plantaardig en PVA-vrij', p: 'Creators benoemen krachtige plantaardige ingrediënten zonder onnodige toevoegingen, prettig voor de huid van kinderen.' },
    { h: 'Persoonlijke influencer-codes', p: 'Vrijwel elke code geeft 15% korting op je hele bestelling, ongeacht de geur die je kiest.' },
    { h: 'Compact en geconcentreerd', p: 'De strips zijn superlicht, nemen amper ruimte in en zijn net zo makkelijk te doseren als bij de was.' }
  ],
  trending: ['Wasstrips / laundry sheets', 'Geurparels (scent beads)', 'Vaatwasstrips', 'Multipurpose cleaner', 'Geuren Spring Breeze & Ocean Breeze'],
  codeInfo: [
    "Mother's Earth werkt vooral met persoonlijke influencer-codes in de vorm " +
    '"<NAAM>15", zoals NOES15, SELENA15 of CAROLINE15. Vrijwel elke code geeft 15% ' +
    'korting op je hele bestelling; in de captions zien we incidenteel ook 20% of 10%, ' +
    'dus loont het om te vergelijken.',
    'Je voert de code in je winkelmandje of bij het afrekenen in. Rond acties als ' +
    'Black Friday lopen er soms bundeldeals (zoals "6+6 gratis") waarbij je juist géén ' +
    'code hoeft in te vullen — alles wordt dan automatisch toegepast. Omdat codes en ' +
    'acties wisselen, controleren wij ze dagelijks.'
  ],
  creators: ['@tipsvantiff', '@noes__', '@huisjevolrijkdom', '@fashionmomtalk',
             '@selenadinexz', '@home.by.mara', '@dayenneritchi', '@motherofoliver'],
  tips: [
    { h: 'Pak een influencer-code voor 15%', p: 'De meeste persoonlijke codes ("<NAAM>15") geven 15% korting op je hele bestelling.' },
    { h: 'Vergelijk geuren, niet de korting', p: 'De korting is meestal gelijk — kies dus gewoon je favoriete geur, van Spring Breeze tot Fresh Pine.' },
    { h: 'Let op bundelacties', p: 'Rond Black Friday lopen bundeldeals zoals "6+6 gratis" waarbij je geen code nodig hebt.' },
    { h: 'Sla je vaste geur in', p: 'Wasstrips zijn houdbaar en compact, dus voordelig om wat ruimer in te slaan tijdens een actie.' }
  ],
  faq: [
    { q: "Hoeveel korting krijg ik met een Mother's Earth kortingscode?", a: 'Vrijwel alle persoonlijke creator-codes geven 15% korting op je hele bestelling. In de captions zien we soms ook 20% of 10%, dus check de actuele code.' },
    { q: 'Hoe gebruik ik de code?', a: 'Voer de code (bijvoorbeeld NOES15 of SELENA15) in je winkelmandje of bij het afrekenen in. Bij sommige bundelacties is geen code nodig en wordt de korting automatisch toegepast.' },
    { q: 'Kan ik meerdere codes combineren?', a: 'Dat is doorgaans niet mogelijk: je gebruikt één code per bestelling. Vergelijk daarom welke code de hoogste korting geeft.' },
    { q: "Wat verkoopt Mother's Earth?", a: 'Duurzame was- en schoonmaakproducten: wasstrips (laundry sheets), geurparels, vaatwasstrips en een multipurpose cleaner — plasticvrij, PVA-vrij en plantaardig.' },
    { q: 'Zijn de wasstrips echt plasticvrij?', a: 'Creators benoemen consequent dat de strips volledig oplossen, plasticvrij zijn en geen microplastics achterlaten. Controleer de productpagina voor de actuele specificaties.' }
  ]
};
