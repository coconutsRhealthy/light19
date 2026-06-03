import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { BRAND_CONTENT_LOADER } from './company-codes-v2/brand-content/brand-content.token';
import { serverBrandContentLoader } from './company-codes-v2/brand-content/brand-content.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    // SERVER-ONLY: this import keeps the brand-content data (and node:fs) out of
    // the browser bundle. The component reads each page's content back from
    // TransferState; see brand-content.service.ts.
    { provide: BRAND_CONTENT_LOADER, useValue: serverBrandContentLoader },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
