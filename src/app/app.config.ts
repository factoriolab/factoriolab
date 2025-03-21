import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  // ErrorHandler,
  inject,
  isDevMode,
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

import { routes } from './app.routes';
// import { ErrorService } from './services/error.service';
// import { ThemeService } from './services/theme.service';
import {
  DEFAULT_LANGUAGE,
  TranslateService,
} from './services/translate.service';

function initializeApp(_: TranslateService): () => Promise<unknown> {
  return () => {
    // Set up initial theme
    //     ThemeService.appInitTheme();

    // Load glpk-wasm
    return loadModule('glpk-wasm/glpk.all.wasm');
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: DEFAULT_LANGUAGE, useValue: 'en' },
    // { provide: ErrorHandler, useClass: ErrorService },
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
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
