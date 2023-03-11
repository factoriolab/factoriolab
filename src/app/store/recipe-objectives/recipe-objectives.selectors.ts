import { createSelector } from '@ngrx/store';

import { RecipeRtlCfg, RecipeRtlObj } from '~/models';
import { RecipeUtility } from '~/utilities';
import { LabState } from '../';
import * as Items from '../items';
import * as Machines from '../machines';
import * as Settings from '../settings';
import { RecipeObjectivesState } from './recipe-objectives.reducer';

/* Base selector functions */
export const recipeObjectivesState = (state: LabState): RecipeObjectivesState =>
  state.recipeObjectivesState;

export const getIds = createSelector(
  recipeObjectivesState,
  (state) => state.ids
);
export const getEntities = createSelector(
  recipeObjectivesState,
  (state) => state.entities
);

/** Complex selectors */
export const getBaseRecipeObjectives = createSelector(
  getIds,
  getEntities,
  Settings.getDataset,
  (ids, entities, data) =>
    ids.map((i) => entities[i]).filter((p) => data.recipeEntities[p.recipeId])
);

export const getRecipeObjectives = createSelector(
  getBaseRecipeObjectives,
  Machines.getMachines,
  Settings.getDataset,
  (recipeObjectives, machines, data) =>
    recipeObjectives.map((p) =>
      RecipeUtility.adjustRecipeObjective(p, machines, data)
    )
);

export const getRationalRecipeObjectives = createSelector(
  getRecipeObjectives,
  Settings.getAdjustmentData,
  Items.getItemSettings,
  (recipeObjectives, adj, itemSettings) =>
    recipeObjectives.map(
      (p) =>
        new RecipeRtlObj(
          p,
          RecipeUtility.adjustRecipe(
            p.recipeId,
            adj.fuelId,
            adj.proliferatorSprayId,
            adj.miningBonus,
            adj.researchSpeed,
            adj.netProductionOnly,
            new RecipeRtlCfg(p),
            itemSettings,
            adj.data
          )
        )
    )
);
