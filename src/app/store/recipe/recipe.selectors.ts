import { createSelector } from '@ngrx/store';
import Fraction from 'fraction.js';

import { RecipeSettings, Entities } from '~/models';
import { RecipeUtility } from '~/utilities/recipe';
import { getDataset } from '../dataset';
import * as Settings from '../settings';
import { State } from '../';

/* Base selector functions */
const recipeState = (state: State) => state.recipeState;

/* Complex selectors */
export const getRecipeSettings = createSelector(
  recipeState,
  getDataset,
  // TODO: Break this selector out so we don't select the entire settings state here
  Settings.settingsState,
  (state, data, settings) => {
    const value: Entities<RecipeSettings> = {};
    for (const recipe of data.recipes) {
      const recipeSettings: RecipeSettings = state[recipe.id]
        ? { ...state[recipe.id] }
        : { ignore: false };

      // Lane (Belt/Pipe)
      if (!recipeSettings.lane) {
        let item = data.itemEntities[recipe.id];
        if (!item) {
          item = data.itemEntities[Object.keys(recipe.out)[0]];
        }
        recipeSettings.lane = item.stack ? settings.belt : 'pipe';
      }

      // Factory
      if (!recipeSettings.factory) {
        recipeSettings.factory = RecipeUtility.defaultFactory(
          recipe,
          settings.assembler,
          settings.furnace,
          settings.drill
        );
      }

      const factoryItem = data.itemEntities[recipeSettings.factory];
      if (recipe.id !== 'space-science-pack' && factoryItem?.factory?.modules) {
        // Modules
        if (!recipeSettings.modules) {
          recipeSettings.modules = RecipeUtility.defaultModules(
            recipe,
            settings.prodModule,
            settings.otherModule,
            factoryItem.factory.modules,
            data.itemEntities
          );
        }

        // Beacons
        if (!recipeSettings.beaconType) {
          recipeSettings.beaconType = settings.beaconType;
        }
        if (recipeSettings.beaconCount == null) {
          recipeSettings.beaconCount = settings.beaconCount;
        }
      }

      value[recipe.id] = recipeSettings;
    }
    return value;
  }
);

export const getRecipeFactors = createSelector(
  getRecipeSettings,
  getDataset,
  (recipeSettings, data) => {
    const values: Entities<{ speed: Fraction; prod: Fraction }> = {};
    for (const recipeId of Object.keys(recipeSettings)) {
      const settings = recipeSettings[recipeId];
      values[recipeId] = RecipeUtility.recipeFactors(
        data.itemEntities[settings.factory].factory.speed,
        settings.modules,
        settings.beaconType,
        settings.beaconCount,
        data.itemEntities
      );
    }
    return values;
  }
);
