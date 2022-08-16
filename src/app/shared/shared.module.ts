import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { VendorModule } from '~/shared/vendor.module';
import { InputNumberComponent } from './components';
import {
  DropdownIconDirective,
  DropdownIconTextDirective,
  DropdownTranslateDirective,
  ValidateNumberDirective,
  ValidateOverclockDirective,
} from './directives';
import {
  BeaconTooltipPipe,
  DisplayRateLabelPipe,
  FactoryRatePipe,
  FactoryShowPipe,
  FactoryShowRatePipe,
  FactoryTooltipPipe,
  GtZeroPipe,
  IconClassPipe,
  InserterSpeedPipe,
  LeftPadPipe,
  ListNamesPipe,
  ModuleTooltipPipe,
  OptionsPipe,
  PowerPipe,
  PrecisionExamplePipe,
  RatePipe,
  RecipeTooltipPipe,
  StepHrefPipe,
  UrlPipe,
} from './pipes';

export const SHARED_COMPONENTS = [InputNumberComponent];

export const SHARED_DIRECTIVES = [
  DropdownIconDirective,
  DropdownIconTextDirective,
  DropdownTranslateDirective,
  ValidateNumberDirective,
  ValidateOverclockDirective,
];

export const SHARED_PIPES = [
  BeaconTooltipPipe,
  FactoryTooltipPipe,
  ModuleTooltipPipe,
  RecipeTooltipPipe,
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
