import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LOCALE_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MetaService } from '../services/meta.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

/**
 * Supermarket price arbitrage: the same article priced at several Dutch chains,
 * showing where it is cheapest today.
 *
 * The data is produced by the `eurosgoedkoper` repository, which scrapes ten
 * chains daily, matches articles across them by barcode where one exists and by
 * a guarded fuzzy match where none does, and publishes the result to R2. This
 * page only renders; every judgement about what counts as the same product, what
 * a promotion actually costs per unit, and which chain is cheapest was made
 * upstream. See that repo's FINDINGS.md before questioning a number here.
 */

interface Offer {
  chain: string;
  price: number;      // effective unit price, promotions already applied
  was: number;        // strike-through price, 0 when there is no discount
  url: string;
  deal: string;       // "2e halve prijs", "2+1 gratis", "" when none
  minQty: number;
  since: string;      // "" unless this chain has a discount running
  until: string;      // "" when the end date is unknown
}

interface Deal {
  id: number;
  name: string;
  brand: string;
  size: string;
  category: string;
  image: string | null;
  gap: number;        // cheapest vs dearest, in euros
  score: number;      // how attractive for an ordinary shop; see report.popularity
  spotted: string;
  tags: string[];
  offers: Offer[];
}

interface Feed {
  generated: string;
  count: number;
  chains: { [slug: string]: { name: string; hue: string; note?: string } };
  synonyms: { [typed: string]: string[] };
  deals: Deal[];
}

@Component({
  selector: 'app-beste-bonus',
  imports: [FooterComponent, NavbarComponent, FormsModule],
  templateUrl: './beste-bonus.component.html',
  styleUrls: ['./beste-bonus.component.css', './../app.component.css'],
  providers: [DatePipe, { provide: LOCALE_ID, useValue: 'nl' }],
})
export class BesteBonusComponent implements OnInit {

  /** Written by eurosgoedkoper's `local.py publish` after every collection cycle. */
  private feedUrl =
    'https://pub-a3be569620e4415b916e737210363aee.r2.dev/beste-bonus/deals.json';

  loading = true;
  failed = false;

  private all: Deal[] = [];
  private chainsMap: { [slug: string]: { name: string; hue: string; note?: string } } = {};
  private synonyms: { [typed: string]: string[] } = {};
  /** Every tag in the feed, so a typed word that IS a tag is not expanded. */
  private knownTags = new Set<string>();

  generated = '';
  totalDeals = 0;

  categories: { name: string; count: number }[] = [];
  activeCategory = 'alle';

  sort: 'pop' | 'gap' = 'pop';
  searchTerm = '';

  visible: Deal[] = [];
  private filtered: Deal[] = [];
  private readonly initialVisible = 24;
  readonly loadStep = 48;
  visibleCount = this.initialVisible;

  /** Cards the visitor has expanded to see every chain. */
  private expanded = new Set<number>();

  constructor(
    private http: HttpClient,
    private meta: MetaService,
    private datePipe: DatePipe,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    const title = 'Beste bonus: aanbiedingen van 10 winkels vergeleken | Diski';
    const description =
      'Dagelijks vergeleken: dezelfde producten bij Albert Heijn, Jumbo, PLUS, ' +
      'Dirk, Aldi, Etos, Kruidvat en meer. Zie per product waar de bonus het ' +
      'meest oplevert en hoeveel je bespaart.';
    this.meta.updateTitle(title);
    this.meta.updateMetaInfo(
      description, 'diski.nl',
      'beste bonus, aanbiedingen vergelijken, supermarkt aanbiedingen, ' +
      'drogisterij aanbiedingen, goedkoopste winkel, prijzen vergelijken, ' +
      'bonus deze week, boodschappen besparen',
    );
    // og:url must match the canonical exactly. Social platforms cache on og:url,
    // so a mismatch splits the same page into two entries and divides its shares.
    // The trailing slash is the site's convention (see TrailingSlashUrlSerializer).
    this.meta.updateOgTags(title, description, 'https://diski.nl/beste-bonus/');
    // Structured data, as the home page and shop pages do. CollectionPage rather
    // than ItemList: the contents change every day and are ranked client-side, so
    // enumerating items here would be stale the moment it shipped.
    this.meta.setJsonLd('beste-bonus', {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Beste bonus',
      url: 'https://diski.nl/beste-bonus/',
      description: description,
      inLanguage: 'nl-NL',
      isPartOf: { '@type': 'WebSite', name: 'Diski', url: 'https://diski.nl' },
      about: {
        '@type': 'Thing',
        name: 'Aanbiedingen en bonussen bij Nederlandse supermarkten en drogisterijen',
      },
    });
  }

  ngOnInit() {
    // Prerender leaves the skeleton in the static HTML rather than baking in a
    // build-time snapshot of prices, which would be stale the moment it shipped.
    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get<Feed>(`${this.feedUrl}?t=${Date.now()}`).subscribe({
      next: (feed) => {
        this.all = feed.deals ?? [];
        this.chainsMap = feed.chains ?? {};
        this.synonyms = feed.synonyms ?? {};
        this.knownTags = new Set(this.all.flatMap(d => d.tags).map(t => this.flat(t)));
        this.generated = feed.generated;
        this.totalDeals = this.all.length;
        this.buildCategories();
        this.apply();
        this.loading = false;
      },
      error: () => { this.failed = true; this.loading = false; },
    });
  }

  // ------------------------------------------------------------------ search
  //
  // Ported from the standalone report, deliberately unchanged. Three rules were
  // each learned by getting them wrong on real queries; see TAGGING.txt in the
  // eurosgoedkoper repo for the full account.

  /** Lowercase and strip diacritics, so "creme" finds "crème". */
  private flat(s: string): string {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  /**
   * Split the query into words, each expanded to its synonyms.
   * A word that is ALREADY a tag is never expanded: "tandpasta" is both a tag and
   * a way of typing "mondzorg", and expanding it turned a toothpaste search into
   * the whole mouthcare aisle, led by an electric toothbrush.
   */
  private terms(raw: string): string[][] {
    return this.flat(raw).split(/[\s,]+/).filter(Boolean).map(w =>
      this.knownTags.has(w)
        ? [w]
        : [...new Set([w, ...(this.synonyms[w] || []).map(s => this.flat(s))])]);
  }

  /**
   * 0 = no match, 1 = matched on the product name only, 2 = matched a tag.
   *
   * Matching is on WORD START, never substring: "bier" must not find biergist.
   * Name matches are kept rather than dropped because under half the catalogue is
   * tagged, so dropping them would lose real results — but they rank below tag
   * matches, which is what stopped a lactic-acid descaler ("melkzuur") from
   * appearing second in a search for "melk".
   */
  private hit(d: Deal, groups: string[][]): 0 | 1 | 2 {
    if (!groups.length) return 1;
    const words = this.flat(d.name).split(/[^a-z0-9]+/).filter(Boolean);
    const tags = (d.tags || []).map(t => this.flat(t));
    let tagged = false;
    for (const alts of groups) {
      const byTag = alts.some(t => tags.some(g => g.startsWith(t)));
      const byName = alts.some(t => words.some(w => w.startsWith(t)));
      if (!byTag && !byName) return 0;
      if (byTag) tagged = true;
    }
    return tagged ? 2 : 1;
  }

  // ------------------------------------------------------------------ listing

  private buildCategories() {
    const counts = new Map<string, number>();
    for (const d of this.all) {
      const c = d.category || 'Overig';
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    this.categories = [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  /** Re-filter, re-rank and reset to the first page. */
  private apply() {
    const groups = this.terms(this.searchTerm);
    const score = new Map<number, number>();

    let rows = this.all.filter(d => {
      if (this.activeCategory !== 'alle' && (d.category || 'Overig') !== this.activeCategory) {
        return false;
      }
      const h = this.hit(d, groups);
      if (h) score.set(d.id, h);
      return h > 0;
    });

    // Search relevance always leads: a tag match outranks a name match whatever
    // the sort. Only ties fall through to the chosen ordering.
    const rank = this.sort === 'pop' ? this.spread(rows) : null;
    rows.sort((a, b) =>
      (score.get(b.id)! - score.get(a.id)!) ||
      (rank ? rank.get(b.id)! - rank.get(a.id)! : b.gap - a.gap));

    this.filtered = rows;
    this.visibleCount = this.initialVisible;
    this.slice();
  }

  /**
   * Popularity score per deal, with repeated brands pushed down.
   *
   * The score itself comes from the feed (see report.popularity upstream), which
   * ranks by proportion saved and how much the product looks like a weekly shop
   * rather than by absolute euros — sorting on absolute gap put nine Oral-B
   * toothbrushes at the top of a groceries page.
   *
   * Spreading is done here rather than upstream because it depends on what is
   * currently VISIBLE: filtering by category or searching changes which deals
   * compete, so a rank baked into the feed would be wrong the moment a chip is
   * clicked. Without it the first screen was three Douwe Egberts ice coffees,
   * three Magnums and two Fernandes — 24 slots holding ten distinct products.
   *
   * Brand falls back to the first word of the name, which is where the brand sits
   * for the chains that publish none.
   */
  private spread(rows: Deal[]): Map<number, number> {
    const seen = new Map<string, number>();
    const adjusted = new Map<number, number>();
    for (const d of [...rows].sort((a, b) => b.score - a.score)) {
      const key = (d.brand || d.name.split(' ')[0] || '').toLowerCase();
      const n = seen.get(key) ?? 0;
      adjusted.set(d.id, d.score / (1 + 0.6 * n));
      seen.set(key, n + 1);
    }
    return adjusted;
  }

  private slice() {
    this.visible = this.filtered.slice(0, this.visibleCount);
  }

  get resultCount(): number { return this.filtered.length; }
  get hasMore(): boolean { return this.visibleCount < this.filtered.length; }

  showMore() { this.visibleCount += this.loadStep; this.slice(); }
  onSearch() { this.apply(); }
  clearSearch() { this.searchTerm = ''; this.apply(); }
  selectCategory(name: string) { this.activeCategory = name; this.apply(); }
  setSort(s: 'pop' | 'gap') { this.sort = s; this.apply(); }

  // ------------------------------------------------------------------- cards

  /** Cheapest first — the whole point of the page. */
  offersOf(d: Deal): Offer[] {
    return [...d.offers].sort((a, b) => a.price - b.price);
  }

  /** Two chains plus the winner is enough to make the point; the rest expand. */
  shownOffers(d: Deal): Offer[] {
    const all = this.offersOf(d);
    return this.expanded.has(d.id) ? all : all.slice(0, 3);
  }

  hiddenCount(d: Deal): number {
    return this.expanded.has(d.id) ? 0 : Math.max(0, d.offers.length - 3);
  }

  toggle(d: Deal) {
    if (this.expanded.has(d.id)) this.expanded.delete(d.id);
    else this.expanded.add(d.id);
  }

  isExpanded(d: Deal): boolean { return this.expanded.has(d.id); }

  chainName(slug: string): string { return this.chainsMap[slug]?.name ?? slug; }
  chainHue(slug: string): string { return this.chainsMap[slug]?.hue ?? '#43302E'; }

  /**
   * A caveat about that chain's own website, shown beside a discount.
   *
   * PLUS keeps the chosen store in localStorage, so no link can pre-select one
   * and its product page shows no price at all until the visitor picks a store.
   * The price we quote is right, but unverifiable at the other end without that
   * step, so the card says so rather than letting the link look broken. The text
   * comes from the feed, so a chain gaining or losing this needs no change here.
   */
  chainNote(slug: string): string { return this.chainsMap[slug]?.note ?? ''; }

  euro(n: number): string {
    return n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /** "3 aug" — the day the winning price was last confirmed. */
  shortDate(iso: string): string {
    if (!iso) return '';
    return this.datePipe.transform(new Date(iso), 'd MMM') ?? '';
  }

  /** Human phrasing for a promo window, "" when nothing is known. */
  promoWindow(o: Offer): string {
    if (o.since && o.until) return `geldt sinds ${this.shortDate(o.since)}, t/m ${this.shortDate(o.until)}`;
    if (o.since) return `geldt sinds ${this.shortDate(o.since)}`;
    if (o.until) return `t/m ${this.shortDate(o.until)}`;
    return '';
  }

  trackById(_: number, d: Deal) { return d.id; }
  trackByChain(_: number, o: Offer) { return o.chain; }
}
