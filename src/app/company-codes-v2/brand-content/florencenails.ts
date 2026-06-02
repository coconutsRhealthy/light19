import { BrandContent } from './brand-content.model';

/**
 * Copy grounded in Florence Nails' real influencer captions (py_diski_influencers DB,
 * ai_canonical = 'florencenails'): 25 captions from 2 NL nail-tech creators
 * (@lakjenagel, @nagels.a). Niche: Nederlands gellak/gelpolish-merk voor nageltechs
 * en thuisgebruikers — cat eye gelpolish, builder gel, glitter/aura en seizoenscollecties
 * (o.a. Golden Hour, Western Heat, Match Point Pastels). Discount mechanic: persoonlijke
 * creator-codes voor 10% korting (LAKJENAGEL10, nagels.a10) — discount_pattern = 10% in alle 25 captions.
 */
export const florencenailsContent: BrandContent = {
  slug: 'florencenails',
  name: 'Florence Nails',
  related: ['lakkiegellak', 'pinkgellac', 'seductionail', 'thegelexpert', 'venalisa.com'],
  heroLede:
    'Alle werkende Florence Nails kortingscodes en creator-codes op één plek — meestal goed ' +
    'voor 10% korting op je hele bestelling gelpolish en nailart-benodigdheden. Dagelijks ' +
    'gecontroleerd door onze redactie.',
  about: [
    'Florence Nails is een Nederlands nagelmerk dat zich richt op gelpolish en producten voor ' +
    'nailart. Het assortiment dat creators in onze data laten zien bestaat vooral uit cat eye ' +
    'gelpolish, builder gel om de natuurlijke nagel te verstevigen of te verlengen, klassieke ' +
    'gellak-kleuren en glitters zoals de Aura-lijn. Het merk werkt met seizoensgebonden ' +
    'collecties — denk aan Golden Hour, Western Heat en Match Point Pastels — die regelmatig ' +
    'met nieuwe kleuren worden uitgebreid.',
    'Florence Nails laat zich vooral zien via nageltechs op social media. In onze eigen data ' +
    'delen 2 Nederlandse creators (waaronder @lakjenagel en @nagels.a) hun looks met Florence ' +
    'Nails-kleuren, en koppelen ze daar vrijwel altijd dezelfde deal aan: een persoonlijke code ' +
    'voor 10% korting. De captions draaien om swatches van nieuwe collecties en seizoensgerichte ' +
    'nailart, van Valentijn en Pasen tot Halloween en kerst.'
  ],
  why: [
    {
      h: 'Cat eye en gelpolish in trendkleuren',
      p: 'De creators tonen vooral cat eye gelpolish en seizoenskleuren zoals Honey Gold, ' +
         'Aurora Blush, Lilac Match en New York Red — kleuren die telkens in nieuwe collecties terugkomen.'
    },
    {
      h: 'Builder gel voor natuurlijke nagels',
      p: 'De builder gel wordt in captions gebruikt om de natuurlijke nagellengte te verstevigen, ' +
         'niet alleen om te verlengen — handig voor een natuurlijke set met een twist.'
    },
    {
      h: 'Regelmatig nieuwe collecties',
      p: 'Florence Nails brengt door het jaar heen nieuwe collecties uit (o.a. Golden Hour, ' +
         'Western Heat, Match Point Pastels), vaak met vier nieuwe kleuren per drop.'
    },
    {
      h: 'Persoonlijke creator-codes',
      p: 'Vrijwel elke post bevat een persoonlijke code die 10% korting geeft op je bestelling.'
    }
  ],
  trending: [
    'Cat eye gelpolish (o.a. Aurora Blush, Honey Gold)',
    'Golden Hour collectie',
    'Western Heat herfstkleuren',
    'Builder gel voor natuurlijke nagels',
    'Aura glitter',
    'Pastel lentekleuren (Match Point Pastels)'
  ],
  codeInfo: [
    'Florence Nails werkt vooral met persoonlijke creator-codes. In onze data geven deze codes ' +
    'telkens 10% korting — bijvoorbeeld LAKJENAGEL10 of nagels.a10. De codes worden gedeeld door ' +
    'nageltechs die het merk gebruiken, maar werken doorgaans voor iedereen die bij Florence Nails bestelt.',
    'De voorwaarden worden in de captions niet uitgebreid genoemd; sommige codes worden gekoppeld ' +
    'aan een nieuwe collectie. Het kortingspercentage is in onze data steeds 10%. Omdat codes ' +
    'kunnen wijzigen, controleren wij ze dagelijks.'
  ],
  creators: ['@lakjenagel', '@nagels.a'],
  tips: [
    {
      h: 'Gebruik een creator-code voor 10%',
      p: 'Codes als LAKJENAGEL10 en nagels.a10 geven 10% korting op je bestelling.'
    },
    {
      h: 'Let op nieuwe collecties',
      p: 'Creators delen swatches zodra een nieuwe collectie verschijnt — handig om kleuren vooraf te zien.'
    },
    {
      h: 'Bundel je nailart-benodigdheden',
      p: 'Combineer builder gel, gelpolish en glitter in één bestelling zodat de korting over meer producten loopt.'
    },
    {
      h: 'Shop seizoenskleuren op tijd',
      p: 'Populaire seizoens- en cat eye kleuren komen geregeld in beperkte drops; bestel ze vroeg.'
    }
  ],
  faq: [
    {
      q: 'Hoeveel korting krijg ik met een Florence Nails kortingscode?',
      a: 'In onze data geven de creator-codes steeds 10% korting op je bestelling. Het exacte ' +
         'percentage kan per actie verschillen, dus check altijd de meest recente code.'
    },
    {
      q: 'Hoe gebruik ik een Florence Nails code?',
      a: 'Je voert de code (bijvoorbeeld LAKJENAGEL10 of nagels.a10) in tijdens het afrekenen om ' +
         'de korting toe te passen.'
    },
    {
      q: 'Werkt de code van een creator ook voor mij?',
      a: 'Ja, de persoonlijke creator-codes worden door nageltechs gedeeld maar werken doorgaans ' +
         'voor iedereen die bij Florence Nails bestelt.'
    },
    {
      q: 'Wat verkoopt Florence Nails?',
      a: 'Florence Nails verkoopt gelpolish en nailart-benodigdheden, waaronder cat eye gelpolish, ' +
         'builder gel, gellak-kleuren en glitters zoals de Aura-lijn, vaak in seizoenscollecties.'
    },
    {
      q: 'Zijn de Florence Nails codes altijd geldig?',
      a: 'Codes kunnen wijzigen of aan een collectie gekoppeld zijn. Daarom controleren wij de ' +
         'codes dagelijks zodat je de meest actuele korting ziet.'
    }
  ]
};
