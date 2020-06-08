import { createSelector } from '@ngrx/store';

import {
  RecipeSettings,
  Entities,
  ItemId,
  RecipeId,
  RationalRecipeSettings,
  RationalRecipe,
} from '~/models';
import { RecipeUtility } from '~/utilities/recipe';
import * as Dataset from '../dataset';
import * as Settings from '../settings';
import { State } from '..';

/* Base selector functions */
export const recipesState = (state: State) => state.recipeState;

/* Complex selectors */
export const getRecipeSettings = createSelector(
  recipesState,
  Dataset.getDatasetState,
  Settings.settingsState,
  (state, data, settings) => {
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
            settings.assembler,
            settings.furnace
          );
        }

        const factoryItem = data.itemEntities[recipeSettings.factory];
        if (
          recipe.id !== RecipeId.SpaceSciencePack &&
          factoryItem?.factory?.modules
        ) {
          const drillSkipDefaults =
            !settings.drillModule &&
            factoryItem.id === ItemId.ElectricMiningDrill;

          // Modules
          if (!recipeSettings.modules) {
            if (drillSkipDefaults) {
              recipeSettings.modules = [];
              const count = factoryItem.factory.modules;
              for (let i = 0; i < count; i++) {
                recipeSettings.modules.push(ItemId.Module);
              }
            } else {
              recipeSettings.modules = RecipeUtility.defaultModules(
                recipe,
                settings.prodModule,
                settings.speedModule,
                factoryItem.factory.modules,
                data
              );
            }
          }

          // Beacons
          if (!recipeSettings.beaconModule) {
            if (drillSkipDefaults) {
              recipeSettings.beaconModule = ItemId.Module;
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
  Dataset.getRationalDataset,
  (recipeSettings, miningBonus, researchFactor, data) => ({
    ...data,
    ...{
      recipeR: Object.keys(recipeSettings).reduce(
        (e: Entities<RationalRecipe>, i) => ({
          ...e,
          ...{
            [i]: RecipeUtility.adjustRecipe(
              i as RecipeId,
              miningBonus,
              researchFactor,
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
