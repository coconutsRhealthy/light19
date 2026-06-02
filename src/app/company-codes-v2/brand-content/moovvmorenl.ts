import { BrandContent } from './brand-content.model';

/**
 * Copy grounded in Moovv's real influencer captions (py_diski_influencers DB,
 * ai_canonical = 'moovvmore.nl'): 32 captions from 22 NL creators. Niche: inklapbare
 * loopbanden / treadmills voor thuis (o.a. de SmartStep Pro v2/v3 Incline met helling).
 * Recurring mechanic: een persoonlijke creator-code geeft meestal 10% extra korting
 * bovenop de lopende sale; daarnaast noemen captions vaste euro-kortingen (€20–€30 met
 * code, sale tot €100–€150) en regelmatig gratis accessoires t.w.v. ~€75. Veel content
 * draait om stappendoelen (10.000 stappen), bewegen in slecht/koud weer en challenges
 * (#MOOVV10Kchallenge, 66 dagen Habit Challenge) plus terugkerende giveaways.
 */
export const moovvmorenlContent: BrandContent = {
  slug: 'moovvmore.nl',
  name: 'Moovv',
  related: ['teveo', 'fitpiggy.nl', 'morenutrition', 'albelli', 'bodylab.nl',
            'samakocleaning', 'disneyonice.nl', 'emmasleepnl', 'vitakruid', 'icaniwill'],
  heroLede:
    'Alle werkende Moovv kortingscodes en influencer-codes op één plek — meestal goed ' +
    'voor zo\'n 10% extra korting bovenop de lopende sale op je loopband. Verzameld uit ' +
    'de codes die tientallen creators delen en dagelijks gecontroleerd door onze redactie.',
  about: [
    'Moovv verkoopt inklapbare loopbanden (treadmills) voor thuis, waaronder de SmartStep ' +
    'Pro-serie met instelbare helling (incline). De banden zijn compact: in de captions ' +
    'schuiven creators ze na het lopen gewoon onder de bank of het bankstel. Het idee dat ' +
    'steeds terugkomt is "makkelijk meer bewegen" — je stappendoel halen tijdens een serie, ' +
    'een boek of een werkdag, ook als het buiten koud, nat of donker is.',
    'In onze data delen 22 Nederlandse creators een Moovv-loopband, vaak vanuit een fit- of ' +
    'home-hoek. Bijna iedereen koppelt de post aan een persoonlijke kortingscode en aan ' +
    'stappen-challenges zoals de #MOOVV10Kchallenge (10.000 stappen per dag) of een 66 dagen ' +
    'Habit Challenge. Daarnaast zien we regelmatig giveaways waarbij Moovv samen met een ' +
    'creator een SmartStep Pro Incline loopband weggeeft.'
  ],
  why: [
    { h: 'Inklapbaar en compact', p: 'De loopbanden vouwen op en schuiven onder de bank, ideaal als je geen vaste ruimte voor een sportband hebt.' },
    { h: 'Instelbare helling', p: 'De SmartStep Pro Incline-modellen lopen met helling (tot zo\'n 10%), waardoor wandelen thuis intensiever wordt.' },
    { h: 'Persoonlijke influencer-codes', p: 'Vrijwel elke creator heeft een eigen code die meestal 10% extra korting geeft bovenop de actuele actie.' },
    { h: 'Bewegen wanneer het jou uitkomt', p: 'Creators gebruiken de band vooral \'s avonds of bij slecht weer — geen sportschool, geen weersexcuus.' }
  ],
  trending: ['SmartStep Pro v3 Incline loopband', 'SmartStep Pro v2 loopband', 'Inklapbare loopbanden voor thuis', '10.000 stappen-challenges', 'Loopband met ingebouwde stappenteller', 'Gratis accessoirepakketten t.w.v. ~€75'],
  codeInfo: [
    'Moovv werkt vooral met persoonlijke influencer-codes. In de captions geven die meestal ' +
    '10% extra korting (codes als CESAR, NOA, JOY10, SHARON10, VALERY10), terwijl sommige ' +
    'codes een vast bedrag korten — bijvoorbeeld €30 met MOL20 of €30 met JEANINE10. Dat ' +
    'komt vrijwel altijd bovenop een lopende sale, en niet als losse korting.',
    'Let op de voorwaarden: de korting geldt vaak in combinatie met een actieperiode (Spring ' +
    'Sale, Black Friday, maand-challenges) met sale-bedragen tot €100–€150, en soms zit er ' +
    'gratis accessoirepakket van rond de €75 bij. Acties wisselen snel en zijn meestal tijdelijk, ' +
    'dus controleren wij dagelijks welke codes nog werken.'
  ],
  creators: ['@cesar.hendrix', '@carolinemol', '@fit.met.britt', '@annebelvisscher',
             '@keeb.motivated', '@noalaetitiaa', '@juudithhome', '@carmenvanweersel'],
  tips: [
    { h: 'Combineer code met de sale', p: 'De extra 10% van een influencer-code komt meestal bovenop de lopende actie — check dus eerst welke sale loopt.' },
    { h: 'Shop tijdens actieperiodes', p: 'Captions noemen de hoogste kortingen rond Black Friday, Spring Sale en maand-challenges. Dan zijn de sale-bedragen het grootst.' },
    { h: 'Let op gratis accessoires', p: 'Bij sommige acties zit een accessoirepakket van zo\'n €75 inbegrepen — meegenomen naast de korting.' },
    { h: 'Wees snel', p: 'De acties zijn meestal tijdelijk en raken de hoogste kortingen snel uit; wacht niet te lang.' }
  ],
  faq: [
    { q: 'Hoeveel korting krijg ik met een Moovv kortingscode?', a: 'De meeste influencer-codes geven zo\'n 10% extra korting bovenop de lopende sale. Sommige codes korten in plaats daarvan een vast bedrag, bijvoorbeeld €30.' },
    { q: 'Werkt de code bovenop de sale?', a: 'Ja, in de captions wordt de persoonlijke code vrijwel altijd gestapeld bovenop een lopende actie, niet als losse korting.' },
    { q: 'Hoe lang is een Moovv kortingscode geldig?', a: 'Dat wisselt. Codes hangen vaak aan een actieperiode zoals Black Friday, een Spring Sale of een maand-challenge en zijn meestal tijdelijk. Daarom controleren wij dagelijks.' },
    { q: 'Wat verkoopt Moovv?', a: 'Moovv verkoopt inklapbare loopbanden voor thuis, waaronder de SmartStep Pro-serie met instelbare helling. Ze zijn compact en schuiven na gebruik onder de bank.' },
    { q: 'Zitten er extra\'s bij?', a: 'Bij sommige acties noemen creators een gratis accessoirepakket van rond de €75 dat bovenop de korting bij de loopband geleverd wordt.' }
  ]
};
