import { createSelector } from '@ngrx/store';

import { RationalProducer, RationalRecipeSettings } from '~/models';
import { RecipeUtility } from '~/utilities';
import { LabState } from '../';
import * as Factories from '../factories';
import * as Items from '../items';
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
  Factories.getFactories,
  Settings.getDataset,
  (producers, factories, data) =>
    producers.map((p) => RecipeUtility.adjustProducer(p, factories, data))
);

export const getRationalProducers = createSelector(
  getProducers,
  Settings.getAdjustmentData,
  Items.getItemSettings,
  (producers, adj, itemSettings) =>
    producers.map(
      (p) =>
        new RationalProducer(
          p,
          RecipeUtility.adjustRecipe(
            p.recipeId,
            adj.fuelId,
            adj.proliferatorSprayId,
            adj.miningBonus,
            adj.researchSpeed,
            adj.netProductionOnly,
            new RationalRecipeSettings(p),
            itemSettings,
            adj.data
          )
        )
    )
);
