import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { loadModule } from 'glpk-ts';
import {
  NgxGoogleAnalyticsModule,
  NgxGoogleAnalyticsRouterModule,
} from 'ngx-google-analytics';
import { PrimeNGConfig } from 'primeng/api';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  ColumnsDialogComponent,
  ContentComponent,
  HeaderComponent,
  ProductsComponent,
  SettingsComponent,
} from './components';
import { FlowComponent, ListComponent, MatrixComponent } from './routes';
import { LabErrorHandler } from './services';
import { SharedModule } from './shared/shared.module';
import { metaReducers, reducers } from './store';
import { AnalyticsEffects } from './store/analytics.effects';
import { DatasetsEffects } from './store/datasets/datasets.effects';
import { FactoriesEffects } from './store/factories/factories.effects';
import { ProductsEffects } from './store/products/products.effects';

function initializeApp(primengConfig: PrimeNGConfig): () => Promise<any> {
  return () => {
    // Enable ripple
    primengConfig.ripple = true;

    // Load glpk-wasm
    return loadModule('assets/glpk-wasm/glpk.all.wasm');
  };
}

@NgModule({
  declarations: [
    AppComponent,
    ContentComponent,
    HeaderComponent,
    SettingsComponent,
    ColumnsDialogComponent,
    ProductsComponent,
    ListComponent,
    FlowComponent,
    MatrixComponent,
  ],
  imports: [
    /** Angular modules */
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
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
    SharedModule,
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: environment.baseHref },
    { provide: ErrorHandler, useClass: LabErrorHandler },
    {
      provide: APP_INITIALIZER,
      deps: [PrimeNGConfig],
      useFactory: initializeApp,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
