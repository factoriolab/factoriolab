import { createSelector } from '@ngrx/store';

import { Entities } from '~/models/entities';
import { RecipeSettings } from '~/models/settings/recipe-settings';
import { RecipeUtility } from '~/utilities/recipe.utility';

import { LabState } from '../';
import { selectItemsState } from '../items/items.selectors';
import { selectMachinesState } from '../machines/machines.selectors';
import {
  selectAvailableRecipes,
  selectDataset,
  selectSettings,
} from '../settings/settings.selectors';
import { RecipesState } from './recipes.reducer';

/* Base selector functions */
export const recipesState = (state: LabState): RecipesState =>
  state.recipesState;

/* Complex selectors */
export const selectRecipesState = createSelector(
  recipesState,
  selectMachinesState,
  selectSettings,
  selectDataset,
  (state, machinesState, settings, data) => {
    const value: Entities<RecipeSettings> = {};

    for (const recipe of data.recipeIds.map((i) => data.recipeEntities[i])) {
      const s: RecipeSettings = { ...state[recipe.id] };

      if (s.machineId == null)
        s.machineId = RecipeUtility.bestMatch(
          recipe.producers,
          settings.machineRankIds,
        );

      const machine = data.machineEntities[s.machineId];
      const def = machinesState[s.machineId];

      if (recipe.isBurn) {
        s.fuelId = Object.keys(recipe.in)[0];
      } else {
        s.fuelId = s.fuelId ?? def?.fuelId;
      }

      s.fuelOptions = def?.fuelOptions;

      if (machine != null && RecipeUtility.allowsModules(recipe, machine)) {
        s.moduleOptions = RecipeUtility.moduleOptions(machine, data, recipe.id);
        s.modules = RecipeUtility.hydrateModules(
          s.modules,
          s.moduleOptions,
          settings.moduleRankIds,
          machine.modules,
          def.modules,
        );
        s.beacons = RecipeUtility.hydrateBeacons(s.beacons, def.beacons);
      } else {
        // Machine doesn't support modules, remove any
        delete s.modules;
        delete s.beacons;
      }

      if (s.beacons) {
        for (const beaconSettings of s.beacons) {
          if (
            beaconSettings.total != null &&
            (beaconSettings.count == null || beaconSettings.count.isZero())
          )
            // No actual beacons, ignore the total beacons
            delete beaconSettings.total;
        }
      }

      s.overclock = s.overclock ?? def?.overclock;

      value[recipe.id] = s;
    }

    return value;
  },
);

export const selectAdjustedDataset = createSelector(
  selectRecipesState,
  selectItemsState,
  selectAvailableRecipes,
  selectSettings,
  selectDataset,
  (recipesState, itemsState, recipeIds, settings, data) =>
    RecipeUtility.adjustDataset(
      recipeIds,
      recipesState,
      itemsState,
      settings,
      data,
    ),
);

export const selectAvailableItems = createSelector(
  selectAdjustedDataset,
  (data) => data.itemIds.filter((i) => data.itemRecipeIds[i].length),
);
