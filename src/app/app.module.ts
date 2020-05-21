import { BrowserModule } from '@angular/platform-browser';
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
  PickerComponent,
  SharedModule,
} from './components';
import { reducers, metaReducers } from './store';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PickerComponent,
    ProductsContainerComponent,
    ProductsComponent,
    SettingsComponent,
    SettingsContainerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreDevtoolsModule.instrument({
      logOnly: environment.production,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
