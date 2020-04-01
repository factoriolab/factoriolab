import Fraction from 'fraction.js';
import { RecipeSettings } from './recipe-settings';

export interface Step {
  itemId: string;
  items: Fraction;
  lanes?: Fraction;
  factories?: Fraction;
  settings?: RecipeSettings;
}
