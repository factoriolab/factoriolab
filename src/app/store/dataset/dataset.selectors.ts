import { createSelector } from '@ngrx/store';

import {
  Entities,
  Recipe,
  Rational,
  RationalItem,
  RationalRecipe,
  PIPE_ID,
} from '~/models';
import * as Settings from '../settings';
import { State } from '../';
import { RationalDataset } from './dataset.reducer';

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
      for (const recipe of data.recipeIds.map(
        (id) => data.recipeEntities[id]
      )) {
        if (recipe.expensive) {
          recipes.push({ ...recipe, ...recipe.expensive });
        } else {
          recipes.push(recipe);
        }
      }
      newData.recipeEntities = recipes.reduce(
        (e: Entities<Recipe>, r) => ({ ...e, ...{ [r.id]: r } }),
        {}
      );
      return newData;
    } else {
      return data;
    }
  }
);

export const getRationalDataset = createSelector(getDatasetState, (data) => {
  const state: RationalDataset = {
    ...data,
    ...{
      itemR: data.itemIds.reduce(
        (e: Entities<RationalItem>, i) => ({
          ...e,
          ...{ [i]: new RationalItem(data.itemEntities[i]) },
        }),
        {}
      ),
      recipeR: data.recipeIds.reduce(
        (e: Entities<RationalRecipe>, i) => ({
          ...e,
          ...{ [i]: new RationalRecipe(data.recipeEntities[i]) },
        }),
        {}
      ),
    },
  };
  return state;
});

export const getBeltSpeed = createSelector(
  getRationalDataset,
  Settings.getRationalFlowRate,
  (data, flowRate) => {
    const value: Entities<Rational> = { [PIPE_ID]: flowRate };
    if (data.beltIds) {
      for (const id of data.beltIds) {
        value[id] = data.itemR[id].belt.speed;
      }
    }
    return value;
  }
);
