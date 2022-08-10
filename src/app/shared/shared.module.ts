import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { VendorModule } from '~/shared/vendor.module';
import {
  DialogComponent,
  IconComponent,
  InfoComponent,
  InputNumberComponent,
  OptionsComponent,
  RankerComponent,
  SelectComponent,
  ToggleComponent,
} from './components';
import {
  DropdownIconDirective,
  DropdownIconTextDirective,
  DropdownTranslateDirective,
  FocusOnShowDirective,
  ValidateNumberDirective,
  ValidateOverclockDirective,
} from './directives';
import {
  DisplayRateLabelPipe,
  FactoryRatePipe,
  FactoryShowPipe,
  FactoryShowRatePipe,
  GtZeroPipe,
  IconClassPipe,
  InserterSpeedPipe,
  LeftPadPipe,
  ListNamesPipe,
  OptionsPipe,
  PowerPipe,
  PrecisionExamplePipe,
  RatePipe,
  StepHrefPipe,
  UrlPipe,
} from './pipes';

export const SHARED_COMPONENTS = [
  DialogComponent,
  IconComponent,
  InfoComponent,
  InputNumberComponent,
  OptionsComponent,
  RankerComponent,
  SelectComponent,
  ToggleComponent,
];

export const SHARED_DIRECTIVES = [
  DropdownIconDirective,
  DropdownIconTextDirective,
  DropdownTranslateDirective,
  FocusOnShowDirective,
  ValidateNumberDirective,
  ValidateOverclockDirective,
];

export const SHARED_PIPES = [
  DisplayRateLabelPipe,
  FactoryRatePipe,
  FactoryShowPipe,
  FactoryShowRatePipe,
  GtZeroPipe,
  IconClassPipe,
  InserterSpeedPipe,
  LeftPadPipe,
  ListNamesPipe,
  OptionsPipe,
  PowerPipe,
  PrecisionExamplePipe,
  RatePipe,
  StepHrefPipe,
  UrlPipe,
];

@NgModule({
  declarations: [SHARED_COMPONENTS, SHARED_DIRECTIVES, SHARED_PIPES],
  exports: [VendorModule, SHARED_COMPONENTS, SHARED_DIRECTIVES, SHARED_PIPES],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    VendorModule,
  ],
  providers: [PowerPipe, RatePipe, FactoryRatePipe],
})
export class SharedModule {}
