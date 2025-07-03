import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, CUSTOM_ELEMENTS_SCHEMA, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient()
  ]
};
