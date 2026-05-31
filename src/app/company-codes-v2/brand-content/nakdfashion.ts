import { BrandContent } from './brand-content.model';

/**
 * Copy grounded in NA-KD's real influencer captions (py_diski_influencers DB,
 * ai_canonical = 'nakdfashion'): 644 captions from ~180 NL creators, the
 * recurring "personal code = 15% off, 48h, excl. other discounts & newest
 * influencer collection" mechanic, and the trending items creators actually post.
 */
export const nakdfashionContent: BrandContent = {
  slug: 'nakdfashion',
  name: 'NA-KD',

  // Related shops by shared-influencer co-occurrence (Instagram).
  related: ['mockberg', 'bjornborg', 'gutsgusto', 'icaniwill', 'cider', 'edikted',
            'bubbleroom', 'famousstore', 'emmasleepnl', 'temu', 'begolden', 'parfumado'],

  heroLede:
    'Alle werkende NA-KD kortingscodes en influencer-codes op één plek — goed voor ' +
    '15% korting op je hele bestelling. Verzameld uit de codes die honderden creators ' +
    'delen en dagelijks gecontroleerd door onze redactie.',

  about: [
    'NA-KD (uitgesproken als "naked") is een Zweeds online modemerk uit Gotenburg, opgericht ' +
    'in 2015. Het merk draait volledig om trendgedreven dameskleding en groeide uit tot een van ' +
    'de bekendste influencer-modemerken van Europa.',

    'Wat NA-KD uniek maakt is het influencer-model: in plaats van klassieke reclame werkt het ' +
    'merk samen met honderden content creators die elk een persoonlijke kortingscode delen. ' +
    'In onze eigen data zien we ruim 180 Nederlandse creators die NA-KD dragen en daarbij vrijwel ' +
    'altijd dezelfde deal aanbieden: 15% korting op de hele collectie.'
  ],

  why: [
    { h: 'Trendgedreven dameskleding', p: 'Jurken, sets, linnen, denim en schoenen die meebewegen met de seizoenstrends.' },
    { h: 'Persoonlijke influencer-codes', p: 'Bijna elke code geeft 15% korting op je hele bestelling — en werkt voor iedereen.' },
    { h: 'Snel wisselende collecties', p: 'Nieuwe drops volgen de trends op de voet, van butter yellow tot polkadots en linnen.' },
    { h: 'Europese verzending', p: 'NA-KD levert door heel Europa, met de bekende retourmogelijkheden.' }
  ],

  trending: [
    'Zomerjurken en maxi-jurken',
    'Linnen sets en linnen pakken',
    'Butter yellow — dé kleur van de zomer',
    'Polkadot-prints',
    'Loafers (leer & suède) en witte jeans',
    'Trenchcoats en luchtige laagjes'
  ],

  codeInfo: [
    'NA-KD werkt vooral met persoonlijke influencer-codes, en die werken allemaal op dezelfde ' +
    'manier: vrijwel elke code geeft 15% korting op je hele bestelling. Je hoeft de influencer ' +
    'niet te volgen — een werkende code werkt voor iedereen.',

    'Let op de voorwaarden die de creators er zelf bij vermelden: de codes zijn meestal maar ' +
    '48 uur geldig (soms 7 dagen), zijn niet te combineren met andere kortingen, en gelden niet ' +
    'op de allernieuwste influencer-collectie. Daarom controleren wij de codes dagelijks en ' +
    'zetten we verlopen codes snel offline.'
  ],

  creators: [
    '@mirjamschuurkamp', '@mariska.van.es', '@ipeksteenbeek', '@lunaweerman',
    '@kickiedeklijn', '@juliacatharinax', '@evahelenameijer', '@audrybos'
  ],

  tips: [
    { h: 'Pak een influencer-code voor 15%', p: 'Alle persoonlijke codes werken hetzelfde — kies er gewoon één die op dit moment geldig is.' },
    { h: 'Wees snel', p: 'De meeste NA-KD codes zijn maar 48 uur geldig. Daarom updaten wij de lijst dagelijks.' },
    { h: 'Codes stapelen niet', p: 'Je gebruikt één code per bestelling; combineren met andere kortingen kan niet, en de nieuwste influencer-collectie is uitgesloten.' },
    { h: 'Shop seizoensitems op tijd', p: 'Populaire stukken (nu: zomerjurken, linnen sets, butter yellow) zijn vaak snel uitverkocht in de gewilde maten.' }
  ],

  faq: [
    {
      q: 'Hoeveel korting krijg ik met een NA-KD kortingscode?',
      a: 'Vrijwel alle NA-KD kortingscodes geven 15% korting op je hele bestelling. Het zijn ' +
         'persoonlijke codes van influencers, maar ze werken voor iedereen.'
    },
    {
      q: 'Hoe lang is een NA-KD kortingscode geldig?',
      a: 'Meestal 48 uur, soms 7 dagen. Omdat de codes snel verlopen, controleert onze redactie ' +
         'dagelijks welke op dit moment werken.'
    },
    {
      q: 'Kan ik meerdere NA-KD kortingscodes combineren?',
      a: 'Nee. Je gebruikt één code per bestelling. NA-KD codes zijn niet te combineren met andere ' +
         'kortingen en gelden niet op de allernieuwste influencer-collectie.'
    },
    {
      q: 'Werkt de kortingscode van een influencer ook voor mij?',
      a: 'Ja. De persoonlijke codes die creators delen werken voor iedereen — je hoeft de ' +
         'influencer niet te volgen om 15% korting te krijgen.'
    },
    {
      q: 'Waar komt NA-KD vandaan?',
      a: 'NA-KD is een Zweeds modemerk uit Gotenburg, opgericht in 2015. Het merk staat bekend om ' +
         'trendgerichte dameskleding en zijn grote netwerk van content creators.'
    }
  ]
};
