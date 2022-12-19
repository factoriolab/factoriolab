import { createSelector } from '@ngrx/store';

import {
  Entities,
  Rational,
  RationalRecipeSettings,
  RecipeSettings,
} from '~/models';
import { RecipeUtility } from '~/utilities';
import { LabState } from '../';
import * as Factories from '../factories';
import * as Items from '../items';
import * as Producers from '../producers';
import * as Settings from '../settings';
import { RecipesState } from './recipes.reducer';

/* Base selector functions */
export const recipesState = (state: LabState): RecipesState =>
  state.recipesState;

/* Complex selectors */
export const getRecipeSettings = createSelector(
  recipesState,
  Factories.getFactories,
  Settings.getDataset,
  (state, factories, data) => {
    const value: Entities<RecipeSettings> = {};
    for (const recipe of data.recipeIds.map((i) => data.recipeEntities[i])) {
      const s: RecipeSettings = { ...state[recipe.id] };

      if (s.factoryId == null) {
        s.factoryId = RecipeUtility.bestMatch(
          recipe.producers,
          factories.ids ?? []
        );
      }

      const factory = data.factoryEntities[s.factoryId];
      const def = factories.entities[s.factoryId];
      if (factory != null && RecipeUtility.allowsModules(recipe, factory)) {
        s.factoryModuleOptions = RecipeUtility.moduleOptions(
          factory,
          recipe.id,
          data
        );

        if (s.factoryModuleIds == null) {
          s.factoryModuleIds = RecipeUtility.defaultModules(
            s.factoryModuleOptions,
            def.moduleRankIds ?? [],
            factory.modules ?? 0
          );
        }

        if (s.beacons == null) {
          s.beacons = [{}];
        }

        for (const beaconSettings of s.beacons) {
          beaconSettings.count = beaconSettings.count ?? def.beaconCount;
          beaconSettings.id = beaconSettings.id ?? def.beaconId;

          if (beaconSettings.id != null) {
            const beacon = data.beaconEntities[beaconSettings.id];
            beaconSettings.moduleOptions = RecipeUtility.moduleOptions(
              beacon,
              recipe.id,
              data
            );

            if (beaconSettings.moduleIds == null) {
              beaconSettings.moduleIds = RecipeUtility.defaultModules(
                beaconSettings.moduleOptions,
                def.beaconModuleRankIds ?? [],
                beacon.modules
              );
            }
          }
        }
      } else {
        // Factory doesn't support modules, remove any
        delete s.factoryModuleIds;
        delete s.beacons;
      }

      if (s.beacons) {
        for (const beaconSettings of s.beacons) {
          if (
            beaconSettings.total != null &&
            (beaconSettings.count == null ||
              Rational.fromString(beaconSettings.count).isZero())
          ) {
            // No actual beacons, ignore the total beacons
            delete beaconSettings.total;
          }
        }
      }

      s.overclock = s.overclock ?? def?.overclock;

      value[recipe.id] = s;
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
  Settings.getFuelId,
  Settings.getRationalMiningBonus,
  Settings.getResearchFactor,
  Settings.getDataset,
  (fuelId, miningBonus, researchSpeed, data) => ({
    fuelId,
    miningBonus,
    researchSpeed,
    data,
  })
);

export const getAdjustedDataset = createSelector(
  getRationalRecipeSettings,
  Items.getItemSettings,
  Settings.getDisabledRecipeIds,
  Settings.getAdjustmentData,
  (recipeSettings, itemSettings, disabledRecipeIds, adj) =>
    RecipeUtility.adjustDataset(
      recipeSettings,
      itemSettings,
      disabledRecipeIds,
      adj.fuelId,
      adj.proliferatorSprayId,
      adj.miningBonus,
      adj.researchSpeed,
      adj.costFactor,
      adj.costFactory,
      adj.data
    )
);

export const getRecipesModified = createSelector(
  recipesState,
  Producers.getBaseProducers,
  (state, producers) => ({
    factories:
      Object.keys(state).some(
        (id) =>
          state[id].factoryId != null ||
          state[id].factoryModuleIds != null ||
          state[id].overclock != null
      ) ||
      producers.some(
        (p) =>
          p.factoryId != null ||
          p.factoryModuleIds != null ||
          p.overclock != null
      ),
    beacons:
      Object.keys(state).some((id) => state[id].beacons != null) ||
      producers.some((p) => p.beacons != null),
    cost: Object.keys(state).some((id) => state[id].cost),
  })
);
