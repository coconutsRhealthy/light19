import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DiscountsService } from '../services/discounts.service';
import { LogosService } from '../services/logos.service';
import { WebshopNameService } from '../services/webshop-name.service';
import { AffiliateLinkService } from '../services/affiliate-link.service';
import { VisitorProfileService } from '../services/visitor-profile.service';
import { BUILD_DATE_ISO } from '../build-info';
import { FEATURED_SLUGS, PINNED_SLUGS, SALE_SLUG } from '../data/featured-slugs';
import spottedSalesData from '../data/spotted-sales.json';
import topDealsData from '../data/top-deals.json';

declare global {
  interface Window {
    sendEventToGa: (eventName: string, eventLabel: string) => void;
  }
}

// Both feeds are bundled, so this section prerenders — no runtime fetch.
// Sales are keyed by the same slug the brand pages use, newest-first already
// (see scripts/generate-spotted-sales.js).
const SPOTTED_SALES = spottedSalesData as { [slug: string]: { text: string; date: string }[] };

// Hand-written "top deals" (src/app/data/top-deals.json). These outrank the code
// and sale cards and take the first slots in the rail. Fully manual — no feed data.
interface TopDeal { slug: string; text: string; date: string; url?: string; image?: string; }
const TOP_DEALS = (topDealsData.deals ?? []) as TopDeal[];

/** Never render more than this many cards, however many slugs are eligible. */
const MAX_CARDS = 5;

/** A sale older than this (relative to the build date) is stale and never shown. */
const SALE_MAX_AGE_DAYS = 1;

// One slot (pinned to the bottom of the rail — card 4 or 5) goes to the single
// freshest sale across the WHOLE spotted-sales feed, not just the featured slugs;
// the rest go to codes from randomly drawn featured shops. When no sale is fresh
// enough, its slot falls back to another code so the rail is never short.
const SALE_SLOTS = 1;

const MONTHS_NL = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december'
];

/** One card. A shop can produce a code card AND a sale card — they're separate. */
export interface FeaturedCardVM {
  kind: 'code' | 'sale' | 'top';
  slug: string;
  name: string;
  logo?: string;

  // kind === 'code'
  valueText?: string;   // "25%" or "€8"
  titleText?: string;   // "25% korting"

  // kind === 'sale' | 'top' — free text shown on the card
  saleText?: string;

  // kind === 'top' — optional custom destination; when set the card links here
  // (external, new tab) instead of the brand page.
  linkUrl?: string;

  // kind === 'top' — optional artwork for the card's header strip; replaces the
  // sky→butter gradient (and the brand name printed on it).
  imageUrl?: string;

  /** When this code/sale was spotted; drives the rail order. */
  spottedAt: Date;
  dateLabel: string;   // "13 juli 2026"
  dateIso: string;     // "2026-07-13", for <time datetime>
}

@Component({
  selector: 'app-featured-deals',
  imports: [RouterModule, NgTemplateOutlet],
  templateUrl: './featured-deals.component.html',
  styleUrls: ['./featured-deals.component.css'],
})
export class FeaturedDealsComponent implements OnInit {
  cards: FeaturedCardVM[] = [];

  private logos: { [slug: string]: string } = {};
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private discountsService: DiscountsService,
    private logosService: LogosService,
    private names: WebshopNameService,
    private affiliateLinkService: AffiliateLinkService,
    private visitorProfile: VisitorProfileService,
  ) {}

  ngOnInit(): void {
    this.logosService.getAllLogos().subscribe(logos => {
      this.logos = logos;
      this.cards = this.cards.map(c => ({ ...c, logo: this.logos[c.slug] }));
    });

    this.discountsService.getDiscounts().subscribe(lines => {
      this.cards = this.build(lines);
    });
  }

  private build(lines: string[]): FeaturedCardVM[] {
    const buildDate = this.buildDate();
    const newestCode = this.newestCodePerSlug(lines, buildDate.getFullYear());

    // --- top deals: hand-written, always lead the rail (first/left-most slots) --
    const topCards = this.pickTopCards().slice(0, MAX_CARDS);
    const topSlugs = new Set(topCards.map(c => c.slug));
    const roomAfterTop = MAX_CARDS - topCards.length;

    // --- pinned shops: guaranteed a slot, in listed order, before the draw -----
    // Their cards come from the live feed like any other code card, so a pin
    // always shows that shop's newest code. Skipped when it has none, or when
    // it's already leading the rail as a top deal.
    const pinnedCards = PINNED_SLUGS
      .filter(slug => newestCode.has(slug))
      .filter(slug => !topSlugs.has(slug))
      .slice(0, roomAfterTop)
      .map(slug => this.toCodeCard(slug, newestCode.get(slug)!));

    const pinnedSlugs = new Set(pinnedCards.map(c => c.slug));
    const spokenFor = new Set([...topSlugs, ...pinnedSlugs]);
    const roomAfterPinned = roomAfterTop - pinnedCards.length;

    // --- the sale slot: the single freshest sale across the whole feed ---------
    // Skip shops already shown as a top deal or a pin so no brand appears twice.
    const saleCard = roomAfterPinned > 0 ? this.pickSaleCard(buildDate, spokenFor) : null;

    // --- the code slots: shops drawn at random, each showing its newest code ---
    // Exclude the sale's shop and anything already spoken for, so every card is
    // a different brand.
    const codePool = FEATURED_SLUGS
      .filter(slug => newestCode.has(slug))
      .filter(slug => slug !== saleCard?.slug)
      .filter(slug => !spokenFor.has(slug));

    const codeSlots = roomAfterPinned - (saleCard ? SALE_SLOTS : 0);

    // Seeded on the build date: a fresh draw every build, but prerender and
    // hydration reproduce the same one (see seededShuffle). Codes sit in the
    // middle, sorted newest-first among themselves.
    const codeCards = this.seededShuffle(codePool, BUILD_DATE_ISO)
      .slice(0, Math.max(0, codeSlots))
      .map(slug => this.toCodeCard(slug, newestCode.get(slug)!))
      .sort((a, b) => b.spottedAt.getTime() - a.spottedAt.getTime());

    // The sale tails the code group (slot 4/5 of that group), never floated up by
    // recency. 4-vs-5 is seeded on the build date so prerender and hydration agree.
    let tail = codeCards;
    if (saleCard) {
      tail = [...codeCards];
      const bottom = Math.max(0, tail.length - 1);
      const insertIndex = this.seededBit(BUILD_DATE_ISO) ? bottom : tail.length;
      tail.splice(insertIndex, 0, saleCard);
    }

    // Top deals lead, then pins, then codes, then the sale at the bottom.
    return [...topCards, ...pinnedCards, ...tail].slice(0, MAX_CARDS);
  }

  /** The hand-written top deals as cards, newest date first. Fully manual —
   *  no feed lookups; the slug just supplies the logo, name and link. */
  private pickTopCards(): FeaturedCardVM[] {
    return TOP_DEALS
      .filter(d => d && d.slug && d.text && /^\d{4}-\d{2}-\d{2}$/.test(d.date))
      .map(d => {
        const date = this.parseIsoDate(d.date);
        return {
          kind: 'top' as const,
          slug: d.slug,
          name: this.displayName(d.slug),
          logo: this.logos[d.slug],
          saleText: d.text,
          linkUrl: d.url?.trim() || undefined,   // custom landing page, if any
          imageUrl: d.image?.trim() || undefined,  // header artwork, if any
          spottedAt: date,
          dateLabel: this.formatDate(date),
          dateIso: d.date,
        };
      })
      .sort((a, b) => b.spottedAt.getTime() - a.spottedAt.getTime());
  }

  /** Deterministic coin flip from a seed — used to alternate the sale between
   *  slot 4 and slot 5 without Math.random() (prerender/hydration must agree). */
  private seededBit(seed: string): boolean {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    h = (h * 1664525 + 1013904223) >>> 0;   // one LCG step, same family as seededShuffle
    return (h & 1) === 0;
  }

  /** The rail's single sale card: the hand-picked SALE_SLUG when one is set,
   *  otherwise the freshest sale across EVERY shop in the feed (not just the
   *  featured slugs — the slot is deliberately unrestricted). Null when neither
   *  yields anything. */
  private pickSaleCard(buildDate: Date, exclude: Set<string> = new Set()): FeaturedCardVM | null {
    return this.pickChosenSaleCard(exclude) ?? this.pickFreshestSaleCard(buildDate, exclude);
  }

  /** The hand-picked sale from SALE_SLUG, or null to fall back to the automatic
   *  pick — when nothing is set, the shop has no sale in the feed, or it's already
   *  on the rail as a top deal or a pin (it would otherwise show up twice).
   *  Deliberately skips the SALE_MAX_AGE_DAYS cutoff: the slug was named by hand,
   *  so an older sale still renders rather than silently doing nothing. */
  private pickChosenSaleCard(exclude: Set<string>): FeaturedCardVM | null {
    const slug = SALE_SLUG.trim().toLowerCase();
    if (!slug || exclude.has(slug)) return null;

    const sale = SPOTTED_SALES[slug]?.[0];   // each shop's list is newest-first
    if (!sale) return null;

    return this.toSaleCard(slug, sale.text, sale.date);
  }

  /** The single most recent sale anywhere in the feed, or none if all are stale.
   *  Ties are broken by feed order, which is alphabetical — set SALE_SLUG when a
   *  specific shop has to win the slot. */
  private pickFreshestSaleCard(buildDate: Date, exclude: Set<string>): FeaturedCardVM | null {
    let best: { slug: string; text: string; date: Date; iso: string } | null = null;

    for (const slug of Object.keys(SPOTTED_SALES)) {
      if (exclude.has(slug)) continue;         // already shown as a top deal
      const sale = SPOTTED_SALES[slug]?.[0];   // each shop's list is newest-first
      if (!sale) continue;

      const date = this.parseIsoDate(sale.date);
      const ageDays = (buildDate.getTime() - date.getTime()) / 86400000;
      if (ageDays > SALE_MAX_AGE_DAYS) continue;   // stale — sales age out fast

      if (!best || date.getTime() > best.date.getTime()) {
        best = { slug, text: sale.text, date, iso: sale.date };
      }
    }

    return best ? this.toSaleCard(best.slug, best.text, best.iso) : null;
  }

  private toSaleCard(slug: string, text: string, iso: string): FeaturedCardVM {
    const date = this.parseIsoDate(iso);
    return {
      kind: 'sale',
      slug,
      name: this.displayName(slug),
      logo: this.logos[slug],
      saleText: text,
      spottedAt: date,
      dateLabel: this.formatDate(date),
      dateIso: iso,
    };
  }

  private toCodeCard(slug: string, code: { rawValue: string; date: Date }): FeaturedCardVM {
    const valueText = this.formatValue(code.rawValue);
    return {
      kind: 'code',
      slug,
      name: this.displayName(slug),
      logo: this.logos[slug],
      valueText,
      titleText: valueText ? `${valueText} korting` : undefined,
      spottedAt: code.date,
      dateLabel: this.formatDate(code.date),
      dateIso: this.toIsoDate(code.date),
    };
  }

  // Draw deterministically instead of with Math.random(): ngOnInit runs twice —
  // once at prerender, once at hydration — and two different draws would make the
  // client tear down the prerendered cards and swap the shops out under the user.
  // Seeding on the build date gives each build its own stable draw that server and
  // client both reproduce. Same shuffle the v1 related-shops grid uses.
  private seededShuffle<T>(items: T[], seed: string): T[] {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

    const pool = [...items];
    for (let i = pool.length - 1; i > 0; i--) {
      h = (h * 1664525 + 1013904223) >>> 0; // LCG step — cheap, deterministic
      const j = h % (i + 1);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }

  /** The single most recent code per featured or pinned slug. A pin does not have
   *  to be in FEATURED_SLUGS, so both lists are looked up. */
  private newestCodePerSlug(lines: string[], year: number): Map<string, { rawValue: string; date: Date }> {
    const wanted = new Set([...FEATURED_SLUGS, ...PINNED_SLUGS]);
    const out = new Map<string, { rawValue: string; date: Date }>();

    for (const line of lines) {
      const parts = line.split(', ');
      const slug = (parts[0] ?? '').replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
      if (!wanted.has(slug)) continue;
      if (!(parts[1] ?? '').trim()) continue;   // no code on the row

      const rawValue = (parts[2] ?? '').trim();
      const date = this.parseMonthDay((parts[4] ?? '').trim(), year);
      const seen = out.get(slug);
      if (!seen || date.getTime() > seen.date.getTime()) {
        out.set(slug, { rawValue, date });
      }
    }
    return out;
  }

  /** Same flow as the homepage code cards and the "beste sale" tiles: track the
   *  click, then hand the visitor off to the affiliate link while the brand page
   *  opens in a new tab. Without an affiliate link the routerLink just navigates. */
  onCardClick(card: FeaturedCardVM, event: MouseEvent): void {
    this.trackBrandClick(card);

    // A top deal with a custom landing page is a plain external link — let the
    // anchor's href handle navigation (no affiliate/brand-page redirect).
    if (card.linkUrl) return;

    const affiliateLink = this.affiliateLinkService.getAffiliateLink(card.slug);
    if (affiliateLink !== undefined && this.isBrowser) {
      event.preventDefault();
      const brandPageUrl = `${window.location.origin}/${card.slug}/`;
      window.open(brandPageUrl, '_blank');
      location.href = affiliateLink;
    }
  }

  private trackBrandClick(card: FeaturedCardVM): void {
    // Same profile stream as every other brand click on the homepage, so the
    // visitor's interest in this shop is recorded the usual way.
    this.visitorProfile.trackCompanyClick('company_click_homepage', card.slug);
    if (!this.isBrowser) return;

    // The rail gets its own GA event (deliberately NOT the sitewide CopyCode one):
    // the code/sale split keeps the rail's clicks separable from the rest.
    if (typeof window.sendEventToGa === 'function') {
      window.sendEventToGa('FeaturedDeal', `${card.kind}_${card.slug}`);
    }
  }

  // ---- helpers ---------------------------------------------------------------

  private displayName(slug: string): string {
    return this.names.getWebshopName(slug) ?? slug.charAt(0).toUpperCase() + slug.slice(1);
  }

  /** Percentages stay as "25%"; anything else (€8, "tot 50", "1+1") prints as-is. */
  private formatValue(rawValue: string): string | undefined {
    if (!rawValue) return undefined;
    const isPercent = !rawValue.includes('€') && isFinite(Number(rawValue));
    return isPercent ? `${rawValue}%` : rawValue.replace('.', ',');
  }

  /** Codes carry only "MM-DD"; the year comes from the build, like the v2 pages. */
  private parseMonthDay(monthDay: string, year: number): Date {
    const [mm, dd] = monthDay.split('-').map(Number);
    if (!mm || !dd) return new Date(year, 0, 1);
    return new Date(year, mm - 1, dd);
  }

  private formatDate(d: Date): string {
    return `${d.getDate()} ${MONTHS_NL[d.getMonth()]} ${d.getFullYear()}`;
  }

  private toIsoDate(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  private parseIsoDate(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }

  /** Anchored to the build date, not runtime, so prerender and hydration agree. */
  private buildDate(): Date {
    const [y, m, d] = (BUILD_DATE_ISO || '').split('-').map(Number);
    return (y && m && d) ? new Date(y, m - 1, d) : new Date();
  }
}
