import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
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
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { loadModule } from 'glpk-ts';
import {
  NgxGoogleAnalyticsModule,
  NgxGoogleAnalyticsRouterModule,
} from 'ngx-google-analytics';
import { PrimeNGConfig } from 'primeng/api';

import { environment } from 'src/environments';
import { routes } from './app.routes';
import { LabErrorHandler, ThemeService } from './services';
import { metaReducers, reducers } from './store';
import { AnalyticsEffects } from './store/analytics.effects';
import { DatasetsEffects } from './store/datasets/datasets.effects';
import { MachinesEffects } from './store/machines/machines.effects';
import { ObjectivesEffects } from './store/objectives/objectives.effects';

function initializeApp(
  primengConfig: PrimeNGConfig,
  translateSvc: TranslateService,
): () => Promise<unknown> {
  return () => {
    // Enable ripple
    primengConfig.ripple = true;

    // Set up initial theme
    ThemeService.appInitTheme();

    // Initialize translate service with default to English
    translateSvc.setDefaultLang('en');

    // Load glpk-wasm
    return loadModule('assets/glpk-wasm/glpk.all.wasm');
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_BASE_HREF, useValue: environment.baseHref },
    { provide: ErrorHandler, useClass: LabErrorHandler },
    {
      provide: APP_INITIALIZER,
      deps: [PrimeNGConfig, TranslateService],
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
    provideStore(reducers, {
      metaReducers,
    }),
    provideStoreDevtools({ logOnly: environment.production }),
    provideEffects(
      DatasetsEffects,
      ObjectivesEffects,
      MachinesEffects,
      AnalyticsEffects,
    ),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient) => {
            return new TranslateHttpLoader(http, './assets/i18n/', '.json');
          },
          deps: [HttpClient],
        },
        defaultLanguage: 'en',
      }),
      NgxGoogleAnalyticsModule.forRoot('G-TFR5Z43GPH'),
      NgxGoogleAnalyticsRouterModule,
    ),
  ],
};
