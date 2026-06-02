import { BrandContent } from './brand-content.model';

/**
 * Copy grounded in Photowall's real influencer captions (py_diski_influencers DB,
 * ai_canonical = 'photowall_sweden'): 44 captions from 37 NL creators, almost all
 * interieur/home-makeover accounts. The recurring mechanic is a personal code
 * (e.g. NAAM15) good for 15% korting — 32 captions mention 15%, 9 mention 25% —
 * vaak 4 weken geldig en meermaals genoemd met gratis verzending. Veel posts gaan
 * over zelfklevend "stick & peel" behang voor kinder-, baby- en slaapkamers.
 */
export const photowallswedenContent: BrandContent = {
  slug: 'photowall_sweden',
  name: 'Photowall',
  related: ['nakdfashion', 'geurwolkje', 'achateshop.com', 'smartphoto.nl', 'albelli',
            'terstal', 'emmasleepnl', 'goodevas.com', 'graceisgreen', 'hellofresh.nl'],
  heroLede:
    'Alle werkende Photowall kortingscodes en influencer-codes op één plek — meestal goed ' +
    'voor 15% korting op je hele bestelling, vaak met gratis verzending. Verzameld uit de ' +
    'codes die tientallen interieur-creators delen en dagelijks gecontroleerd door onze redactie.',
  about: [
    'Photowall (vaak getagd als Photowall Sweden) is een Zweeds merk dat zich volledig richt ' +
    'op behang en fotobehang op maat. Het assortiment loopt van rustige patronen zoals gingham ' +
    'en marble tot uitgesproken fotobehang met natuur, dieren, bloemen en wereldkaarten. Een ' +
    'groot deel van wat creators laten zien is zelfklevend "stick & peel"-behang dat je zonder ' +
    'lijm aanbrengt — handig voor een snelle make-over.',
    'In onze data delen ruim 37 Nederlandse creators Photowall-behang, vrijwel altijd in de ' +
    'context van een kamer-make-over: kinderkamers, babykamers, slaapkamers en statement walls. ' +
    'Ze benoemen telkens hoe makkelijk het behang aan te brengen is en bieden daarbij bijna ' +
    'standaard dezelfde deal aan: een persoonlijke code voor 15% korting.'
  ],
  why: [
    { h: 'Behang en fotobehang op maat', p: 'Van rustige gingham- en marble-patronen tot ' +
      'uitgesproken fotobehang met natuur, dieren en bloemen — creators kiezen voor heel ' +
      'uiteenlopende kamers en stijlen.' },
    { h: 'Zelfklevend stick & peel', p: 'Veel creators gebruiken het peel-and-stick behang: ' +
      'geen lijm, gewoon plakken. In meerdere posts is een muur in een uur tot een paar uur klaar.' },
    { h: 'Persoonlijke influencer-codes', p: 'Bijna elke code geeft 15% korting op je hele ' +
      'bestelling; in sommige acties zien we 25%.' },
    { h: 'Vaak gratis verzending', p: 'Meerdere creators noemen gratis verzending bij hun code — ' +
      'controleer altijd even wat er op het moment van bestellen geldt.' }
  ],
  trending: ['Stick & peel behang', 'Babykamer- en kinderkamer-make-overs', 'Bloemen- en cherry blossom-prints',
             'Gingham-patronen', 'Natuur- en bosbehang', 'Wereldkaart- en dierenbehang'],
  codeInfo: [
    'Photowall werkt vooral met persoonlijke influencer-codes in de vorm van een naam plus een ' +
    'getal, zoals NAAM15. Vrijwel elke code geeft 15% korting op je hele bestelling; in een enkele ' +
    'actie zagen we 25% (bijvoorbeeld codes eindigend op 25). Meerdere creators noemen daarbij ' +
    'gratis verzending.',
    'Let op de voorwaarden die creators zelf benoemen: de codes zijn vaak ongeveer 4 weken geldig ' +
    'en je gebruikt er één per bestelling. Omdat de geldigheid per code verschilt, controleren wij ' +
    'de codes dagelijks zodat je de versie pakt die nu werkt.'
  ],
  creators: ['@amber_girelle', '@hoekhuisjezutphen', '@lindseybeljaars', '@interieurvanleonie',
             '@debbiedhillon', '@home.0.7', '@thuis.bij.roos', '@sarahrebeccanl'],
  tips: [
    { h: 'Pak een influencer-code voor 15%', p: 'De persoonlijke codes (zoals NAAM15) werken voor ' +
      'iedereen en geven meestal 15% korting op je hele bestelling.' },
    { h: 'Let op een 25%-actie', p: 'Soms duikt er een code voor 25% op — een hogere korting dan de ' +
      'standaard 15%, dus die pak je als je hem ziet.' },
    { h: 'Wees op tijd', p: 'Codes zijn vaak rond 4 weken geldig; check de looptijd voordat je bestelt.' },
    { h: 'Kies zelfklevend voor een snelle klus', p: 'Het stick & peel behang gaat zonder lijm op de ' +
      'muur — creators krijgen daarmee een kamer vaak in een paar uur om.' }
  ],
  faq: [
    { q: 'Hoeveel korting krijg ik met een Photowall kortingscode?', a: 'Vrijwel alle persoonlijke ' +
      'codes geven 15% korting op je hele bestelling. In sommige acties zien we 25%, en meerdere ' +
      'codes worden genoemd met gratis verzending.' },
    { q: 'Hoe lang is een Photowall kortingscode geldig?', a: 'Volgens de creators zijn de codes vaak ' +
      'ongeveer 4 weken geldig. De exacte looptijd verschilt per code, dus controleer dit bij het bestellen.' },
    { q: 'Kan ik meerdere codes combineren?', a: 'Nee, je gebruikt één code per bestelling. Kies de ' +
      'code met de hoogste geldige korting.' },
    { q: 'Werkt de code van een influencer ook voor mij?', a: 'Ja, de persoonlijke codes (zoals NAAM15) ' +
      'werken voor iedereen, niet alleen voor de creator zelf.' },
    { q: 'Wat verkoopt Photowall?', a: 'Behang en fotobehang op maat, van rustige patronen tot ' +
      'uitgesproken prints met natuur, dieren en bloemen. Veel ontwerpen zijn als zelfklevend ' +
      'stick & peel-behang verkrijgbaar.' }
  ]
};
