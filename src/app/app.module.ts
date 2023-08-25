import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { EffectsModule } from '@ngrx/effects';
import { Action, ActionReducerMap, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
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

import { environment } from '../environments/environment';
import { AppSharedModule } from './app-shared.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';
import { LabErrorHandler } from './services';
import { ThemeService } from './services/theme.service';
import { LabState, metaReducers, reducers } from './store';
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

@NgModule({
  declarations: [AppComponent],
  imports: [
    /** Angular modules */
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    /** Vendor modules */
    StoreModule.forRoot(reducers as ActionReducerMap<LabState, Action>, {
      metaReducers,
    }),
    StoreDevtoolsModule.instrument({
      logOnly: environment.production,
    }),
    EffectsModule.forRoot([
      DatasetsEffects,
      ObjectivesEffects,
      MachinesEffects,
      AnalyticsEffects,
    ]),
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
    /** App modules */
    AppRoutingModule,
    AppSharedModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: environment.baseHref },
    { provide: ErrorHandler, useClass: LabErrorHandler },
    {
      provide: APP_INITIALIZER,
      deps: [PrimeNGConfig, TranslateService],
      useFactory: initializeApp,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
