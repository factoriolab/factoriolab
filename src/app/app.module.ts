import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import {
  HeaderComponent,
  IconComponent,
  PickerComponent,
  SelectComponent,
} from './components';
import {
  ProductsComponent,
  ProductsContainerComponent,
  StepsComponent,
  StepsContainerComponent,
  SettingsComponent,
  SettingsContainerComponent,
} from './containers';
import { reducers, metaReducers } from './store';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    IconComponent,
    PickerComponent,
    SelectComponent,
    ProductsContainerComponent,
    ProductsComponent,
    StepsContainerComponent,
    StepsComponent,
    SettingsComponent,
    SettingsContainerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreDevtoolsModule.instrument({
      logOnly: environment.production,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
