import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'diski_visitor_profile';

interface ProfileEvent {
  type: string;
  company?: string;
  searchValue?: string;
  datetime: string;
}

interface VisitorProfile {
  events: ProfileEvent[];
}

@Injectable({ providedIn: 'root' })
export class VisitorProfileService {
  private platformId = inject(PLATFORM_ID);

  trackCompanyClick(type: string, company: string): void {
    this.record({ type, company });
  }

  trackSearch(term: string): void {
    this.record({ type: 'search', searchValue: term });
  }

  getProfile(): VisitorProfile {
    if (!isPlatformBrowser(this.platformId)) return { events: [] };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { events: [] };
    } catch {
      return { events: [] };
    }
  }

  private record(event: Omit<ProfileEvent, 'datetime'>): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const profile = this.getProfile();
    profile.events.push({ ...event, datetime: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }
}
