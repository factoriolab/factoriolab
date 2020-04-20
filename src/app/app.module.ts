import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { ProductsComponent } from './components/products-container/products/products.component';
import { environment } from '../environments/environment';
import { reducers, metaReducers } from './store';
import { IconComponent } from './components/icon/icon.component';
import { PickerComponent } from './components/picker/picker.component';
import { ProductsContainerComponent } from './components/products-container/products-container.component';
import { EffectsModule } from '@ngrx/effects';
import { ProductsEffects } from './store/products';
import { StepsContainerComponent } from './components/steps-container/steps-container.component';
import { StepsComponent } from './components/steps-container/steps/steps.component';
import { SettingsComponent } from './components/settings-container/settings/settings.component';
import { SettingsContainerComponent } from './components/settings-container/settings-container.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ProductsComponent,
    IconComponent,
    PickerComponent,
    ProductsContainerComponent,
    StepsContainerComponent,
    StepsComponent,
    SettingsComponent,
    SettingsContainerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreDevtoolsModule.instrument({
      logOnly: environment.production
    }),
    EffectsModule.forRoot([ProductsEffects])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
