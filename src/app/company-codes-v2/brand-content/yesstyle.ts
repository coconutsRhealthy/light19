import { BrandContent } from './brand-content.model';

/**
 * Copy grounded in YesStyle's real influencer captions (py_diski_influencers DB,
 * ai_canonical = 'yesstyle'): 56 captions from ~15 NL/EU creators. The recurring
 * niche is Aziatische (vooral Koreaanse) skincare & beauty — merken als Beauty of
 * Joseon, PURITO, Medicube, AXIS-Y, VT, mixsoon, Iunik. Het mechanisme is een
 * persoonlijke "rewards code" die extra korting geeft (captions noemen o.a. 5%,
 * 20%, 21%, 25% en "2-5% off any order, even with a coupon"), vaak stapelbaar met
 * een losse couponcode en soms zonder bestelminimum (GLOWUPYEAR: "no order min").
 * Discount_pattern is grotendeels null (geen vast % geparseerd), dus % is gehedged.
 */
export const yesstyleContent: BrandContent = {
  slug: 'yesstyle',
  name: 'YesStyle',
  related: ['shein', 'temu', 'paulaschoice.nl', 'charlottetilbury', 'wildrefill',
            'berlook', 'dreaver', 'commense', 'firmoo', 'glowmode_official'],
  heroLede:
    'Alle werkende YesStyle kortingscodes en influencer-rewardcodes op één plek — ' +
    'meestal goed voor enkele procenten extra korting op je hele bestelling, soms ' +
    'zonder bestelminimum en te combineren met een lopende coupon. Dagelijks ' +
    'gecontroleerd door onze redactie.',
  about: [
    'YesStyle is een online warenhuis voor Aziatische beauty en mode, met de nadruk ' +
    'op Koreaanse (K-beauty) en Japanse skincare. In de captions van creators komen ' +
    'vooral huidverzorgingsmerken voorbij: Beauty of Joseon, PURITO, AXIS-Y, VT, ' +
    'mixsoon, Iunik, Medicube en farmstay — van cleansing balms en vitamine C-serums ' +
    'tot SPF, sheet masks en beauty devices. Daarnaast verkoopt YesStyle make-up en ' +
    'Aziatische mode, met internationale verzending.',
    'In onze eigen data zien we zo\'n 15 creators die YesStyle taggen, en vrijwel ' +
    'allemaal delen ze dezelfde deal: een persoonlijke rewardcode die je bij het ' +
    'afrekenen invult voor extra korting. Veel posts zijn skincare-reviews waarin de ' +
    'creator een product cadeau kreeg ("AD | gekregen", "*gift") en daar een eigen ' +
    'code aan koppelt — denk aan PHALENTINE, GLOWUPYEAR, DARLING21 of RENSKE20.'
  ],
  why: [
    { h: 'Koreaanse & Aziatische skincare', p: 'Het hart van YesStyle is K-beauty: cleansing oils, serums met vitamine C, niacinamide en ginseng, SPF en beauty devices van merken die je hier lastig vindt.' },
    { h: 'Persoonlijke rewardcodes', p: 'Bijna elke creator deelt een eigen rewardcode voor extra korting bij het afrekenen — in de captions zien we percentages van 5% tot ruim 20%.' },
    { h: 'Stapelen met een coupon', p: 'Sommige creators laten zien dat je de rewardcode kunt combineren met een losse couponcode, voor nog meer korting op je bestelling.' },
    { h: 'Internationale verzending', p: 'YesStyle levert wereldwijd, ook naar Nederland, zodat je Aziatische merken rechtstreeks in huis haalt.' }
  ],
  trending: ['Beauty of Joseon (ginseng)', 'Vitamine C-serums tegen pigment', 'PURITO bi-phase serums', 'VT PDRN-zonnebrand SPF50+', 'Medicube AGE-R beauty devices', 'Cleansing balms & oils'],
  codeInfo: [
    'YesStyle werkt vooral met persoonlijke "rewards codes" die influencers delen. Je ' +
    'vult de code in bij het afrekenen voor extra korting. De percentages variëren per ' +
    'code: in de captions zien we onder andere 5% (JULIETTE5), rond de 20-25% en codes ' +
    'die "2-5% off any order, even with a coupon" beloven. Een vast percentage is er ' +
    'dus niet — pak de code met de hoogste korting die op dat moment werkt.',
    'Let op de voorwaarden die creators noemen: de rewardcode is vaak te combineren ' +
    'met een losse couponcode (bijvoorbeeld rewardcode GLOWUPYEAR plus coupon LOVE26 ' +
    'voor 20%), en sommige codes hebben geen bestelminimum ("no order min"). Omdat ' +
    'codes en acties wisselen, controleren wij dagelijks welke nog werken.'
  ],
  creators: ['@valentinejiayu', '@queen_reviewster1976', '@sanne_vander', '@_littledaylight',
             '@contentbyrenske', '@thedarlingglow', '@tanyats.beauty', '@ansje.thagai'],
  tips: [
    { h: 'Gebruik een rewardcode voor extra korting', p: 'Vul bij het afrekenen een persoonlijke rewardcode in; de meeste creators bieden er één aan, van 5% tot ruim 20%.' },
    { h: 'Combineer met een coupon', p: 'Probeer je rewardcode samen met een lopende couponcode — captions tonen dat dit soms stapelt voor extra korting.' },
    { h: 'Check het bestelminimum', p: 'Sommige codes werken zonder minimumbedrag, andere niet. Pak de code die bij jouw bestelling past.' },
    { h: 'Vergelijk de percentages', p: 'Omdat YesStyle geen vast kortingspercentage hanteert, loont het om even te kijken welke code op dit moment het meeste oplevert.' }
  ],
  faq: [
    { q: 'Hoeveel korting krijg ik met een YesStyle kortingscode?', a: 'Dat verschilt per code. In de influencer-captions zien we percentages van 5% tot ruim 20%, en codes die enkele procenten extra geven bovenop een coupon. Een vast percentage hanteert YesStyle niet, dus pak de hoogste werkende code.' },
    { q: 'Kan ik een rewardcode combineren met een coupon?', a: 'Vaak wel. Creators laten zien dat je een persoonlijke rewardcode kunt stapelen met een losse couponcode — bijvoorbeeld een rewardcode plus een couponcode samen voor 20% korting.' },
    { q: 'Geldt er een minimum bestelbedrag?', a: 'Niet altijd. Sommige codes worden met "no order min" gedeeld en werken op elke bestelling, terwijl andere wél een minimum kunnen hebben. Controleer dit bij het afrekenen.' },
    { q: 'Werkt de rewardcode van een influencer ook voor mij?', a: 'Ja, de persoonlijke rewardcodes uit de captions zijn bedoeld om door iedereen te gebruiken. Wij controleren dagelijks welke codes nog werken.' },
    { q: 'Wat verkoopt YesStyle?', a: 'YesStyle is gespecialiseerd in Aziatische beauty en mode, met de nadruk op Koreaanse (K-beauty) en Japanse skincare en make-up — van merken als Beauty of Joseon, PURITO, VT en Medicube — plus Aziatische kleding, met wereldwijde verzending.' }
  ]
};
