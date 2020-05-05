import { ItemId } from './item';
import { RecipeId } from './recipe';

export interface RecipeSettings {
  ignore?: boolean;
  belt?: ItemId;
  factory?: ItemId;
  modules?: ItemId[];
  beaconType?: ItemId;
  beaconCount?: number;
  recipeId?: RecipeId;
}
