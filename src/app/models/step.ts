import Fraction from 'fraction.js';

import { Entities } from './entities';
import { ItemId } from './item';
import { RecipeId } from './recipe';
import { RecipeSettings } from './recipe-settings';

export interface Step {
  itemId: ItemId;
  recipeId: RecipeId;
  items: Fraction;
  settings: RecipeSettings;
  surplus?: Fraction;
  belts?: Fraction;
  factories?: Fraction;
  parents?: Entities<Fraction>;
  inputs?: Entities<Fraction>;
}
