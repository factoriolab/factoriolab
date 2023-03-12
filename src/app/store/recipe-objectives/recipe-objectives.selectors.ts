import { createSelector } from '@ngrx/store';

import { RecipeObjectiveRational, RecipeSettingsRational } from '~/models';
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
  Machines.getMachinesState,
  Settings.getDataset,
  (recipeObjectives, machineSettings, data) =>
    recipeObjectives.map((p) =>
      RecipeUtility.adjustRecipeObjective(p, machineSettings, data)
    )
);

export const getRecipeObjectiveRationals = createSelector(
  getRecipeObjectives,
  Settings.getAdjustmentData,
  Items.getItemsState,
  (recipeObjectives, adj, itemsState) =>
    recipeObjectives.map(
      (p) =>
        new RecipeObjectiveRational(
          p,
          RecipeUtility.adjustRecipe(
            p.recipeId,
            adj.fuelId,
            adj.proliferatorSprayId,
            adj.miningBonus,
            adj.researchSpeed,
            adj.netProductionOnly,
            new RecipeSettingsRational(p),
            itemsState,
            adj.data
          )
        )
    )
);
