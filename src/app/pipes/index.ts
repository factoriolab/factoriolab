import { FactoryRatePipe } from './factory-rate.pipe';
import { FactoryShowRatePipe } from './factory-show-rate.pipe';
import { FactoryShowPipe } from './factory-show.pipe';
import { IconClassPipe, IconSmClassPipe } from './icon-class.pipe';
import { InserterSpeedPipe } from './inserter-speed.pipe';
import { InvertArrayPipe } from './invert-array.pipe';
import { LeftPadPipe } from './left-pad.pipe';
import { OptionsPipe } from './options.pipe';
import { PowerPipe } from './power.pipe';
import { PrecisionExamplePipe } from './precision-example.pipe';
import { RatePipe } from './rate.pipe';
import { StepHrefPipe } from './step-href.pipe';
import {
  BeaconTooltipPipe,
  FactoryTooltipPipe,
  ModuleTooltipPipe,
  RecipeTooltipPipe,
} from './tooltips';
import { UrlPipe } from './url.pipe';

export const pipes = [
  BeaconTooltipPipe,
  FactoryTooltipPipe,
  ModuleTooltipPipe,
  RecipeTooltipPipe,
  FactoryRatePipe,
  FactoryShowRatePipe,
  FactoryShowPipe,
  IconClassPipe,
  IconSmClassPipe,
  InserterSpeedPipe,
  InvertArrayPipe,
  LeftPadPipe,
  OptionsPipe,
  PowerPipe,
  PrecisionExamplePipe,
  RatePipe,
  StepHrefPipe,
  UrlPipe,
];
