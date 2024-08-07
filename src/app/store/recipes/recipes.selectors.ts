import { createSelector } from '@ngrx/store';

import { coalesce } from '~/helpers';
import { Entities, RecipeSettings } from '~/models';
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
export const selectRecipesState = createSelector(
  recipesState,
  Machines.selectMachinesState,
  Settings.selectDataset,
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
          coalesce(machinesState.ids, []),
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
        s.modules = RecipeUtility.hydrateModules(
          s.modules,
          s.moduleOptions,
          machinesState.moduleRankIds,
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

export const selectExcludedRecipeIds = createSelector(
  selectRecipesState,
  (recipesState) =>
    Object.keys(recipesState).filter((i) => recipesState[i].excluded),
);

export const selectAdjustedDataset = createSelector(
  selectRecipesState,
  selectExcludedRecipeIds,
  Items.selectItemsState,
  Settings.selectAvailableRecipes,
  Settings.settingsState,
  Settings.selectDataset,
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

export const selectAvailableItems = createSelector(
  selectAdjustedDataset,
  (data) => data.itemIds.filter((i) => data.itemRecipeIds[i].length),
);
