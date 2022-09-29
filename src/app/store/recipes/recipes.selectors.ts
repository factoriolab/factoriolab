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
    if (data?.recipeIds?.length) {
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

          s.beaconCount = s.beaconCount ?? def.beaconCount;
          s.beaconId = s.beaconId ?? def.beaconId;

          if (s.beaconId != null) {
            const beacon = data.beaconEntities[s.beaconId];
            s.beaconModuleOptions = RecipeUtility.moduleOptions(
              beacon,
              recipe.id,
              data
            );

            if (s.beaconModuleIds == null) {
              s.beaconModuleIds = RecipeUtility.defaultModules(
                s.beaconModuleOptions,
                def.beaconModuleRankIds ?? [],
                beacon.modules
              );
            }
          }
        } else {
          // Factory doesn't support modules, remove any
          delete s.factoryModuleIds;
          delete s.beaconCount;
          delete s.beaconId;
          delete s.beaconModuleIds;
        }

        if (
          s.beaconTotal &&
          (!s.beaconCount || Rational.fromString(s.beaconCount).isZero())
        ) {
          // No actual beacons, ignore the total beacons
          delete s.beaconTotal;
        }

        s.overclock = s.overclock ?? def?.overclock;

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
      Object.keys(state).some(
        (id) =>
          state[id].beaconCount != null ||
          state[id].beaconId != null ||
          state[id].beaconModuleIds != null ||
          state[id].beaconTotal != null
      ) ||
      producers.some(
        (p) =>
          p.beaconCount != null ||
          p.beaconId != null ||
          p.beaconModuleIds != null
      ),
    cost: Object.keys(state).some((id) => state[id].cost),
  })
);
