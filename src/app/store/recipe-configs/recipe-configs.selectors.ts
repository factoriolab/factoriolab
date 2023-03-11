import { createSelector } from '@ngrx/store';

import { Entities, Rational, RecipeCfg, RecipeRtlCfg } from '~/models';
import { RecipeUtility } from '~/utilities';
import { LabState } from '../';
import * as Items from '../item-configs';
import * as Machines from '../machine-configs';
import * as RecipeObjectives from '../recipe-objectives';
import * as Settings from '../settings';
import { RecipesCfgState } from './recipe-configs.reducer';

/* Base selector functions */
export const recipesCfgState = (state: LabState): RecipesCfgState =>
  state.recipesCfgState;

/* Complex selectors */
export const getRecipesCfg = createSelector(
  recipesCfgState,
  Machines.getMachinesCfg,
  Settings.getDataset,
  (state, machinesCfg, data) => {
    const value: Entities<RecipeCfg> = {};
    const defaultexcludedRecipeIds = data.defaults?.excludedRecipeIds ?? [];
    for (const recipe of data.recipeIds.map((i) => data.recipeEntities[i])) {
      const s: RecipeCfg = { ...state[recipe.id] };

      if (s.excluded == null) {
        s.excluded = defaultexcludedRecipeIds.some((i) => i === recipe.id);
      }

      if (s.machineId == null) {
        s.machineId = RecipeUtility.bestMatch(
          recipe.producers,
          machinesCfg.ids ?? []
        );
      }

      const machine = data.machineEntities[s.machineId];
      const def = machinesCfg.entities[s.machineId];
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

export const getRecipesRtlCfg = createSelector(getRecipesCfg, (recipesCfg) =>
  Object.keys(recipesCfg).reduce((e: Entities<RecipeRtlCfg>, i) => {
    e[i] = new RecipeRtlCfg(recipesCfg[i]);
    return e;
  }, {})
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
  getRecipesRtlCfg,
  Items.getItemsCfg,
  Settings.getRationalCost,
  Settings.getAdjustmentData,
  (recipeSettings, itemSettings, cost, adj) =>
    RecipeUtility.adjustDataset(
      recipeSettings,
      itemSettings,
      adj.fuelId,
      adj.proliferatorSprayId,
      adj.miningBonus,
      adj.researchSpeed,
      adj.netProductionOnly,
      cost,
      adj.data
    )
);

export const getRecipesModified = createSelector(
  recipesCfgState,
  RecipeObjectives.getBaseRecipesObj,
  (state, recipeObjectives) => ({
    checked:
      Object.keys(state).some((id) => state[id].checked != null) ||
      recipeObjectives.some((p) => p.checked != null),
    machines:
      Object.keys(state).some(
        (id) =>
          state[id].machineId != null ||
          state[id].machineModuleIds != null ||
          state[id].overclock != null
      ) ||
      recipeObjectives.some(
        (p) =>
          p.machineId != null ||
          p.machineModuleIds != null ||
          p.overclock != null
      ),
    beacons:
      Object.keys(state).some((id) => state[id].beacons != null) ||
      recipeObjectives.some((p) => p.beacons != null),
    cost: Object.keys(state).some((id) => state[id].cost),
  })
);
