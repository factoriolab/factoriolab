import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
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
  SettingsComponent,
  SettingsContainerComponent,
  IconComponent,
  PickerComponent,
  SelectComponent,
  ToggleComponent,
  RankerComponent,
  OptionsComponent,
  DialogComponent,
  ColumnsComponent,
  MatrixContainerComponent,
  MatrixComponent,
  InputComponent,
  InfoComponent,
} from './components';
import {
  PowerPipe,
  RatePipe,
  FactoryRatePipe,
  StepHrefPipe,
  DisplayRateLabelPipe,
  InserterSpeedPipe,
  LeftPadPipe,
  GtZeroPipe,
} from './pipes';
import { FlowComponent, ListComponent } from './routes';
import {
  FocusOnShowDirective,
  LabErrorHandler,
  ValidateNumberDirective,
  ValidateOverclockDirective,
} from './support';
import { reducers, metaReducers } from './store';
import { DatasetsEffects } from './store/datasets/datasets.effects';
import { ProductsEffects } from './store/products/products.effects';
import { FactoriesEffects } from './store/factories/factories.effects';

@NgModule({
  declarations: [
    AppComponent,
    IconComponent,
    PickerComponent,
    RankerComponent,
    SelectComponent,
    ToggleComponent,
    ListComponent,
    FlowComponent,
    ProductsComponent,
    SettingsComponent,
    SettingsContainerComponent,
    OptionsComponent,
    DialogComponent,
    ColumnsComponent,
    ValidateNumberDirective,
    ValidateOverclockDirective,
    FocusOnShowDirective,
    MatrixContainerComponent,
    MatrixComponent,
    InputComponent,
    InfoComponent,
    PowerPipe,
    RatePipe,
    FactoryRatePipe,
    StepHrefPipe,
    DisplayRateLabelPipe,
    InserterSpeedPipe,
    LeftPadPipe,
    GtZeroPipe,
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
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: environment.baseHref },
    { provide: ErrorHandler, useClass: LabErrorHandler },
    PowerPipe,
    RatePipe,
    FactoryRatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
