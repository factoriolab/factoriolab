import { APP_BASE_HREF } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
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
import { environment } from 'src/environments';

import { routes } from './app.routes';
import { ErrorService } from './services/error.service';
import { ThemeService } from './services/theme.service';
import {
  DEFAULT_LANGUAGE,
  TranslateService,
} from './services/translate.service';

function initializeApp(_: TranslateService): () => Promise<unknown> {
  return () => {
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
    provideAppInitializer(() => {
      const initializerFn = initializeApp(inject(TranslateService));
      return initializerFn();
    }),
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
