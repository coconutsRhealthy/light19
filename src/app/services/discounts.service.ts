import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import discountsData from '../data/discounts.json';

@Injectable({
  providedIn: 'root',
})
export class DiscountsService {

  constructor() {}

  getDiscounts(): Observable<string[]> {
    return of(discountsData);
  }

  private recentSlugsCache: { key: string; slugs: Set<string> } | null = null;

  getRecentlyAddedSlugs(days: number): Set<string> {
    const today = new Date();
    const cacheKey = `${days}:${this.formatMonthDay(today)}`;
    if (this.recentSlugsCache?.key === cacheKey) {
      return this.recentSlugsCache.slugs;
    }

    const recentDates = this.lastNDates(today, days);
    const slugs = new Set<string>();
    for (const entry of discountsData) {
      const [company, , , , date] = entry.split(',').map(s => s.trim());
      if (date && recentDates.has(date)) {
        slugs.add(this.toSlug(company));
      }
    }
    this.recentSlugsCache = { key: cacheKey, slugs };
    return slugs;
  }

  private lastNDates(from: Date, days: number): Set<string> {
    const dates = new Set<string>();
    const d = new Date(from);
    for (let i = 0; i < days; i++) {
      dates.add(this.formatMonthDay(d));
      d.setDate(d.getDate() - 1);
    }
    return dates;
  }

  private formatMonthDay(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}-${dd}`;
  }

  private toSlug(companyName: string): string {
    return companyName.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
  }
}
