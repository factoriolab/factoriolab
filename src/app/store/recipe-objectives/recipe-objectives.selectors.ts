import { createSelector } from '@ngrx/store';

import { RecipeRtlCfg, RecipeRtlObj } from '~/models';
import { RecipeUtility } from '~/utilities';
import { LabState } from '../';
import * as Items from '../item-configs';
import * as Machines from '../machine-configs';
import * as Settings from '../settings';
import { RecipesObjState } from './recipe-objectives.reducer';

/* Base selector functions */
export const recipesObjState = (state: LabState): RecipesObjState =>
  state.recipesObjState;

export const getIds = createSelector(recipesObjState, (state) => state.ids);
export const getEntities = createSelector(
  recipesObjState,
  (state) => state.entities
);

/** Complex selectors */
export const getBaseRecipesObj = createSelector(
  getIds,
  getEntities,
  Settings.getDataset,
  (ids, entities, data) =>
    ids.map((i) => entities[i]).filter((p) => data.recipeEntities[p.recipeId])
);

export const getRecipesObj = createSelector(
  getBaseRecipesObj,
  Machines.getMachinesCfg,
  Settings.getDataset,
  (recipesObj, machinesCfg, data) =>
    recipesObj.map((p) =>
      RecipeUtility.adjustRecipeObjective(p, machinesCfg, data)
    )
);

export const getRecipesRtlObj = createSelector(
  getRecipesObj,
  Settings.getAdjustmentData,
  Items.getItemsCfg,
  (recipesObj, adj, itemSettings) =>
    recipesObj.map(
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
