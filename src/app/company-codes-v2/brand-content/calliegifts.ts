import { BrandContent } from './brand-content.model';

/**
 * Copy grounded in Callie Gifts' real influencer captions (py_diski_influencers DB,
 * ai_canonical = 'calliegifts'): 22 captions from ~20 NL/BE creators — overwhelmingly
 * mom-, gezins- en lifestyle-accounts. The recurring mechanic is a persoonlijke
 * code = 15% korting op het hele assortiment (discount_pattern: 17x "15"). Niche is
 * gepersonaliseerde cadeaus: dekens/plaids met naam, truien met geboortebloem & initiaal,
 * tassen/broodtrommels/etuis voor school, mokken, wandplaten, handdoeken en reistassen.
 */
export const calliegiftsContent: BrandContent = {
  slug: 'calliegifts',
  name: 'Callie Gifts',
  related: ['achateshop.com', 'geurwolkje', 'mothersearth', 'paulaschoice.nl',
            'smartphoto.nl', 'everdrop', 'twistshakebaby', 'wildrefill',
            'charlottetilbury', 'deplay'],
  heroLede:
    'Alle werkende Callie Gifts kortingscodes en influencer-codes op één plek — goed voor ' +
    '15% korting op het hele assortiment gepersonaliseerde cadeaus. Verzameld uit de codes ' +
    'die tientallen creators delen en dagelijks gecontroleerd door onze redactie.',
  about: [
    'Callie Gifts is een online cadeaushop die volledig draait om gepersonaliseerde items. ' +
    'In de captures van creators zien we een breed assortiment terugkomen: dekens en plaids ' +
    'met naam, truien met geboortebloem en initiaal, tassen, broodtrommels en etuis voor ' +
    'school, mokken, wandplaten, handdoeken en reistassen. Je voegt zelf een naam, datum of ' +
    'tekstje toe, waardoor elk item een persoonlijk cadeau wordt voor verjaardag, geboorte, ' +
    'Moederdag, Sinterklaas of Kerst.',
    'In onze data delen zo\'n 20 voornamelijk Nederlandse en Belgische creators Callie Gifts — ' +
    'vooral mama-, gezins- en lifestyle-accounts. Ze laten doorgaans zien hoe ze zelf een item ' +
    'samenstellen (een schooltas met naam, een fleecedeken voor de kinderen, een mok met "Mama") ' +
    'en bieden daarbij vrijwel altijd dezelfde deal aan: 15% korting met hun persoonlijke code.'
  ],
  why: [
    { h: 'Alles personaliseerbaar', p: 'Naam, geboortedatum, initiaal of een eigen tekst op dekens, truien, mokken, tassen en meer — creators benadrukken steeds de ruime keuze.' },
    { h: 'Persoonlijke influencer-codes', p: 'Bijna elke code in onze data geeft 15% korting op het hele assortiment.' },
    { h: 'Breed cadeau-assortiment', p: 'Van geboorte- en Moederdagcadeaus tot Halloween-, Sinterklaas- en kerstitems en schoolspullen — voor jezelf of als cadeau.' },
    { h: 'Cadeaus met emotionele waarde', p: 'Creators noemen vaak de persoonlijke, bijzondere touch: een item dat speciaal voor iemand is gemaakt.' }
  ],
  trending: ['Dekens & plaids met naam', 'Truien met geboortebloem & initiaal', 'Schooltassen, broodtrommels & etuis', 'Gepersonaliseerde mokken', 'Wandplaten met eigen tekst', 'Reistassen met naam'],
  codeInfo: [
    'Callie Gifts werkt vooral met persoonlijke influencer-codes die je in de bestelling invult. ' +
    'In vrijwel alle captions die wij zien geeft zo\'n code 15% korting op het hele assortiment. ' +
    'De codes verschillen per creator (denk aan iets als "wish338t" of "gifta857"), maar het ' +
    'kortingspercentage is meestal hetzelfde.',
    'Let op de voorwaarden: de korting geldt doorgaans op het reguliere assortiment en codes zijn ' +
    'niet altijd onbeperkt geldig. Omdat creators hun codes regelmatig verversen, controleren wij ' +
    'dagelijks welke nog werken zodat je niet misgrijpt bij het afrekenen.'
  ],
  creators: ['@dianegroenhof', '@thelittlekayafamilyy', '@lysanne_mom_of_twin_girls',
             '@jintsevalkenborgh', '@jozemiek', '@thuisbijlian', '@sannedegeling',
             '@tipsvantiff'],
  tips: [
    { h: 'Pak een influencer-code voor 15%', p: 'De persoonlijke codes werken hetzelfde: vul er één in en je krijgt 15% op je hele bestelling.' },
    { h: 'Stel je cadeau zelf samen', p: 'Voeg een naam, datum of tekst toe — creators combineren vaak meerdere items tot een complete set.' },
    { h: 'Bestel seizoenscadeaus op tijd', p: 'Voor Moederdag, Sinterklaas en Kerst zien we drukte; personalisatie en levering kosten iets meer tijd.' },
    { h: 'Eén code per bestelling', p: 'Reken op één geldige code per order in plaats van meerdere stapelen.' }
  ],
  faq: [
    { q: 'Hoeveel korting krijg ik met een Callie Gifts kortingscode?', a: 'In vrijwel alle captions die wij zien geeft een persoonlijke code 15% korting op het hele assortiment.' },
    { q: 'Hoe werkt een Callie Gifts influencer-code?', a: 'Je vult de persoonlijke code van een creator in tijdens het afrekenen; meestal levert dat 15% korting op. De codes verschillen per creator, het percentage is doorgaans gelijk.' },
    { q: 'Kan ik meerdere codes combineren?', a: 'Nee, ga uit van één geldige code per bestelling in plaats van meerdere codes stapelen.' },
    { q: 'Wat verkoopt Callie Gifts?', a: 'Gepersonaliseerde cadeaus: dekens en plaids met naam, truien met geboortebloem en initiaal, tassen, broodtrommels en etuis, mokken, wandplaten, handdoeken en reistassen.' },
    { q: 'Werkt de code van een influencer ook voor mij?', a: 'Ja, de persoonlijke codes die creators delen werken voor iedereen. Wij controleren dagelijks welke nog actief zijn.' }
  ]
};
