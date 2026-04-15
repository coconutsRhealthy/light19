import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'diski_visitor_profile';

interface ProfileEvent {
  type: string;
  company: string;
  datetime: string;
}

interface VisitorProfile {
  events: ProfileEvent[];
}

@Injectable({ providedIn: 'root' })
export class VisitorProfileService {
  private platformId = inject(PLATFORM_ID);

  trackEvent(type: string, company: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const profile = this.getProfile();
    profile.events.push({ type, company, datetime: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
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
}
