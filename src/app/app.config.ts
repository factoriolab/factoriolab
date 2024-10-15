import { APP_BASE_HREF } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  ErrorHandler,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  withRouterConfig,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { loadModule } from 'glpk-ts';
import { PrimeNGConfig } from 'primeng/api';
import { environment } from 'src/environments';

import { routes } from './app.routes';
import { ErrorService } from './services/error.service';
import { ThemeService } from './services/theme.service';
import {
  DEFAULT_LANGUAGE,
  TranslateService,
} from './services/translate.service';

function initializeApp(primengConfig: PrimeNGConfig): () => Promise<unknown> {
  return () => {
    // Enable ripple
    primengConfig.ripple = true;

    // Set up initial theme
    ThemeService.appInitTheme();

    // Load glpk-wasm
    return loadModule('assets/glpk-wasm/glpk.all.wasm');
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_BASE_HREF, useValue: environment.baseHref },
    { provide: DEFAULT_LANGUAGE, useValue: 'en' },
    { provide: ErrorHandler, useClass: ErrorService },
    {
      provide: APP_INITIALIZER,
      deps: [
        PrimeNGConfig,
        /**
         * Not actually used by `initializeApp`; included to ensure service
         * constructor is run so language data is requested immediately.
         */
        TranslateService,
      ],
      useFactory: initializeApp,
      multi: true,
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
