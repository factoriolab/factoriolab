import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ColumnsComponent,
  DialogComponent,
  IconComponent,
  InfoComponent,
  InputComponent,
  OptionsComponent,
  PickerComponent,
  RankerComponent,
  SelectComponent,
  ToggleComponent,
} from './components';
import {
  FocusOnShowDirective,
  ValidateNumberDirective,
  ValidateOverclockDirective,
} from './directives';
import {
  DisplayRateLabelPipe,
  FactoryRatePipe,
  GtZeroPipe,
  InserterSpeedPipe,
  LeftPadPipe,
  PowerPipe,
  RatePipe,
  StepHrefPipe,
} from './pipes';

export const SHARED_COMPONENTS = [
  ColumnsComponent,
  DialogComponent,
  IconComponent,
  InfoComponent,
  InputComponent,
  OptionsComponent,
  PickerComponent,
  RankerComponent,
  SelectComponent,
  ToggleComponent,
];

export const SHARED_DIRECTIVES = [
  FocusOnShowDirective,
  ValidateNumberDirective,
  ValidateOverclockDirective,
];

export const SHARED_PIPES = [
  DisplayRateLabelPipe,
  FactoryRatePipe,
  GtZeroPipe,
  InserterSpeedPipe,
  LeftPadPipe,
  PowerPipe,
  RatePipe,
  StepHrefPipe,
];

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [SHARED_COMPONENTS, SHARED_DIRECTIVES, SHARED_PIPES],
  exports: [SHARED_COMPONENTS, SHARED_DIRECTIVES, SHARED_PIPES],
  providers: [PowerPipe, RatePipe, FactoryRatePipe],
})
export class SharedModule {}
