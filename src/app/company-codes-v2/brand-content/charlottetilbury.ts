import { BrandContent } from './brand-content.model';

/**
 * Copy grounded in Charlotte Tilbury's real influencer captions (py_diski_influencers DB,
 * ai_canonical = 'charlottetilbury'): 49 captions from 18 NL creators via the brand's
 * "Magic Beauty Stars" affiliate-/friends-program. The recurring mechanic is a personal
 * code (format "CT-SOC…") plus a friends.charlottetilbury.com link giving 15% korting op
 * je eerste bestelling, with periodic 20%-acties; discount_pattern shows 15% as the dominant
 * parsed bucket (10 codes), then 20% (4) and 10% (1). Recurring products mentioned: Pillow
 * Talk lippen, Magic Cream (Supercharged), Airbrush Flawless (Blur) Concealer, Beauty/Flawless
 * Wands, Magic Vanish, lip-oils en glosses (Plumpgasm, Unreal Lips) en parfum Joyphoria.
 */
export const charlottetilburyContent: BrandContent = {
  slug: 'charlottetilbury',
  name: 'Charlotte Tilbury',
  related: ['paulaschoice.nl', 'achateshop.com', 'wildrefill', 'geurwolkje',
            'ahead-nutrition', 'smartphoto.nl', 'calliegifts', 'yesstyle',
            'morenutrition', 'mothersearth'],
  heroLede:
    'Alle werkende Charlotte Tilbury kortingscodes en influencer-codes op één plek — ' +
    'meestal goed voor 15% korting op je bestelling, met af en toe een 20%-actie. ' +
    'Dagelijks gecontroleerd door onze redactie.',
  about: [
    'Charlotte Tilbury is het Britse luxe make-up- en skincaremerk van visagist Charlotte ' +
    'Tilbury, bekend van iconen als de Pillow Talk-lijn, de Magic Cream en de Airbrush ' +
    'Flawless-producten. Het draait om een glowy, "filter in real life"-look: dewy basis, ' +
    'volle nude lippen en producten die zichzelf telkens vernieuwen, zoals de recente Magic ' +
    'Cream Supercharged en de Airbrush Flawless Blur Concealer.',
    'In onze data delen zo\'n 18 Nederlandse creators Charlotte Tilbury, vrijwel altijd via het ' +
    '"Magic Beauty Stars"-programma. Ze posten unboxings en dagelijkse routines en bieden daarbij ' +
    'een persoonlijke code (format "CT-SOC…") aan plus een friends.charlottetilbury.com-link. ' +
    'De meeste codes geven 15% korting op je eerste bestelling; in actieperiodes loopt dat op tot 20%.'
  ],
  why: [
    { h: 'Pillow Talk en iconische lippen', p: 'De Pillow Talk-lijn (lipstick, Lip Cheat liner, Lip Tint, Plumpgasm en Unreal Lips lip-oils) is veruit het meest genoemde in de captions — een nude die volgens creators "bij iedereen mooi staat".' },
    { h: 'Glow-basis die blijft zitten', p: 'Airbrush Flawless (Blur) Concealer, Magic Vanish en de Beauty/Flawless Wands worden steeds genoemd voor een dewy, langhoudende huid tot ~24 uur.' },
    { h: 'Skincare met cult-status', p: 'De Magic Cream — nu in de vernieuwde Supercharged-formule met peptiden — is een terugkerende favoriet, net als de getinte lip-oils voor verzorging.' },
    { h: 'Persoonlijke influencer-codes', p: 'Bijna elke creator deelt een eigen code plus friends-link; meestal 15% korting, in acties 20%.' }
  ],
  trending: ['Pillow Talk lippen', 'Magic Cream Supercharged', 'Airbrush Flawless Blur Concealer',
             'Beauty Wands voor glow', 'Plumpgasm & Unreal Lips lip-oils', 'Joyphoria parfum'],
  codeInfo: [
    'Charlotte Tilbury werkt vooral met persoonlijke influencer-codes uit het Magic Beauty ' +
    'Stars-programma. Je herkent ze aan het format "CT-SOC…" en ze gaan vaak samen met een ' +
    'friends.charlottetilbury.com-link. In de captions geven die codes meestal 15% korting; ' +
    'in actieperiodes zien we 20% op het hele assortiment, en soms 10%.',
    'Let op de voorwaarden die creators noemen: de korting geldt vaak alleen op je eerste ' +
    'bestelling en acties (zoals de 20%-deal of een gratis fullsize-product vanaf een ' +
    'besteldrempel) zijn meestal tijdelijk. Voorwaarden kunnen per code verschillen, daarom ' +
    'controleren wij de codes dagelijks.'
  ],
  creators: ['@queen_reviewster1976', '@daphne_vandelft', '@joyce.diemer', '@ansje.thagai',
             '@fashionmomtalk', '@hannahverschuur', '@jessicavanbelzen8', '@lanalynn.v'],
  tips: [
    { h: 'Pak een influencer-code voor 15%', p: 'De persoonlijke "CT-SOC…"-codes werken voor iedereen en geven meestal 15% korting op je bestelling.' },
    { h: 'Wacht op een 20%-actie', p: 'In actieperiodes shoppen creators met 20% korting op het hele assortiment — soms met een gratis fullsize-product bij een bepaald besteedbedrag.' },
    { h: 'Let op "eerste bestelling"', p: 'Veel codes gelden expliciet op je eerste order; check de voorwaarde voordat je afrekent.' },
    { h: 'Begin met de bestsellers', p: 'Pillow Talk, de Airbrush Flawless Concealer en de Magic Cream zijn de stukken die creators steeds opnieuw aanraden.' }
  ],
  faq: [
    { q: 'Hoeveel korting krijg ik met een Charlotte Tilbury kortingscode?', a: 'Meestal 15% korting. In actieperiodes zien we 20% op het hele assortiment, en soms 10% — het exacte percentage hangt af van de code en de actie van dat moment.' },
    { q: 'Hoe werkt een Charlotte Tilbury influencer-code?', a: 'Creators delen een persoonlijke code (format "CT-SOC…") plus een friends.charlottetilbury.com-link uit het Magic Beauty Stars-programma. Je vult de code in bij het afrekenen; hij werkt voor iedereen.' },
    { q: 'Geldt de korting op mijn hele bestelling?', a: 'Vaak wel, maar veel codes gelden specifiek op je eerste bestelling en sommige acties hebben een besteddrempel. Controleer de voorwaarden bij de code.' },
    { q: 'Welke producten zijn populair bij Charlotte Tilbury?', a: 'In de captions komen vooral de Pillow Talk-lijn, de Airbrush Flawless (Blur) Concealer, de Magic Cream (Supercharged), de Beauty Wands en lip-oils als Plumpgasm en Unreal Lips terug.' },
    { q: 'Van wie is Charlotte Tilbury?', a: 'Een Brits luxe make-up- en skincaremerk van de gelijknamige visagist Charlotte Tilbury, bekend van iconische producten zoals Pillow Talk en de Magic Cream.' }
  ]
};
