import { AsStepPipe } from './as-step.pipe';
import { IconClassPipe, IconSmClassPipe } from './icon-class.pipe';
import { InserterSpeedPipe } from './inserter-speed.pipe';
import { LeftPadPipe } from './left-pad.pipe';
import { MachineRatePipe } from './machine-rate.pipe';
import { MachineShowRatePipe } from './machine-show-rate.pipe';
import { MachineShowPipe } from './machine-show.pipe';
import { OptionsPipe } from './options.pipe';
import { PowerPipe } from './power.pipe';
import { PrecisionExamplePipe } from './precision-example.pipe';
import { RatePipe } from './rate.pipe';
import { StepHrefPipe } from './step-href.pipe';
import { StepIdPipe } from './step-id.pipe';
import {
  BeaconTooltipPipe,
  ItemTooltipPipe,
  MachineTooltipPipe,
  ModuleTooltipPipe,
  RecipeTooltipPipe,
} from './tooltips';

export const pipes = [
  AsStepPipe,
  BeaconTooltipPipe,
  MachineTooltipPipe,
  ItemTooltipPipe,
  ModuleTooltipPipe,
  RecipeTooltipPipe,
  IconClassPipe,
  IconSmClassPipe,
  InserterSpeedPipe,
  LeftPadPipe,
  OptionsPipe,
  MachineRatePipe,
  MachineShowPipe,
  MachineShowRatePipe,
  PowerPipe,
  PrecisionExamplePipe,
  RatePipe,
  StepHrefPipe,
  StepIdPipe,
];
