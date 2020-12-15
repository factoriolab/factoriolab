import { createSelector } from '@ngrx/store';

import {
  RecipeSettings,
  Entities,
  RationalRecipeSettings,
  RationalRecipe,
  ItemId,
} from '~/models';
import { RecipeUtility } from '~/utilities/recipe.utility';
import * as Settings from '../settings';
import { State } from '..';

/* Base selector functions */
export const recipesState = (state: State) => state.recipesState;

/* Complex selectors */
export const getRecipeSettings = createSelector(
  recipesState,
  Settings.getFactoryRank,
  Settings.getModuleRank,
  Settings.getBeaconCount,
  Settings.getBeacon,
  Settings.getBeaconModule,
  Settings.getDataset,
  (state, factoryRank, moduleRank, beaconCount, beacon, beaconModule, data) => {
    const value: Entities<RecipeSettings> = {};
    if (data?.recipeIds?.length) {
      for (const recipe of data.recipeIds.map((i) => data.recipeEntities[i])) {
        const recipeSettings: RecipeSettings = state[recipe.id]
          ? { ...state[recipe.id] }
          : {};

        // Factory
        if (!recipeSettings.factory) {
          recipeSettings.factory = RecipeUtility.bestMatch(
            recipe.producers,
            factoryRank
          );
        }

        const factoryItem = data.itemEntities[recipeSettings.factory];
        if (
          (recipe.producers[0] !== ItemId.RocketSilo ||
            recipe.id === ItemId.RocketPart) &&
          factoryItem?.factory?.modules
        ) {
          const drillSkipDefaults = factoryItem.factory.mining;

          // Modules
          if (!recipeSettings.factoryModules) {
            const count = factoryItem.factory.modules;
            if (drillSkipDefaults) {
              recipeSettings.factoryModules = new Array(count).fill(
                ItemId.Module
              );
            } else {
              recipeSettings.factoryModules = RecipeUtility.defaultModules(
                data.recipeModuleIds[recipe.id],
                moduleRank,
                count
              );
            }
          }

          // Beacons
          if (recipeSettings.beaconCount == null) {
            recipeSettings.beaconCount = drillSkipDefaults ? 0 : beaconCount;
          }
          if (!recipeSettings.beacon) {
            recipeSettings.beacon = beacon;
          }
          const beaconItem = data.itemEntities[recipeSettings.beacon];
          if (beaconItem?.beacon && !recipeSettings.beaconModules) {
            const count = beaconItem.beacon.modules;
            recipeSettings.beaconModules = new Array(count).fill(beaconModule);
          }
        }

        value[recipe.id] = recipeSettings;
      }
    }
    return value;
  }
);

export const getRationalRecipeSettings = createSelector(
  getRecipeSettings,
  (recipeSettings) =>
    Object.keys(recipeSettings).reduce(
      (e: Entities<RationalRecipeSettings>, i) => {
        e[i] = new RationalRecipeSettings(recipeSettings[i]);
        return e;
      },
      {}
    )
);

export const getAdjustedDataset = createSelector(
  getRationalRecipeSettings,
  Settings.getFuel,
  Settings.getRationalMiningBonus,
  Settings.getResearchFactor,
  Settings.getDataset,
  (recipeSettings, fuel, miningBonus, researchSpeed, data) => ({
    ...data,
    ...{
      recipeR: Object.keys(recipeSettings).reduce(
        (e: Entities<RationalRecipe>, i) => {
          e[i] = RecipeUtility.adjustRecipe(
            i,
            fuel,
            miningBonus,
            researchSpeed,
            recipeSettings[i],
            data
          );
          return e;
        },
        {}
      ),
    },
  })
);

export const getContainsFactory = createSelector(recipesState, (state) =>
  Object.keys(state).some((id) => state[id].factory || state[id].factoryModules)
);

export const getContainsBeacons = createSelector(recipesState, (state) =>
  Object.keys(state).some(
    (id) =>
      state[id].beacon ||
      state[id].beaconModules ||
      state[id].beaconCount != null
  )
);
