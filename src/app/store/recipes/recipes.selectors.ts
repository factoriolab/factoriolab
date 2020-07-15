import { createSelector } from '@ngrx/store';

import {
  RecipeSettings,
  Entities,
  RationalRecipeSettings,
  RationalRecipe,
} from '~/models';
import { RecipeUtility } from '~/utilities/recipe.utility';
import * as Settings from '../settings';
import { State } from '..';

/* Base selector functions */
export const recipesState = (state: State) => state.recipeState;

/* Complex selectors */
export const getRecipeSettings = createSelector(
  recipesState,
  Settings.settingsState,
  Settings.getDataset,
  (state, settings, data) => {
    const value: Entities<RecipeSettings> = {};
    if (data?.recipeIds?.length) {
      for (const recipe of data.recipeIds.map((i) => data.recipeEntities[i])) {
        const recipeSettings: RecipeSettings = state[recipe.id]
          ? { ...state[recipe.id] }
          : {};

        // Factory
        if (!recipeSettings.factory) {
          recipeSettings.factory = RecipeUtility.defaultFactory(
            recipe,
            settings.factoryRank
          );
        }

        const factoryItem = data.itemEntities[recipeSettings.factory];
        if (
          recipe.id !== 'space-science-pack' &&
          factoryItem?.factory?.modules
        ) {
          const drillSkipDefaults =
            !settings.drillModule && factoryItem.factory.mining;

          // Modules
          if (!recipeSettings.modules) {
            if (drillSkipDefaults) {
              recipeSettings.modules = [];
              const count = factoryItem.factory.modules;
              for (let i = 0; i < count; i++) {
                recipeSettings.modules.push('module');
              }
            } else {
              recipeSettings.modules = RecipeUtility.defaultModules(
                recipe,
                settings.moduleRank,
                factoryItem.factory.modules,
                data
              );
            }
          }

          // Beacons
          if (!recipeSettings.beaconModule) {
            if (drillSkipDefaults) {
              recipeSettings.beaconModule = 'module';
            } else {
              recipeSettings.beaconModule = settings.beaconModule;
            }
          }
          if (recipeSettings.beaconCount == null) {
            recipeSettings.beaconCount = settings.beaconCount;
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
      (e: Entities<RationalRecipeSettings>, i) => ({
        ...e,
        ...{ [i]: new RationalRecipeSettings(recipeSettings[i]) },
      }),
      {}
    )
);

export const getAdjustedDataset = createSelector(
  getRationalRecipeSettings,
  Settings.getRationalMiningBonus,
  Settings.getResearchFactor,
  Settings.getFuel,
  Settings.getDataset,
  (recipeSettings, miningBonus, researchSpeed, fuel, data) => ({
    ...data,
    ...{
      recipeR: Object.keys(recipeSettings).reduce(
        (e: Entities<RationalRecipe>, i) => ({
          ...e,
          ...{
            [i]: RecipeUtility.adjustRecipe(
              i,
              miningBonus,
              researchSpeed,
              fuel,
              recipeSettings[i],
              data
            ),
          },
        }),
        {}
      ),
    },
  })
);

export const getContainsFactory = createSelector(recipesState, (state) =>
  Object.keys(state).some((id) => state[id].factory)
);

export const getContainsModules = createSelector(recipesState, (state) =>
  Object.keys(state).some((id) => state[id].modules)
);

export const getContainsBeacons = createSelector(recipesState, (state) =>
  Object.keys(state).some(
    (id) => state[id].beaconModule || state[id].beaconCount != null
  )
);
