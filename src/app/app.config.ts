import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter, UrlSerializer, withInMemoryScrolling } from '@angular/router';
import { VisitorProfileService } from './services/visitor-profile.service';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { registerLocaleData } from '@angular/common';
import localeNl from '@angular/common/locales/nl';
import { LOCALE_ID } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { TrailingSlashUrlSerializer } from './services/trailing-slash-url-serializer';

registerLocaleData(localeNl, 'nl');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Scroll to top on each new navigation (and restore position on back/forward).
    // Without this Angular leaves the scroll where it was, so navigating from a
    // scrolled homepage into a v2 page opened it mid-page.
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'nl' },
    { provide: UrlSerializer, useClass: TrailingSlashUrlSerializer },
    provideClientHydration(withEventReplay()),
    { provide: APP_INITIALIZER, useFactory: (vp: VisitorProfileService) => () => {}, deps: [VisitorProfileService], multi: true }
  ]
};
