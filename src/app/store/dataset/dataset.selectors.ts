import { createSelector } from '@ngrx/store';
import Fraction from 'fraction.js';

import { Entities, ItemId, RecipeId } from '~/models';
import * as Settings from '../settings';
import { State } from '../';

/* Base selector functions */
export const getDataset = (state: State) => state.datasetState;

/* Complex selectors */
export const getLaneSpeed = createSelector(
  getDataset,
  Settings.getFlowRate,
  (data, flowRate) => {
    const value: Entities<Fraction> = {};
    for (const id of data.laneIds) {
      if (id === ItemId.Pipe) {
        value[id] = new Fraction(flowRate);
      } else {
        value[id] = new Fraction(data.itemEntities[id].belt.speed);
      }
    }
    return value;
  }
);

export const getOilRecipes = createSelector(
  getDataset,
  Settings.getOilRecipe,
  (data, oilRecipeId) => {
    return {
      heavy: data.recipeEntities[oilRecipeId],
      light: data.recipeEntities[RecipeId.HeavyOilCracking],
      petrol: data.recipeEntities[RecipeId.LightOilCracking],
      fuelLight: data.recipeEntities[RecipeId.SolidFuelFromLightOil],
      fuelPetrol: data.recipeEntities[RecipeId.SolidFuelFromPetroleumGas],
    };
  }
);
