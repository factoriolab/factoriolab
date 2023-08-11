import { createSelector } from '@ngrx/store';

import {
  Entities,
  Rational,
  RecipeSettings,
  RecipeSettingsRational,
} from '~/models';
import { RecipeUtility } from '~/utilities';
import { LabState } from '../';
import * as Items from '../items';
import * as Machines from '../machines';
import * as Settings from '../settings';
import { RecipesState } from './recipes.reducer';

/* Base selector functions */
export const recipesState = (state: LabState): RecipesState =>
  state.recipesState;

/* Complex selectors */
export const getRecipesState = createSelector(
  recipesState,
  Machines.getMachinesState,
  Settings.getDataset,
  (state, machinesState, data) => {
    const value: Entities<RecipeSettings> = {};
    const defaultExcludedRecipeIds = data.defaults?.excludedRecipeIds ?? [];
    for (const recipe of data.recipeIds.map((i) => data.recipeEntities[i])) {
      const s: RecipeSettings = { ...state[recipe.id] };

      if (s.excluded == null) {
        s.excluded = defaultExcludedRecipeIds.some((i) => i === recipe.id);
      }

      if (s.machineId == null) {
        s.machineId = RecipeUtility.bestMatch(
          recipe.producers,
          machinesState.ids ?? []
        );
      }

      const machine = data.machineEntities[s.machineId];
      const def = machinesState.entities[s.machineId];

      s.fuelId = s.fuelId ?? def.fuelId;

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

export const getRecipesStateRational = createSelector(
  getRecipesState,
  (recipesState) =>
    Object.keys(recipesState).reduce(
      (e: Entities<RecipeSettingsRational>, i) => {
        e[i] = new RecipeSettingsRational(recipesState[i]);
        return e;
      },
      {}
    )
);

export const getAdjustedDataset = createSelector(
  getRecipesStateRational,
  Items.getItemsState,
  Settings.getRationalCost,
  Settings.getAdjustmentData,
  (recipesState, itemsState, cost, adj) =>
    RecipeUtility.adjustDataset(
      recipesState,
      itemsState,
      adj.proliferatorSprayId,
      adj.miningBonus,
      adj.researchSpeed,
      adj.netProductionOnly,
      cost,
      adj.data
    )
);
