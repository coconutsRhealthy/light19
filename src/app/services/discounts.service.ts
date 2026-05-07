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

  getRecentlyAddedSlugs(days: number): Set<string> {
    const recentDates = this.lastNDates(days);
    const slugs = new Set<string>();
    for (const entry of discountsData) {
      const [company, , , , date] = entry.split(',').map(s => s.trim());
      if (date && recentDates.has(date)) {
        slugs.add(this.toSlug(company));
      }
    }
    return slugs;
  }

  private lastNDates(days: number): Set<string> {
    const dates = new Set<string>();
    const d = new Date();
    for (let i = 0; i < days; i++) {
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.add(`${mm}-${dd}`);
      d.setDate(d.getDate() - 1);
    }
    return dates;
  }

  private toSlug(companyName: string): string {
    return companyName.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
  }
}
