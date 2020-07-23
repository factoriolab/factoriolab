import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
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
  HierarchyContainerComponent,
  SunburstComponent,
  ToggleComponent,
  RankerComponent,
  MultiselectComponent,
} from './components';
import { reducers, metaReducers } from './store';

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
    HierarchyContainerComponent,
    SunburstComponent,
    ProductsContainerComponent,
    ProductsComponent,
    SettingsComponent,
    SettingsContainerComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreDevtoolsModule.instrument({
      logOnly: environment.production,
    }),
  ],
  providers: [{ provide: APP_BASE_HREF, useValue: environment.baseHref }],
  bootstrap: [AppComponent],
})
export class AppModule {}
