import { createSelector } from '@ngrx/store';
import Fraction from 'fraction.js';

import { RecipeSettings, Entities } from '~/models';
import { RecipeUtility } from '~/utilities/recipe';
import { State } from '../';
import { getRecipes, getItemEntities } from '../dataset';
import { getSettingsState } from '../settings';

const recipeState = (state: State) => state.recipeState;

export const getRecipeSettings = createSelector(
  recipeState,
  getRecipes,
  getItemEntities,
  getSettingsState,
  (sState, sRecipes, sItemEntities, sSettings) => {
    const value: Entities<RecipeSettings> = {};
    for (const recipe of sRecipes) {
      const settings: RecipeSettings = sState[recipe.id]
        ? { ...sState[recipe.id] }
        : { ignore: false };

      // Lane (Belt/Pipe)
      if (!settings.lane) {
        let item = sItemEntities[recipe.id];
        if (!item) {
          item = sItemEntities[Object.keys(recipe.out)[0]];
        }
        settings.lane = item.stack ? sSettings.belt : 'pipe';
      }

      // Factory
      if (!settings.factory) {
        settings.factory = RecipeUtility.defaultFactory(
          recipe,
          sSettings.assembler,
          sSettings.furnace,
          sSettings.drill
        );
      }

      const factoryItem = sItemEntities[settings.factory];
      if (recipe.id !== 'space-science-pack' && factoryItem?.factory?.modules) {
        // Modules
        if (!settings.modules) {
          settings.modules = RecipeUtility.defaultModules(
            recipe,
            sSettings.prodModule,
            sSettings.otherModule,
            factoryItem.factory.modules,
            sItemEntities
          );
        }

        // Beacons
        if (!settings.beaconType) {
          settings.beaconType = sSettings.beaconType;
        }
        if (settings.beaconCount == null) {
          settings.beaconCount = sSettings.beaconCount;
        }
      }

      value[recipe.id] = settings;
    }
    return value;
  }
);

export const getRecipeFactors = createSelector(
  getRecipeSettings,
  getItemEntities,
  (sRecipeSettings, sItemEntities) => {
    const values: Entities<[Fraction, Fraction]> = {};
    for (const recipeId of Object.keys(sRecipeSettings)) {
      const settings = sRecipeSettings[recipeId];
      values[recipeId] = RecipeUtility.recipeFactors(
        sItemEntities[settings.factory].factory.speed,
        settings.modules,
        settings.beaconType,
        settings.beaconCount,
        sItemEntities
      );
    }
    return values;
  }
);
