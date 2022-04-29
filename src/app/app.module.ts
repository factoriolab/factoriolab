import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductsComponent, SettingsComponent } from './components';
import { FlowComponent, ListComponent, MatrixComponent } from './routes';
import { LabErrorHandler } from './services';
import { SharedModule } from './shared/shared.module';
import { metaReducers, reducers } from './store';
import { DatasetsEffects } from './store/datasets/datasets.effects';
import { FactoriesEffects } from './store/factories/factories.effects';
import { ProductsEffects } from './store/products/products.effects';

@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    FlowComponent,
    ProductsComponent,
    SettingsComponent,
    MatrixComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreDevtoolsModule.instrument({
      logOnly: environment.production,
    }),
    EffectsModule.forRoot([DatasetsEffects, ProductsEffects, FactoriesEffects]),
    SharedModule,
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: environment.baseHref },
    { provide: ErrorHandler, useClass: LabErrorHandler },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
