import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  ProductsComponent,
  ProductsContainerComponent,
  SettingsComponent,
  SettingsContainerComponent,
  HeaderComponent,
  IconComponent,
  PickerComponent,
  SelectComponent,
  ListContainerComponent,
  ListComponent,
  DiagramContainerComponent,
  ToggleComponent,
  RankerComponent,
  MultiselectComponent,
  PrecisionComponent,
  SankeyComponent,
} from './components';
import { reducers, metaReducers } from './store';
import { DatasetsEffects } from './store/datasets/datasets.effects';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    IconComponent,
    MultiselectComponent,
    PickerComponent,
    RankerComponent,
    SelectComponent,
    ToggleComponent,
    ListContainerComponent,
    ListComponent,
    DiagramContainerComponent,
    ProductsContainerComponent,
    ProductsComponent,
    SettingsComponent,
    SettingsContainerComponent,
    PrecisionComponent,
    SankeyComponent,
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
    EffectsModule.forRoot([DatasetsEffects]),
  ],
  providers: [{ provide: APP_BASE_HREF, useValue: environment.baseHref }],
  bootstrap: [AppComponent],
})
export class AppModule {}
