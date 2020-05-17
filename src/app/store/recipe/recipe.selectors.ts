import { createSelector } from '@ngrx/store';

import {
  RecipeSettings,
  Entities,
  ItemId,
  RecipeId,
  Factors,
  CategoryId,
} from '~/models';
import { RecipeUtility } from '~/utilities/recipe';
import { datasetState } from '../dataset';
import * as Settings from '../settings';
import { State } from '../';
import Fraction from 'fraction.js';

/* Base selector functions */
export const recipeState = (state: State) => state.recipeState;

/* Complex selectors */
export const getRecipeSettings = createSelector(
  recipeState,
  datasetState,
  Settings.settingsState,
  (state, data, settings) => {
    const value: Entities<RecipeSettings> = {};
    if (data?.recipes?.length) {
      for (const recipe of data.recipes) {
        const recipeSettings: RecipeSettings = state[recipe.id]
          ? { ...state[recipe.id] }
          : { ignore: false };

        // Belt (or Pipe)
        if (!recipeSettings.belt) {
          let item = data.itemEntities[recipe.id];
          if (!item) {
            item = data.itemEntities[Object.keys(recipe.out)[0]];
          }
          recipeSettings.belt =
            item.stack || item.category === CategoryId.Research
              ? settings.belt
              : ItemId.Pipe;
        }

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
                data.itemEntities
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

export const getRecipeFactors = createSelector(
  getRecipeSettings,
  Settings.getMiningBonus,
  Settings.getResearchFactor,
  datasetState,
  (recipeSettings, miningBonus, researchFactor, data) => {
    const values: Entities<Factors> = {};
    for (const recipeId of Object.keys(recipeSettings)) {
      const settings = recipeSettings[recipeId];
      let factorySpeed = new Fraction(
        data.itemEntities[settings.factory].factory.speed
      );
      if (data.itemEntities[recipeId]?.category === CategoryId.Research) {
        factorySpeed = factorySpeed.mul(researchFactor);
      }
      values[recipeId] = RecipeUtility.recipeFactors(
        factorySpeed,
        settings.factory === ItemId.ElectricMiningDrill
          ? new Fraction(miningBonus).div(100)
          : new Fraction(0),
        settings.modules,
        settings.beaconModule,
        settings.beaconCount,
        data.itemEntities
      );
    }
    return values;
  }
);

export const getContainsIgnore = createSelector(recipeState, (state) =>
  Object.keys(state).some((id) => state[id].ignore != null)
);
export const getContainsBelt = createSelector(recipeState, (state) =>
  Object.keys(state).some((id) => state[id].belt)
);
export const getContainsFactory = createSelector(recipeState, (state) =>
  Object.keys(state).some((id) => state[id].factory)
);
export const getContainsModules = createSelector(recipeState, (state) =>
  Object.keys(state).some((id) => state[id].modules)
);
export const getContainsBeacons = createSelector(recipeState, (state) =>
  Object.keys(state).some(
    (id) => state[id].beaconModule || state[id].beaconCount != null
  )
);
