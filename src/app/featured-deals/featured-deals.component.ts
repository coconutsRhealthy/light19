import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DiscountsService } from '../services/discounts.service';
import { LogosService } from '../services/logos.service';
import { WebshopNameService } from '../services/webshop-name.service';
import { BUILD_DATE_ISO } from '../build-info';
import { FEATURED_SLUGS } from '../data/featured-slugs';
import spottedSalesData from '../data/spotted-sales.json';

// Both feeds are bundled, so this section prerenders — no runtime fetch.
// Sales are keyed by the same slug the brand pages use, newest-first already
// (see scripts/generate-spotted-sales.js).
const SPOTTED_SALES = spottedSalesData as { [slug: string]: { text: string; date: string }[] };

/** Never render more than this many cards, however many slugs are eligible. */
const MAX_CARDS = 5;

/** A sale older than this (relative to the build date) is stale and never shown. */
const SALE_MAX_AGE_DAYS = 1;

// One slot goes to the single freshest sale across the whole allowlist; the rest
// go to codes from randomly drawn shops. When no sale is fresh enough, its slot
// falls back to another code so the rail is never short.
const SALE_SLOTS = 1;

const MONTHS_NL = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december'
];

/** One card. A shop can produce a code card AND a sale card — they're separate. */
export interface FeaturedCardVM {
  kind: 'code' | 'sale';
  slug: string;
  name: string;
  logo?: string;

  // kind === 'code'
  valueText?: string;   // "25%" or "€8"
  titleText?: string;   // "25% korting"

  // kind === 'sale'
  saleText?: string;

  /** When this code/sale was spotted; drives the rail order. */
  spottedAt: Date;
  dateLabel: string;   // "13 juli 2026"
  dateIso: string;     // "2026-07-13", for <time datetime>
}

@Component({
  selector: 'app-featured-deals',
  imports: [RouterModule],
  templateUrl: './featured-deals.component.html',
  styleUrls: ['./featured-deals.component.css'],
})
export class FeaturedDealsComponent implements OnInit {
  cards: FeaturedCardVM[] = [];

  private logos: { [slug: string]: string } = {};

  constructor(
    private discountsService: DiscountsService,
    private logosService: LogosService,
    private names: WebshopNameService,
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

    // --- the sale slot: the single freshest sale across the whole allowlist ----
    const saleCard = this.pickSaleCard(buildDate);

    // --- the code slots: shops drawn at random, each showing its newest code ---
    // Don't let the sale's shop take a code slot too — five cards, five shops.
    const codePool = FEATURED_SLUGS
      .filter(slug => newestCode.has(slug))
      .filter(slug => slug !== saleCard?.slug);

    const codeSlots = MAX_CARDS - (saleCard ? SALE_SLOTS : 0);

    // Seeded on the build date: a fresh draw every build, but prerender and
    // hydration reproduce the same one (see seededShuffle).
    const codeCards = this.seededShuffle(codePool, BUILD_DATE_ISO)
      .slice(0, codeSlots)
      .map(slug => this.toCodeCard(slug, newestCode.get(slug)!));

    const cards = saleCard ? [...codeCards, saleCard] : codeCards;
    return cards.sort((a, b) => b.spottedAt.getTime() - a.spottedAt.getTime());
  }

  /** The freshest sale across every allowed shop — one card, or none if all are stale. */
  private pickSaleCard(buildDate: Date): FeaturedCardVM | null {
    let best: { slug: string; text: string; date: Date; iso: string } | null = null;

    for (const slug of FEATURED_SLUGS) {
      const sale = SPOTTED_SALES[slug]?.[0];   // each shop's list is newest-first
      if (!sale) continue;

      const date = this.parseIsoDate(sale.date);
      const ageDays = (buildDate.getTime() - date.getTime()) / 86400000;
      if (ageDays > SALE_MAX_AGE_DAYS) continue;   // stale — sales age out fast

      if (!best || date.getTime() > best.date.getTime()) {
        best = { slug, text: sale.text, date, iso: sale.date };
      }
    }

    if (!best) return null;

    return {
      kind: 'sale',
      slug: best.slug,
      name: this.displayName(best.slug),
      logo: this.logos[best.slug],
      saleText: best.text,
      spottedAt: best.date,
      dateLabel: this.formatDate(best.date),
      dateIso: best.iso,
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

  /** The single most recent code per featured slug. */
  private newestCodePerSlug(lines: string[], year: number): Map<string, { rawValue: string; date: Date }> {
    const wanted = new Set(FEATURED_SLUGS);
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

  trackBrandClick(card: FeaturedCardVM): void {
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') {
      gtag('event', 'brand_click', {
        event_category: 'Featured_Deals',
        event_label: `featured_${card.kind}_${card.slug}`,
      });
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
