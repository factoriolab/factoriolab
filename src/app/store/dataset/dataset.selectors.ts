import { createSelector } from '@ngrx/store';
import Fraction from 'fraction.js';

import { Entities, ItemId, Recipe } from '~/models';
import * as Settings from '../settings';
import { State } from '../';

/* Base selector functions */
const datasetState = (state: State) => state.datasetState;

/* Complex selectors */
export const getDatasetState = createSelector(
  datasetState,
  Settings.getExpensive,
  (data, expensive) => {
    if (expensive) {
      const newData = { ...data };
      const recipes: Recipe[] = [];
      for (const recipe of data.recipes) {
        if (recipe.expensive) {
          recipes.push({ ...recipe, ...recipe.expensive });
        } else {
          recipes.push(recipe);
        }
      }
      newData.recipes = recipes;
      newData.recipeEntities = recipes.reduce((e: Entities<Recipe>, r) => {
        return { ...e, ...{ [r.id]: r } };
      }, {});
      return newData;
    } else {
      return data;
    }
  }
);

export const getBeltSpeed = createSelector(
  datasetState,
  Settings.getFlowRate,
  (data, flowRate) => {
    const value: Entities<Fraction> = {};
    if (data.beltIds) {
      for (const id of data.beltIds) {
        if (id === ItemId.Pipe) {
          value[id] = new Fraction(flowRate);
        } else {
          value[id] = new Fraction(data.itemEntities[id].belt.speed);
        }
      }
    }
    return value;
  }
);
