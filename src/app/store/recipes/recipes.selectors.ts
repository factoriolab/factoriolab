import { createSelector } from '@ngrx/store';

import {
  RecipeSettings,
  Entities,
  RationalRecipeSettings,
  RationalRecipe,
  ItemId,
} from '~/models';
import { RecipeUtility } from '~/utilities/recipe.utility';
import * as Factories from '../factories';
import * as Settings from '../settings';
import { State } from '..';
import { RecipesState } from './recipes.reducer';

/* Base selector functions */
export const recipesState = (state: State): RecipesState => state.recipesState;

/* Complex selectors */
export const getRecipeSettings = createSelector(
  recipesState,
  Factories.getFactorySettings,
  Settings.getDataset,
  (state, factories, data) => {
    const value: Entities<RecipeSettings> = {};
    if (data?.recipeIds?.length) {
      for (const recipe of data.recipeIds.map((i) => data.recipeEntities[i])) {
        const s: RecipeSettings = { ...state[recipe.id] };

        if (!s.factory) {
          s.factory = RecipeUtility.bestMatch(recipe.producers, factories.ids);
        }

        const factory = data.itemEntities[s.factory]?.factory;
        if (
          (recipe.producers[0] !== ItemId.RocketSilo ||
            recipe.id === ItemId.RocketPart) &&
          factory?.modules
        ) {
          const def = factories.entities[s.factory];
          if (!s.factoryModules) {
            s.factoryModules = RecipeUtility.defaultModules(
              data.recipeModuleIds[recipe.id],
              def.moduleRank,
              factory.modules
            );
          }

          s.beaconCount =
            s.beaconCount != null ? s.beaconCount : def.beaconCount;
          s.beacon = s.beacon || def.beacon;

          const beacon = data.itemEntities[s.beacon]?.beacon;
          if (beacon && !s.beaconModules) {
            s.beaconModules = new Array(beacon.modules).fill(def.beaconModule);
          }
        }

        value[recipe.id] = s;
      }
    }

    return value;
  }
);

export const getRationalRecipeSettings = createSelector(
  getRecipeSettings,
  (recipeSettings) =>
    Object.keys(recipeSettings).reduce(
      (e: Entities<RationalRecipeSettings>, i) => {
        e[i] = new RationalRecipeSettings(recipeSettings[i]);
        return e;
      },
      {}
    )
);

export const getAdjustedDataset = createSelector(
  getRationalRecipeSettings,
  Settings.getFuel,
  Settings.getRationalMiningBonus,
  Settings.getResearchFactor,
  Settings.getDataset,
  (recipeSettings, fuel, miningBonus, researchSpeed, data) => ({
    ...data,
    ...{
      recipeR: RecipeUtility.adjustSiloRecipes(
        data.recipeIds.reduce((e: Entities<RationalRecipe>, i) => {
          e[i] = RecipeUtility.adjustRecipe(
            i,
            fuel,
            miningBonus,
            researchSpeed,
            recipeSettings[i],
            data
          );
          return e;
        }, {}),
        recipeSettings
      ),
    },
  })
);

export const getContainsFactory = createSelector(recipesState, (state) =>
  Object.keys(state).some((id) => state[id].factory || state[id].factoryModules)
);

export const getContainsBeacons = createSelector(recipesState, (state) =>
  Object.keys(state).some(
    (id) =>
      state[id].beacon ||
      state[id].beaconModules ||
      state[id].beaconCount != null
  )
);
