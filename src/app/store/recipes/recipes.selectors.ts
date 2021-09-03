import { createSelector } from '@ngrx/store';

import {
  RecipeSettings,
  Entities,
  RationalRecipeSettings,
  Rational,
} from '~/models';
import { RecipeUtility } from '~/utilities/recipe.utility';
import * as Items from '../items';
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
  Settings.getNormalDataset,
  (state, factories, data) => {
    const value: Entities<RecipeSettings> = {};
    if (data?.recipeIds?.length) {
      for (const recipe of data.recipeIds.map((i) => data.recipeEntities[i])) {
        const s: RecipeSettings = { ...state[recipe.id] };

        if (!s.factory) {
          s.factory = RecipeUtility.bestMatch(recipe.producers, factories.ids);
        }

        const factory = data.itemEntities[s.factory]?.factory;
        const def = factories.entities[s.factory];
        if (RecipeUtility.allowsModules(recipe, factory)) {
          if (!s.factoryModules) {
            s.factoryModules = RecipeUtility.defaultModules(
              data.recipeModuleIds[recipe.id],
              def.moduleRank,
              factory.modules
            );
          }

          if (s.beaconCount == null) {
            s.beaconCount = def.beaconCount;
          }

          s.beacon = s.beacon || def.beacon;

          const beacon = data.itemEntities[s.beacon]?.beacon;
          if (beacon && !s.beaconModules) {
            s.beaconModules = new Array(beacon.modules).fill(def.beaconModule);
          }
        } else {
          // Factory doesn't support modules, remove any
          delete s.factoryModules;
          delete s.beaconCount;
          delete s.beacon;
          delete s.beaconModules;
        }

        if (
          s.beaconTotal &&
          (!s.beaconCount || Rational.fromString(s.beaconCount).isZero())
        ) {
          // No actual beacons, ignore the total beacons
          delete s.beaconTotal;
        }

        s.overclock = s.overclock || def?.overclock;

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

export const getSrc = createSelector(
  Settings.getFuel,
  Settings.getRationalMiningBonus,
  Settings.getResearchFactor,
  Settings.getDataset,
  (fuel, miningBonus, researchSpeed, data) => ({
    fuel,
    miningBonus,
    researchSpeed,
    data,
  })
);

export const getAdjustedDataset = createSelector(
  getRationalRecipeSettings,
  Items.getItemSettings,
  Settings.getDisabledRecipes,
  Settings.getAdjustmentData,
  (recipeSettings, itemSettings, disabledRecipes, adj) =>
    RecipeUtility.adjustDataset(
      recipeSettings,
      itemSettings,
      disabledRecipes,
      adj.fuel,
      adj.miningBonus,
      adj.researchSpeed,
      adj.costFactor,
      adj.costFactory,
      adj.data
    )
);

export const getContainsFactory = createSelector(recipesState, (state) =>
  Object.keys(state).some((id) => state[id].factory || state[id].factoryModules)
);

export const getContainsOverclock = createSelector(recipesState, (state) =>
  Object.keys(state).some((id) => state[id].overclock)
);

export const getContainsBeacons = createSelector(recipesState, (state) =>
  Object.keys(state).some(
    (id) =>
      state[id].beacon ||
      state[id].beaconModules ||
      state[id].beaconCount ||
      state[id].beaconTotal
  )
);

export const getContainsCost = createSelector(recipesState, (state) =>
  Object.keys(state).some((id) => state[id].cost)
);
