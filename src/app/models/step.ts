import Fraction from 'fraction.js';

import { ItemId } from './item';
import { RecipeSettings } from './recipe-settings';

export interface Step {
  itemId: ItemId;
  items: Fraction;
  surplus?: Fraction;
  lanes?: Fraction;
  factories?: Fraction;
  settings: RecipeSettings;
}
