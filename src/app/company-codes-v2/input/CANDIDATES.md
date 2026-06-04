# v2 rollout candidates — caption coverage per not-indexed shop

**Generated:** 2026-06-02
**Input:** `input/trailing_slash_urls.txt` (340 not-indexed `/{shop}/` URLs, source: diski.nl Coverage Drilldown 2026-05-29)
**Caption source:** local MariaDB `py_diski_influencers` — `instagram` (32,903 rows) + `tiktok` (7,798 rows), matched on `ai_canonical` (= the URL slug, 1:1 with `discounts.json`).

## What this answers
Which of the 340 currently **not-indexed** shop detail pages have the most influencer
captions behind them — i.e. the most raw material to write **genuinely grounded** v2 copy.
These are the safest, highest-quality shops to flip to v2 first: not indexed today (nothing
to lose), and backed by real source material (so the copy isn't templated filler).

## Headline numbers
- **340** not-indexed shops checked.
- **139** have ≥1 caption; **201** have **zero** (not grounding candidates — would need self-authored copy like Zalando).
- Captions available across the set: **1,021 Instagram + 363 TikTok**.

## How to read the tiers
Per the content-engine project's `docs/CONTENT-GENERATION.md`: **≈15+ captions → caption-grounded** is the recommended mode;
sparser shops drift toward self-authored. Note the **IG vs TikTok split** matters — the
existing 4 grounded shops were mostly Instagram-driven (longer, richer captions). A shop
that is mostly TikTok (e.g. `cabaulifestyle`, `fittasticsportswear`) has thinner per-caption
text, so treat its effective grounding as a notch lower than the total suggests.

---

## 🟢 Tier A — strongest candidates (25 shops, ≥15 captions)
Run v2 on these first. Enough material for fully caption-grounded copy.

| # | Shop (slug) | Instagram | TikTok | **Total** |
|---:|---|---:|---:|---:|
| 1 | `loopearplugs` | 137 | 0 | **137** |
| 2 | `cabaulifestyle` | 18 | 83 | **101** |
| 3 | `siroko` | 50 | 31 | **81** |
| 4 | `bodylab.nl` | 58 | 0 | **58** |
| 5 | `yesstyle` | 42 | 14 | **56** |
| 6 | `charlottetilbury` | 31 | 18 | **49** |
| 7 | `smartphoto.nl` | 42 | 2 | **44** |
| 8 | `photowall_sweden` | 41 | 3 | **44** |
| 9 | `trendcarpet` | 38 | 0 | **38** |
| 10 | `yehwang_wholesale` | 9 | 24 | **33** |
| 11 | `moovvmore.nl` | 28 | 4 | **32** |
| 12 | `wildrefill` | 24 | 7 | **31** |
| 13 | `legionathletics` | 27 | 0 | **27** |
| 14 | `florencenails` | 25 | 0 | **25** |
| 15 | `lampenlicht.nl` | 23 | 2 | **25** |
| 16 | `thegelexpert` | 22 | 0 | **22** |
| 17 | `calliegifts` | 21 | 1 | **22** |
| 18 | `mothersearth` | 21 | 0 | **21** |
| 19 | `jhpfashion.nl` | 9 | 12 | **21** |
| 20 | `merodacosmetics` | 19 | 0 | **19** |
| 21 | `kossonutrition.nl` | 3 | 16 | **19** |
| 22 | `vitaminfit.eu` | 15 | 3 | **18** |
| 23 | `twistshakebaby` | 13 | 5 | **18** |
| 24 | `fittasticsportswear` | 1 | 16 | **17** |
| 25 | `glutespop.com` | 3 | 12 | **15** |

---

## 🟡 Tier B — workable with care (36 shops, 5–14 captions)
Groundable, but mine carefully and hedge claims. Good second wave.

| # | Shop (slug) | Instagram | TikTok | **Total** |
|---:|---|---:|---:|---:|
| 1 | `edgardcooper` | 12 | 2 | **14** |
| 2 | `nextextreme` | 3 | 10 | **13** |
| 3 | `stylewe` | 12 | 0 | **12** |
| 4 | `kaptenandson` | 9 | 3 | **12** |
| 5 | `kilroyworld.nl` | 5 | 7 | **12** |
| 6 | `hushathlete.com` | 4 | 7 | **11** |
| 7 | `organicbasics` | 3 | 8 | **11** |
| 8 | `aelfriceden.com` | 2 | 8 | **10** |
| 9 | `gastonluga` | 9 | 0 | **9** |
| 10 | `zelesta.nl` | 9 | 0 | **9** |
| 11 | `homefitnesscode` | 1 | 8 | **9** |
| 12 | `nooma_design` | 8 | 0 | **8** |
| 13 | `badjasparadijs` | 7 | 0 | **7** |
| 14 | `fejo_studio` | 7 | 0 | **7** |
| 15 | `heymarly` | 7 | 0 | **7** |
| 16 | `kameosleep.nl` | 7 | 0 | **7** |
| 17 | `numsy.nl` | 7 | 0 | **7** |
| 18 | `evryjewels` | 1 | 6 | **7** |
| 19 | `lightofthemoon` | 1 | 6 | **7** |
| 20 | `qcollectionparfums` | 1 | 6 | **7** |
| 21 | `dedic8apparel` | 6 | 0 | **6** |
| 22 | `greenpan.nl` | 6 | 0 | **6** |
| 23 | `hippegeboortekaartjes` | 6 | 0 | **6** |
| 24 | `mayafreya` | 6 | 0 | **6** |
| 25 | `ninjakitchen` | 6 | 0 | **6** |
| 26 | `kymocleaning` | 5 | 1 | **6** |
| 27 | `cupshe` | 5 | 0 | **5** |
| 28 | `disneyonice.nl` | 5 | 0 | **5** |
| 29 | `safira` | 5 | 0 | **5** |
| 30 | `smashed.lemon` | 5 | 0 | **5** |
| 31 | `tobedressed` | 5 | 0 | **5** |
| 32 | `kpactive` | 4 | 1 | **5** |
| 33 | `osock_performance` | 4 | 1 | **5** |
| 34 | `tommyteleshopping` | 4 | 1 | **5** |
| 35 | `vivimariofficial` | 4 | 1 | **5** |
| 36 | `elinerosinajewelry` | 0 | 5 | **5** |

---

## 🟠 Tier C — thin (78 shops, 1–4 captions)
Too sparse to ground confidently; would lean mostly self-authored. Low priority.

<details><summary>Show 78 thin shops</summary>

| # | Shop (slug) | Instagram | TikTok | **Total** |
|---:|---|---:|---:|---:|
| 1 | `bubbleplanetexperience` | 4 | 0 | **4** |
| 2 | `curlsbyiris.nl` | 4 | 0 | **4** |
| 3 | `rcleotards` | 4 | 0 | **4** |
| 4 | `sparkleanddream.nl` | 4 | 0 | **4** |
| 5 | `tweedekansje.com` | 4 | 0 | **4** |
| 6 | `vildthelabel` | 4 | 0 | **4** |
| 7 | `bolerolimonadewinkel` | 3 | 1 | **4** |
| 8 | `cityfit.reformer` | 3 | 0 | **3** |
| 9 | `kidsdepartment` | 3 | 0 | **3** |
| 10 | `loislee.nl` | 3 | 0 | **3** |
| 11 | `lovelys_byheleen` | 3 | 0 | **3** |
| 12 | `spacenk.com` | 3 | 0 | **3** |
| 13 | `studio_untold` | 3 | 0 | **3** |
| 14 | `esdushi.com` | 2 | 1 | **3** |
| 15 | `petree` | 2 | 1 | **3** |
| 16 | `samiol.com` | 2 | 1 | **3** |
| 17 | `brand-parts.nl` | 0 | 3 | **3** |
| 18 | `maeveconceptstore` | 0 | 3 | **3** |
| 19 | `marfum.nl` | 0 | 3 | **3** |
| 20 | `amikoandfriends` | 2 | 0 | **2** |
| 21 | `bygge.store` | 2 | 0 | **2** |
| 22 | `greenstickiq` | 2 | 0 | **2** |
| 23 | `haarshop.nl` | 2 | 0 | **2** |
| 24 | `justrussel.nl` | 2 | 0 | **2** |
| 25 | `locahair` | 2 | 0 | **2** |
| 26 | `luxuryescapes` | 2 | 0 | **2** |
| 27 | `nounthestudio` | 2 | 0 | **2** |
| 28 | `one2track.nl` | 2 | 0 | **2** |
| 29 | `tefal` | 2 | 0 | **2** |
| 30 | `weddingmusthave.nl` | 2 | 0 | **2** |
| 31 | `hillsidethelabel` | 1 | 1 | **2** |
| 32 | `oliviakate` | 1 | 1 | **2** |
| 33 | `philips lumea` | 1 | 1 | **2** |
| 34 | `belovd` | 0 | 2 | **2** |
| 35 | `themylky` | 0 | 2 | **2** |
| 36 | `anwbwinkel` | 1 | 0 | **1** |
| 37 | `awbridal` | 1 | 0 | **1** |
| 38 | `babyinbeeld` | 1 | 0 | **1** |
| 39 | `by-crea.com` | 1 | 0 | **1** |
| 40 | `cavalluna.nl` | 1 | 0 | **1** |
| 41 | `daily-image.nl` | 1 | 0 | **1** |
| 42 | `deachterstehoef` | 1 | 0 | **1** |
| 43 | `deleukstetaartenshop` | 1 | 0 | **1** |
| 44 | `elementre` | 1 | 0 | **1** |
| 45 | `ersanails` | 1 | 0 | **1** |
| 46 | `famme` | 1 | 0 | **1** |
| 47 | `fennaglow.com` | 1 | 0 | **1** |
| 48 | `fitage.com` | 1 | 0 | **1** |
| 49 | `flexispot` | 1 | 0 | **1** |
| 50 | `freciousslowjuice` | 1 | 0 | **1** |
| 51 | `hype_maassluis` | 1 | 0 | **1** |
| 52 | `laifen_benelux` | 1 | 0 | **1** |
| 53 | `lampiece.nl` | 1 | 0 | **1** |
| 54 | `lolalizafashion` | 1 | 0 | **1** |
| 55 | `lotbynature` | 1 | 0 | **1** |
| 56 | `mattsleeps` | 1 | 0 | **1** |
| 57 | `misscolor.webshop` | 1 | 0 | **1** |
| 58 | `morecore.nl` | 1 | 0 | **1** |
| 59 | `oneractive` | 1 | 0 | **1** |
| 60 | `pmu_by_ragh` | 1 | 0 | **1** |
| 61 | `prepmymeal.nl` | 1 | 0 | **1** |
| 62 | `slimteammethode` | 1 | 0 | **1** |
| 63 | `sunzzy` | 1 | 0 | **1** |
| 64 | `tenways` | 1 | 0 | **1** |
| 65 | `unwindjewelry` | 1 | 0 | **1** |
| 66 | `vhpvolumehairplus` | 1 | 0 | **1** |
| 67 | `vqfit` | 1 | 0 | **1** |
| 68 | `yilitehair` | 1 | 0 | **1** |
| 69 | `yourmoeve` | 1 | 0 | **1** |
| 70 | `biteswelove` | 0 | 1 | **1** |
| 71 | `burgerbusiness` | 0 | 1 | **1** |
| 72 | `doreandrose` | 0 | 1 | **1** |
| 73 | `easytoys` | 0 | 1 | **1** |
| 74 | `gimber.com` | 0 | 1 | **1** |
| 75 | `lancome.nl` | 0 | 1 | **1** |
| 76 | `mayeeskincare` | 0 | 1 | **1** |
| 77 | `studiofits.nl` | 0 | 1 | **1** |
| 78 | `thestorewoerden` | 0 | 1 | **1** |

</details>

---

## ⚪ Zero captions (201 shops)
No caption material — same situation as Zalando (self-authored only). Not candidates for the
caption-grounding moat. Listed for completeness.

<details><summary>Show 201 shops with no captions</summary>

`4shine.nl`, `8849tech`, `abib.global`, `acrylfoto.nl`, `aimnsportswear`, `allaboutmomss`, `aloyoga.com`, `alproshop.com`, `amanoknitwear`, `amazfit`, `anthropologie`, `apercueyewear`, `armband.nl`, `aromatiqueshop.nl`, `artonwheels`, `ateliermayworkshops`, `auvine.nl`, `babysonly`, `bandanawinkel`, `banden.nl`, `basalbasics.nl`, `bbdebiestraatseweide`, `beaumelle`, `bellelux`, `beslank`, `besodifferent.nl`, `beurseigenhuis`, `bloomfull.nl`, `boomba`, `boshuisjemaisondubois`, `bottger`, `bozasieraden`, `bslm`, `bstn.com`, `budgetbinder.nl`, `byrenee.nl`, `cabinzero`, `caiacosmetics`, `camperdays`, `catwalkjunkie`, `cecil`, `cecil.nl`, `cinnacrush.nl`, `clinic22`, `clook.nl`, `cortexropes`, `cute-store.nl`, `defoddebosk.nl`, `dekbedovertrekcom`, `depollandelijklogeren`, `desigual`, `dieuw.nl`, `digierastorage`, `disino.nl`, `drukwerknodig`, `dutchprepper`, `earlyjewels`, `efteling`, `eleonorabonucci`, `elourabeauty.nl`, `elsuvon`, `euroflorist`, `expedia`, `fiestabreda.nl`, `fiquethelabel`, `fittfaves`, `flamengolife.nl`, `florianhorsefood`, `fonq`, `footpatrol`, `fotogeschenk`, `gethoeked`, `geurzussies.nl`, `glitzieprints`, `glowxx`, `goayo.nl`, `gocchaofficial`, `goelia`, `groenland.shop`, `grundig`, `guess`, `haarliefjes`, `halara_official`, `handjevolliefde`, `hitapes.nl`, `hondensupplement`, `insentials.com`, `intergard`, `iphone-cases.nl`, `iscooter`, `jdsports`, `jetsjewels`, `jewelhalojewelry`, `jipenjij.com`, `jumbo`, `junelie.nl`, `kaffecurve`, `kitchenaid`, `koffievoordeel`, `lavenrose`, `littledutch`, `lovevoicemail.nl`, `lumea-official.nl`, `lumela.de`, `luniva.eu`, `lycamobile`, `magnaminds.nl`, `marcinbane`, `marleyspoon.nl`, `marlotique.nl`, `marlyskleuranalyse`, `marphieamsterdam`, `melloamsterdam`, `mellsfavorites`, `mepal`, `mommiesandmiracles`, `muzeskincare`, `mvolo.nl`, `myblossco`, `mytrip`, `neevwatches.com`, `nkgellak`, `odido zakelijk`, `ohmydotz`, `opberghoekje.nl`, `osloskinlab`, `outfitrer`, `padelmarket`, `peachywear`, `perfumetrader`, `petitfernand`, `pogodesignshop`, `poleskin.eu`, `premium.xl`, `pumpgymwear`, `pureluv.nl`, `purenaturegoods`, `rapunzelofsweden`, `ready.to.wear.nl`, `rowenta`, `schaefershop`, `sentimo.com`, `sharkclean`, `sieradenbydiana`, `sixt`, `skateshop`, `skechers`, `slingershop`, `solisofswitzerland`, `spoonmoment`, `sterrenstore.nl`, `steviala`, `street-one.nl`, `strellson`, `studentdelivery.nl`, `studiolova`, `summergear.nl`, `sumwonstore`, `superdry`, `tapis.nl`, `texelaanjevoeten.nl`, `thebrandfelice`, `thecolorsalons`, `theconfidenceconcept`, `thedogmusthaves`, `trail`, `traphekjes`, `tuccaswim`, `tuinmeubelshop.nl`, `underarmour`, `unitedconsumers`, `urbaniki`, `vakantieparkbreebronne`, `vanarendonk`, `vanbeekumspecerijen`, `vbs-hobby.nl`, `vettepet.be`, `visolde.com`, `vitalproteins.nl`, `vitamine.shop`, `viverelondon`, `vrbohotels`, `vulpesbabycare`, `vulpesgoods`, `wallabag`, `warmteservice.nl`, `wefashion`, `willie.nl`, `workliving.nl`, `xiaomi`, `xlash`, `yorq.eu`, `yourfavess.nl`, `yvesrocher`, `zalmvanurk.nl`, `zappie`, `zenhotels`, `ziggo`, `zizzifashion`, `zorgkiezer`, `zwilling`

</details>

---

## Recommended first batch
The top of Tier A, prioritising Instagram-heavy shops (richer captions) and a spread of niches:

1. **`loopearplugs`** — 137 IG (huge, single-niche, lifestyle/wellness)
2. **`siroko`** — 50 IG + 31 TT (sportswear, well-balanced)
3. **`bodylab.nl`** — 58 IG (supplements/fitness)
4. **`charlottetilbury`** — 31 IG + 18 TT (beauty, strong brand)
5. **`smartphoto.nl`** / **`photowall_sweden`** — 42/41 IG (home/gifts)
6. **`trendcarpet`** — 38 IG (home)
7. **`yesstyle`** — 42 IG + 14 TT (fashion)

`cabaulifestyle` (101) is the single biggest *total* but is TikTok-dominated (83 TT / 18 IG),
so verify caption depth before relying on it.
