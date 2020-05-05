import Fraction from 'fraction.js';

import { ItemId } from './item';
import { RecipeSettings } from './recipe-settings';

export interface Step {
  itemId: ItemId;
  items: Fraction;
  settings: RecipeSettings;
  surplus?: Fraction;
  belts?: Fraction;
  factories?: Fraction;
}
