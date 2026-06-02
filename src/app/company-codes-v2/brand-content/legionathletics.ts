import { BrandContent } from './brand-content.model';

/**
 * Copy grounded in Legion Athletics' real influencer captions (py_diski_influencers DB,
 * ai_canonical = 'legionathletics'): 27 captions from 5 fitness creators, dominated by
 * @skyreyfit (23 posts). The recurring mechanic is the personal ambassador code
 * (SKY, KITKAT, FIO, HannahLift) tied to supplements — captions mention "use code" + "saves you $$"
 * and an occasional sale; discount_pattern parsed no % (null x27), but discounts.json lists ~10%
 * per code, so figures are hedged. Niche: protein powder & sportsupplementen for the gym/lifting crowd.
 */
export const legionathleticsContent: BrandContent = {
  slug: 'legionathletics',
  name: 'Legion Athletics',
  related: ['dfyne'],
  heroLede:
    'Alle werkende Legion Athletics kortingscodes en influencer-codes op één plek — ' +
    'goed voor doorgaans zo\'n 10% korting op je sportsupplementen. ' +
    'Verzameld uit de codes die fitnesscreators delen en dagelijks gecontroleerd door onze redactie.',
  about: [
    'Legion Athletics is een Amerikaans merk in sportvoeding en supplementen, met een ' +
    'assortiment dat draait om eiwitpoeders (waaronder een plantaardige variant), pre-workouts ' +
    'en andere supplementen voor mensen die regelmatig trainen. In de captions die wij verzamelden ' +
    'komt vooral het eiwitpoeder terug als de favoriete dagelijkse aankoop van creators.',
    'In onze eigen data delen 5 fitnesscreators Legion Athletics, met @skyreyfit veruit het meest ' +
    'actief (23 van de 27 posts). Ze laten het merk vrijwel altijd op dezelfde manier zien: tussen ' +
    'recepten, maaltijdinspiratie en trainingsuitleg door, met een persoonlijke code als "SKY" of ' +
    '"KITKAT" en de boodschap dat die je geld bespaart. Een enkele keer wordt er ook naar een lopende ' +
    'sale verwezen.'
  ],
  why: [
    { h: 'Supplementen voor wie traint', p: 'Eiwitpoeders (ook plantaardig), pre-workout en aanvullende supplementen, gericht op mensen die serieus met de gym of lifting bezig zijn.' },
    { h: 'Persoonlijke ambassador-codes', p: 'Creators krijgen een eigen code (zoals SKY, KITKAT, FIO of HannahLift) waarmee jij doorgaans rond de 10% korting pakt.' },
    { h: 'Vaste favorieten van creators', p: 'In de captions komt steeds hetzelfde eiwitpoeder terug als dagelijkse keuze — geen wisselende sponsordeals, maar een product dat ze zelf blijven gebruiken.' },
    { h: 'Regelmatig sale', p: 'Naast de codes verwijzen creators af en toe naar een lopende uitverkoop, dus check ook of er net een actie loopt.' }
  ],
  trending: ['Whey-eiwitpoeder', 'Plantaardig eiwitpoeder', 'Supplementen voor lifting', 'High-protein recepten', 'Pre-workout'],
  codeInfo: [
    'Legion Athletics werkt vooral met persoonlijke ambassador-codes die fitnesscreators in hun bio ' +
    'en captions delen, zoals SKY, KITKAT, FIO en HannahLift. Onze data laat geen vast kortingspercentage ' +
    'uit de captions zelf zien, maar in onze codelijst staan deze codes meestal voor zo\'n 10% korting — ' +
    'reken dus op een korting in die orde en niet op grote uitschieters.',
    'De codes werken voor iedereen, niet alleen voor de volgers van die ene creator: je vult de code af ' +
    'bij het afrekenen. Let op dat een korting vaak niet te combineren is met een al lopende sale, ' +
    'en dat voorwaarden per code kunnen verschillen. Daarom controleren wij de codes dagelijks.'
  ],
  creators: ['@skyreyfit', '@hannah_fit_lift', '@itsciciboooo', '@fiorella.se', '@kat.sison'],
  tips: [
    { h: 'Pak een ambassador-code', p: 'Codes als SKY of KITKAT geven doorgaans rond de 10% korting en werken voor iedereen — gewoon invullen bij het afrekenen.' },
    { h: 'Vergelijk met de sale', p: 'Creators verwijzen soms naar een lopende uitverkoop. Check welke van de twee voor jouw mandje het voordeligst uitpakt.' },
    { h: 'Codes stapelen meestal niet', p: 'Reken op één code per bestelling, en dat een code vaak niet bovenop een sale komt.' },
    { h: 'Begin met het eiwitpoeder', p: 'Dat is het product dat creators in onze data het vaakst noemen als hun vaste keuze — een logisch startpunt.' }
  ],
  faq: [
    { q: 'Hoeveel korting krijg ik met een Legion Athletics kortingscode?', a: 'Onze codelijst noemt voor de meeste influencer-codes zo\'n 10% korting. De captions zelf vermelden geen vast percentage, dus reken op een korting in die orde en check de exacte voorwaarden bij het afrekenen.' },
    { q: 'Werkt de code van een influencer ook voor mij?', a: 'Ja. De persoonlijke ambassador-codes (zoals SKY, KITKAT, FIO of HannahLift) zijn voor iedereen te gebruiken — je vult ze gewoon in bij je bestelling.' },
    { q: 'Kan ik een code combineren met een sale?', a: 'Meestal niet. Een kortingscode is vaak niet te stapelen met een al lopende uitverkoop, dus vergelijk welke van de twee het voordeligst is.' },
    { q: 'Wat verkoopt Legion Athletics?', a: 'Sportvoeding en supplementen: eiwitpoeders (waaronder een plantaardige variant), pre-workout en aanvullende supplementen voor mensen die regelmatig trainen.' },
    { q: 'Waar komt Legion Athletics vandaan?', a: 'Het is een Amerikaans supplementenmerk. In onze data wordt het vooral gedeeld door internationale fitnesscreators, met name @skyreyfit.' }
  ]
};
