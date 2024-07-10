import { createSelector } from '@ngrx/store';

import { coalesce } from '~/helpers';
import { Entities, rational, RecipeSettings } from '~/models';
import { RecipeUtility } from '~/utilities';
import { LabState } from '../';
import * as Items from '../items';
import * as Machines from '../machines';
import * as Settings from '../settings';
import { RecipesState } from './recipes.reducer';

/* Base selector functions */
export const recipesState = (state: LabState): RecipesState =>
  state.recipesState;

/* Complex selectors */
export const getRecipesState = createSelector(
  recipesState,
  Machines.getMachinesState,
  Settings.getDataset,
  (state, machinesState, data) => {
    const value: Entities<RecipeSettings> = {};
    const defaultExcludedRecipeIds = new Set(
      coalesce(data.defaults?.excludedRecipeIds, []),
    );

    for (const recipe of data.recipeIds.map((i) => data.recipeEntities[i])) {
      const s: RecipeSettings = { ...state[recipe.id] };

      if (s.excluded == null)
        s.excluded = defaultExcludedRecipeIds.has(recipe.id);

      if (s.machineId == null)
        s.machineId = RecipeUtility.bestMatch(
          recipe.producers,
          machinesState.ids ?? [],
        );

      const machine = data.machineEntities[s.machineId];
      const def = machinesState.entities[s.machineId];

      if (recipe.isBurn) {
        s.fuelId = Object.keys(recipe.in)[0];
      } else {
        s.fuelId = s.fuelId ?? def?.fuelId;
      }

      if (machine != null && RecipeUtility.allowsModules(recipe, machine)) {
        s.moduleOptions = RecipeUtility.moduleOptions(machine, data, recipe.id);
        s.modules = coalesce(
          s.modules,
          RecipeUtility.inheritedModules(
            s.moduleOptions,
            def.modules,
            machinesState.moduleRankIds,
            machine.modules,
          ),
        );

        s.beacons = s.beacons ?? def.beacons ?? [];
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

export const getExcludedRecipeIds = createSelector(
  getRecipesState,
  (recipesState) =>
    Object.keys(recipesState).filter((i) => recipesState[i].excluded),
);

export const getAdjustedDataset = createSelector(
  getRecipesState,
  getExcludedRecipeIds,
  Items.getItemsState,
  Settings.getAvailableRecipes,
  Settings.settingsState,
  Settings.getDataset,
  (recipesState, excludedRecipeIds, itemsState, recipeIds, settings, data) =>
    RecipeUtility.adjustDataset(
      recipeIds,
      excludedRecipeIds,
      recipesState,
      itemsState,
      settings,
      data,
    ),
);

export const getAvailableItems = createSelector(getAdjustedDataset, (data) =>
  data.itemIds.filter((i) => data.itemRecipeIds[i].length),
);
