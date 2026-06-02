import { BrandContent } from './brand-content.model';

/**
 * Copy grounded in VitaminFit's real influencer captions (py_diski_influencers DB,
 * ai_canonical = 'vitaminfit.eu'): 18 captions from 3 NL creators (vooral
 * @karivdheide, @maria.bootsma, @babybirdstore). Niche: 100% natuurlijke, vegan
 * voedingssupplementen, kindersupplementen en kruidenthee/-infusies. Discount
 * pattern: persoonlijke creator-codes geven meestal 10% (Kari10, Maria10),
 * soms 20% (Maria20); daarnaast terugkerende seizoenssales (Back to School,
 * herfst-sale) van 15-25%.
 */
export const vitaminfiteuContent: BrandContent = {
  slug: 'vitaminfit.eu',
  name: 'VitaminFit',
  related: ['emmasleepnl', 'bygge.store', 'cabaulifestyle', 'dilling', 'farmcamps',
            'gogember.com', 'heybuzzy.nl', 'joybuy', 'koro.com', 'maycosmetics.nl'],
  heroLede:
    'Alle werkende VitaminFit kortingscodes en influencer-codes op één plek — de ' +
    'persoonlijke codes geven meestal 10% korting op de hele webshop, soms loopt het ' +
    'op tot 20%. Dagelijks gecontroleerd door onze redactie.',
  about: [
    'VitaminFit is een Nederlandse webshop in 100% natuurlijke, vegan voedingssupplementen ' +
    'voor het hele gezin. Het assortiment draait om ondersteuning van fysieke, mentale en ' +
    'emotionele gezondheid: denk aan een IJzer Complex met vitamine B12 en C, magnesium, ' +
    'omega 3, vitamine B12, en een aparte kinderlijn met onder andere Kinder Calciumpoeder. ' +
    'Daarnaast verkoopt VitaminFit kruideninfusies en thee — zoals Relax thee met kamille en ' +
    'citroenmelisse, Golden Balance met gember en kurkuma, Rooibos Glow en een fruitige ' +
    'kinderthee zonder toegevoegde suikers. Capsules en druppels zitten sinds kort in ' +
    'plasticvrije papieren potjes.',
    'In onze data delen 3 Nederlandse creators VitaminFit, met @karivdheide ("de groene mama") ' +
    'als veruit de meest actieve stem. Zij en anderen leggen telkens dezelfde nadruk: vegan, ' +
    'plantaardig, zonder toegevoegde suikers en gericht op het gezin en de seizoenen — extra ' +
    'weerstand in de herfst, een winterdip-aanpak, een Back to School-moment. Vrijwel elke post ' +
    'gaat gepaard met een persoonlijke kortingscode.'
  ],
  why: [
    { h: '100% natuurlijk en vegan', p: 'Alle supplementen zijn plantaardig, vegan en zonder toegevoegde suikers — een terugkerend thema in vrijwel elke creator-post.' },
    { h: 'Voor het hele gezin', p: 'Naast supplementen voor volwassenen (magnesium, omega 3, vitamine B12) is er een uitgebreide kinderlijn met o.a. IJzer Complex en Kinder Calciumpoeder.' },
    { h: 'Persoonlijke influencer-codes', p: 'Creators delen eigen codes die meestal 10% korting geven op de hele webshop, soms 20%.' },
    { h: 'Plasticvrije verpakkingen', p: 'Capsules zitten in papieren potjes en het merk benadrukt respectvol gebruik van plantaardige ingrediënten.' }
  ],
  trending: ['IJzer Complex met B12 & C', 'Magnesium', 'Kinder Calciumpoeder', 'Kruideninfusies (Relax, Golden Balance, Rooibos Glow)', 'Fruitige kinderthee', 'Omega 3'],
  codeInfo: [
    'VitaminFit werkt vooral met persoonlijke influencer-codes. De codes die we in de captions ' +
    'terugzien (zoals Kari10 en Maria10) geven meestal 10% korting op de hele webshop; de code ' +
    'Maria20 gaf in een aantal posts 20%. Je vult de code in bij het afrekenen.',
    'Daarnaast houdt VitaminFit met enige regelmaat seizoenssales — we zagen een Back to School ' +
    'Sale (15% op kindersupplementen plus magnesium, omega 3 en B12) en een herfst-sale langskomen. ' +
    'Tijdens zo\'n actie kon een persoonlijke 10%-code er soms nog bovenop. Voorwaarden en geldigheid ' +
    'wisselen per actie, daarom controleren wij de codes dagelijks.'
  ],
  creators: ['@karivdheide', '@maria.bootsma', '@babybirdstore'],
  tips: [
    { h: 'Gebruik een influencer-code voor 10%', p: 'Codes als Kari10 en Maria10 geven meestal 10% korting op de hele webshop — een makkelijke standaardkorting.' },
    { h: 'Let op de 20%-momenten', p: 'Soms duikt er een ruimere code op (we zagen 20% via Maria20). Het loont om te kijken welke code op dat moment het hoogste percentage geeft.' },
    { h: 'Shop tijdens een seizoenssale', p: 'Rond Back to School en in de herfst lopen er sales; soms kun je een persoonlijke code daar nog bovenop gebruiken.' },
    { h: 'Combineer kinder- en volwassen-lijn', p: 'Veel acties gelden voor de hele webshop, dus je kunt supplementen voor jezelf en je kinderen in één bestelling meenemen.' }
  ],
  faq: [
    { q: 'Hoeveel korting krijg ik met een VitaminFit kortingscode?', a: 'De persoonlijke influencer-codes geven meestal 10% korting op de hele webshop. Soms is er een ruimere code beschikbaar (we zagen 20%), en tijdens seizoenssales lopen kortingen op tot 15-25%.' },
    { q: 'Hoe gebruik ik een VitaminFit kortingscode?', a: 'Voeg je producten toe aan je winkelmandje en vul de code (zoals Kari10 of Maria10) in bij het afrekenen. De korting wordt dan op je bestelling toegepast.' },
    { q: 'Kan ik een code combineren met een sale?', a: 'Soms wel. In een Back to School Sale konden klanten een persoonlijke 10%-code nog bovenop de actiekorting gebruiken, maar dit verschilt per actie. Controleer de actuele voorwaarden.' },
    { q: 'Zijn de supplementen van VitaminFit vegan?', a: 'Ja. VitaminFit verkoopt 100% natuurlijke, vegan voedingssupplementen zonder toegevoegde suikers, in plasticvrije papieren verpakkingen.' },
    { q: 'Wat verkoopt VitaminFit?', a: 'Vegan voedingssupplementen voor volwassenen (magnesium, omega 3, vitamine B12, IJzer Complex) en kinderen (o.a. Kinder Calciumpoeder), plus kruideninfusies en thee zonder toegevoegde suikers.' }
  ]
};
