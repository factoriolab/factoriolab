import { AsStepPipe } from './as-step.pipe';
import { FactoryRatePipe } from './factory-rate.pipe';
import { FactoryShowRatePipe } from './factory-show-rate.pipe';
import { FactoryShowPipe } from './factory-show.pipe';
import { IconClassPipe, IconSmClassPipe } from './icon-class.pipe';
import { InserterSpeedPipe } from './inserter-speed.pipe';
import { LeftPadPipe } from './left-pad.pipe';
import { OptionsPipe } from './options.pipe';
import { PowerPipe } from './power.pipe';
import { PrecisionExamplePipe } from './precision-example.pipe';
import { RateTypeViaDropdownPipe } from './rate-type-via-dropdown.pipe';
import { RatePipe } from './rate.pipe';
import { StepHrefPipe } from './step-href.pipe';
import {
  BeaconTooltipPipe,
  FactoryTooltipPipe,
  ItemTooltipPipe,
  ModuleTooltipPipe,
  RecipeTooltipPipe,
} from './tooltips';

export const pipes = [
  AsStepPipe,
  BeaconTooltipPipe,
  FactoryTooltipPipe,
  ItemTooltipPipe,
  ModuleTooltipPipe,
  RecipeTooltipPipe,
  FactoryRatePipe,
  FactoryShowRatePipe,
  FactoryShowPipe,
  IconClassPipe,
  IconSmClassPipe,
  InserterSpeedPipe,
  LeftPadPipe,
  OptionsPipe,
  PowerPipe,
  PrecisionExamplePipe,
  RatePipe,
  RateTypeViaDropdownPipe,
  StepHrefPipe,
];
