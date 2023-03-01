import { createSelector } from '@ngrx/store';

import {
  Entities,
  Rational,
  RationalRecipeSettings,
  RecipeSettings,
} from '~/models';
import { RecipeUtility } from '~/utilities';
import { LabState } from '../';
import * as Items from '../items';
import * as Machines from '../machines';
import * as Producers from '../producers';
import * as Settings from '../settings';
import { RecipesState } from './recipes.reducer';

/* Base selector functions */
export const recipesState = (state: LabState): RecipesState =>
  state.recipesState;

/* Complex selectors */
export const getRecipeSettings = createSelector(
  recipesState,
  Machines.getMachines,
  Settings.getDataset,
  (state, machines, data) => {
    const value: Entities<RecipeSettings> = {};
    const defaultexcludedRecipeIds = data.defaults?.excludedRecipeIds ?? [];
    for (const recipe of data.recipeIds.map((i) => data.recipeEntities[i])) {
      const s: RecipeSettings = { ...state[recipe.id] };

      if (s.excluded == null) {
        s.excluded = defaultexcludedRecipeIds.some((i) => i === recipe.id);
      }

      if (s.machineId == null) {
        s.machineId = RecipeUtility.bestMatch(
          recipe.producers,
          machines.ids ?? []
        );
      }

      const machine = data.machineEntities[s.machineId];
      const def = machines.entities[s.machineId];
      if (machine != null && RecipeUtility.allowsModules(recipe, machine)) {
        s.machineModuleOptions = RecipeUtility.moduleOptions(
          machine,
          recipe.id,
          data
        );

        if (s.machineModuleIds == null) {
          s.machineModuleIds = RecipeUtility.defaultModules(
            s.machineModuleOptions,
            def.moduleRankIds ?? [],
            machine.modules ?? 0
          );
        }

        if (s.beacons == null) {
          s.beacons = [{}];
        }

        s.beacons = s.beacons.map((b) => ({ ...b }));

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
        // Machine doesn't support modules, remove any
        delete s.machineModuleIds;
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
  Settings.getAdjustmentData,
  (recipeSettings, itemSettings, adj) =>
    RecipeUtility.adjustDataset(
      recipeSettings,
      itemSettings,
      adj.fuelId,
      adj.proliferatorSprayId,
      adj.miningBonus,
      adj.researchSpeed,
      adj.netProductionOnly,
      adj.costFactor,
      adj.costMachine,
      adj.data
    )
);

export const getRecipesModified = createSelector(
  recipesState,
  Producers.getBaseProducers,
  (state, producers) => ({
    checked:
      Object.keys(state).some((id) => state[id].checked != null) ||
      producers.some((p) => p.checked != null),
    machines:
      Object.keys(state).some(
        (id) =>
          state[id].machineId != null ||
          state[id].machineModuleIds != null ||
          state[id].overclock != null
      ) ||
      producers.some(
        (p) =>
          p.machineId != null ||
          p.machineModuleIds != null ||
          p.overclock != null
      ),
    beacons:
      Object.keys(state).some((id) => state[id].beacons != null) ||
      producers.some((p) => p.beacons != null),
    cost: Object.keys(state).some((id) => state[id].cost),
  })
);
