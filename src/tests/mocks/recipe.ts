import { rational } from '~/rational/rational';
import { RecipeState } from '~/state/recipes/recipe-state';

import { ItemId } from '../item-id';

export const mockRecipeSettings: RecipeState = {
  machineId: ItemId.AssemblingMachine2,
  modules: [{ count: rational(2n), id: '' }],
  beacons: [
    {
      count: rational.zero,
      id: ItemId.Beacon,
      modules: [{ count: rational(2n), id: ItemId.SpeedModule }],
    },
  ],
};
