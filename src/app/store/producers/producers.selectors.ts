import { createSelector } from '@ngrx/store';

import { RationalProducer } from '~/models';
import { RecipeUtility } from '~/utilities';
import { LabState } from '../';
import * as Factories from '../factories';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import { ProducersState } from './producers.reducer';

/* Base selector functions */
export const producersState = (state: LabState): ProducersState =>
  state.producersState;

export const getIds = createSelector(producersState, (state) => state.ids);
export const getEntities = createSelector(
  producersState,
  (state) => state.entities
);

/** Complex selectors */
export const getBaseProducers = createSelector(
  getIds,
  getEntities,
  Settings.getDataset,
  (ids, entities, data) =>
    ids.map((i) => entities[i]).filter((p) => data.recipeEntities[p.recipeId])
);

export const getProducers = createSelector(
  getBaseProducers,
  Recipes.getRecipeSettings,
  Factories.getFactories,
  Settings.getDataset,
  (producers, recipeSettings, factories, data) =>
    producers.map((p) =>
      RecipeUtility.adjustProducer(
        p,
        recipeSettings[p.recipeId],
        factories,
        data
      )
    )
);

export const getRationalProducers = createSelector(getProducers, (producers) =>
  producers.map((p) => new RationalProducer(p))
);
