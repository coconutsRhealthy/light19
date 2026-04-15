import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { VisitorProfileService } from './services/visitor-profile.service';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { registerLocaleData } from '@angular/common';
import localeNl from '@angular/common/locales/nl';
import { LOCALE_ID } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

registerLocaleData(localeNl, 'nl');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'nl' },
    provideClientHydration(withEventReplay()),
    { provide: APP_INITIALIZER, useFactory: (vp: VisitorProfileService) => () => {}, deps: [VisitorProfileService], multi: true }
  ]
};
