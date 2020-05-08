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
import { getDataset } from '../dataset';
import * as Settings from '../settings';
import { State } from '../';
import Fraction from 'fraction.js';

/* Base selector functions */
export const recipeState = (state: State) => state.recipeState;

/* Complex selectors */
export const getRecipeSettings = createSelector(
  recipeState,
  getDataset,
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
          recipeSettings.belt = item.stack ? settings.belt : ItemId.Pipe;
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
          // Modules
          if (!recipeSettings.modules) {
            recipeSettings.modules = RecipeUtility.defaultModules(
              recipe,
              settings.prodModule,
              settings.speedModule,
              factoryItem.factory.modules,
              data.itemEntities
            );
          }

          // Beacons
          if (!recipeSettings.beaconModule) {
            recipeSettings.beaconModule = settings.beaconModule;
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
  Settings.getResearchFactor,
  getDataset,
  (recipeSettings, researchFactor, data) => {
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
        settings.modules,
        settings.beaconModule,
        settings.beaconCount,
        data.itemEntities
      );
    }
    return values;
  }
);
