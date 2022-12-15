import { IconClassPipe, IconSmClassPipe } from './icon-class.pipe';
import { ItemTooltipPipe } from './item-tooltip.pipe';
import { RateTypeViaDropdownPipe } from './rate-type-via-dropdown.pipe';
import { RecipeTooltipPipe } from './recipe-tooltip.pipe';

export const pipes = [
  ItemTooltipPipe,
  RecipeTooltipPipe,
  IconClassPipe,
  IconSmClassPipe,
  RateTypeViaDropdownPipe,
];
