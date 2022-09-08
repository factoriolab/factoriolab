import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
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
import { from, Observable, tap } from 'rxjs';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppSharedModule } from './app-shared.module';
import { AppComponent } from './app.component';
import { LabErrorHandler, RouterService, StateService } from './services';
import { ThemeService } from './services/theme.service';
import { metaReducers, reducers } from './store';
import { AnalyticsEffects } from './store/analytics.effects';
import { DatasetsEffects } from './store/datasets/datasets.effects';
import { FactoriesEffects } from './store/factories/factories.effects';
import { ProductsEffects } from './store/products/products.effects';
import { ServiceWorkerModule } from '@angular/service-worker';

function initializeApp(
  primengConfig: PrimeNGConfig,
  translateSvc: TranslateService,
  routerSvc: RouterService,
  stateSvc: StateService,
  themeSvc: ThemeService
): () => Observable<any> {
  return () => {
    // Enable ripple
    primengConfig.ripple = true;

    // Initialize services
    translateSvc.setDefaultLang('en');
    stateSvc.initialize();
    themeSvc.initialize();

    // Load glpk-wasm
    return from(loadModule('assets/glpk-wasm/glpk.all.wasm')).pipe(
      tap(() => {
        // Wait to initialize router
        routerSvc.initialize();
      })
    );
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
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreDevtoolsModule.instrument({
      logOnly: environment.production,
    }),
    EffectsModule.forRoot([
      DatasetsEffects,
      ProductsEffects,
      FactoriesEffects,
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
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: environment.baseHref },
    { provide: ErrorHandler, useClass: LabErrorHandler },
    {
      provide: APP_INITIALIZER,
      deps: [
        PrimeNGConfig,
        TranslateService,
        RouterService,
        StateService,
        ThemeService,
      ],
      useFactory: initializeApp,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
