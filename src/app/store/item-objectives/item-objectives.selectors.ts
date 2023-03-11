import { createSelector } from '@ngrx/store';

import { fnPropsNotNullish } from '~/helpers';
import {
  Entities,
  Game,
  ItemId,
  ItemRtlObj,
  PowerUnit,
  Rational,
  Step,
  StepDetail,
  StepDetailTab,
  StepOutput,
} from '~/models';
import { RateUtility, SimplexUtility } from '~/utilities';
import { LabState } from '../';
import * as Items from '../item-configs';
import * as Machines from '../machine-configs';
import * as Preferences from '../preferences';
import * as Recipes from '../recipe-configs';
import * as RecipeObjectives from '../recipe-objectives';
import * as Settings from '../settings';
import { ItemsObjState } from './item-objectives.reducer';

/* Base selector functions */
export const itemsObjState = (state: LabState): ItemsObjState =>
  state.itemsObjState;

export const getIds = createSelector(itemsObjState, (state) => state.ids);
export const getEntities = createSelector(
  itemsObjState,
  (state) => state.entities
);

/* Complex selectors */
export const getItemsObj = createSelector(
  getIds,
  getEntities,
  Settings.getDataset,
  (ids, entities, data) =>
    ids.map((i) => entities[i]).filter((p) => data.itemEntities[p.itemId])
);

export const getItemsRtlObj = createSelector(getItemsObj, (itemsObj) =>
  itemsObj.map((p) => new ItemRtlObj(p))
);

export const getNormalizedItemsObj = createSelector(
  getItemsRtlObj,
  Items.getItemsCfg,
  Settings.getBeltSpeed,
  Settings.getDisplayRateInfo,
  Recipes.getAdjustedDataset,
  (itemsObj, itemSettings, beltSpeed, displayRateInfo, data) =>
    itemsObj.map((o) => ({
      ...o,
      ...{
        rate: RateUtility.itemObjectiveNormalizedRate(
          o,
          itemSettings,
          beltSpeed,
          displayRateInfo,
          data
        ),
      },
    }))
);

export const getMatrixResult = createSelector(
  getNormalizedItemsObj,
  RecipeObjectives.getRecipesRtlObj,
  Items.getItemsCfg,
  Recipes.getRecipesCfg,
  Settings.getRationalCost,
  Recipes.getAdjustedDataset,
  (
    itemObjectives,
    recipeObjectives,
    itemSettings,
    recipeSettings,
    cost,
    data
  ) =>
    SimplexUtility.solve(
      itemObjectives,
      recipeObjectives,
      itemSettings,
      recipeSettings,
      cost,
      data
    )
);

export const getSteps = createSelector(
  getMatrixResult,
  RecipeObjectives.getRecipesRtlObj,
  Items.getItemsCfg,
  Recipes.getRecipesRtlCfg,
  Settings.getRationalBeaconReceivers,
  Settings.getBeltSpeed,
  Settings.getDisplayRateInfo,
  Recipes.getAdjustedDataset,
  (
    result,
    recipeObjectives,
    itemSettings,
    recipeSettings,
    beaconReceivers,
    beltSpeed,
    dispRateInfo,
    data
  ) =>
    RateUtility.normalizeSteps(
      result.steps,
      recipeObjectives,
      itemSettings,
      recipeSettings,
      beaconReceivers,
      beltSpeed,
      dispRateInfo,
      data
    )
);

export const getZipState = createSelector(
  itemsObjState,
  RecipeObjectives.recipesObjState,
  Items.itemsCfgState,
  Recipes.recipesCfgState,
  Machines.machineCfgsState,
  Settings.settingsState,
  (itemsObj, recipesObj, itemsCfg, recipesCfg, machinesCfg, settings) => ({
    itemsObj,
    recipesObj,
    itemsCfg,
    recipesCfg,
    machinesCfg,
    settings,
  })
);

export const getStepsModified = createSelector(
  getSteps,
  RecipeObjectives.getBaseRecipesObj,
  Items.itemsCfgState,
  Recipes.recipesCfgState,
  (steps, recipesObj, itemsCfg, recipesCfg) => ({
    recipeObjectives: recipesObj.reduce((e: Entities<boolean>, p) => {
      e[p.id] =
        p.machineId != null ||
        p.machineModuleIds != null ||
        p.beacons != null ||
        p.overclock != null;
      return e;
    }, {}),
    items: steps.reduce((e: Entities<boolean>, s) => {
      if (s.itemId) {
        e[s.itemId] = itemsCfg[s.itemId] != null;
      }
      return e;
    }, {}),
    recipes: steps.reduce((e: Entities<boolean>, s) => {
      if (s.recipeId) {
        e[s.recipeId] = recipesCfg[s.recipeId] != null;
      }
      return e;
    }, {}),
  })
);

export const getTotals = createSelector(
  getSteps,
  Items.getItemsCfg,
  Recipes.getRecipesCfg,
  Recipes.getAdjustedDataset,
  (steps, itemsCfg, recipesCfg, data) => {
    const belts: Entities<Rational> = {};
    const wagons: Entities<Rational> = {};
    const machines: Entities<Rational> = {};
    const machineModules: Entities<Rational> = {};
    const beacons: Entities<Rational> = {};
    const beaconModules: Entities<Rational> = {};
    let power = Rational.zero;
    let pollution = Rational.zero;

    for (const step of steps) {
      if (step.itemId != null) {
        // Total Belts
        if (step.belts?.nonzero()) {
          const belt = itemsCfg[step.itemId].beltId;
          if (belt != null) {
            if (!Object.prototype.hasOwnProperty.call(belts, belt)) {
              belts[belt] = Rational.zero;
            }
            belts[belt] = belts[belt].add(step.belts.ceil());
          }
        }

        // Total Wagons
        if (step.wagons?.nonzero()) {
          const wagon = itemsCfg[step.itemId].wagonId;
          if (wagon != null) {
            if (!Object.prototype.hasOwnProperty.call(wagons, wagon)) {
              wagons[wagon] = Rational.zero;
            }
            wagons[wagon] = wagons[wagon].add(step.wagons.ceil());
          }
        }
      }

      if (step.recipeId != null) {
        // Total Machines & Modules
        if (step.machines?.nonzero()) {
          const recipe = data.recipeEntities[step.recipeId];
          // Don't include silos from launch recipes
          if (!recipe.part) {
            const settings = recipesCfg[step.recipeId];
            let machine = settings.machineId;
            if (
              data.game === Game.DysonSphereProgram &&
              machine === ItemId.MiningDrill
            ) {
              // Use recipe id (vein type) in place of mining drill for DSP mining
              machine = step.recipeId;
            }
            if (machine != null) {
              if (!Object.prototype.hasOwnProperty.call(machines, machine)) {
                machines[machine] = Rational.zero;
              }

              const value = step.machines.ceil();
              machines[machine] = machines[machine].add(value);

              // Check for modules to add
              if (settings.machineModuleIds) {
                addValueToRecordByIds(
                  machineModules,
                  settings.machineModuleIds.filter((i) => i !== ItemId.Module),
                  value
                );
              }
            }
          }
        }

        // Total Beacons
        const stepBeacons = step.recipeSettings?.beacons;
        if (stepBeacons != null) {
          for (const beacon of stepBeacons) {
            const beaconId = beacon.id;
            const total = beacon.total;

            if (beaconId == null || !total?.nonzero()) continue;

            if (!Object.prototype.hasOwnProperty.call(beacons, beaconId)) {
              beacons[beaconId] = Rational.zero;
            }

            const value = total.ceil();
            beacons[beaconId] = beacons[beaconId].add(value);

            // Check for modules to add
            if (beacon.moduleIds != null) {
              addValueToRecordByIds(
                beaconModules,
                beacon.moduleIds.filter((i) => i !== ItemId.Module),
                value
              );
            }
          }
        }
      }

      // Total Power
      if (step.power != null) {
        power = power.add(step.power);
      }

      // Total Pollution
      if (step.pollution != null) {
        pollution = pollution.add(step.pollution);
      }
    }

    return {
      belts,
      wagons,
      machines,
      machineModules,
      beacons,
      beaconModules,
      power,
      pollution,
    };
  }
);

function addValueToRecordByIds(
  record: Entities<Rational>,
  ids: string[],
  value: Rational
): void {
  ids.forEach((id) => {
    if (!Object.prototype.hasOwnProperty.call(record, id)) {
      record[id] = Rational.zero;
    }

    record[id] = record[id].add(value);
  });
}

export const getStepDetails = createSelector(
  getSteps,
  Recipes.getAdjustedDataset,
  (steps, data) =>
    steps.reduce((e: Entities<StepDetail>, s) => {
      const tabs: StepDetailTab[] = [];
      const outputs: StepOutput[] = [];
      const recipeIds: string[] = [];
      if (s.itemId != null && s.items != null) {
        const itemId = s.itemId; // Store null-checked id
        tabs.push(StepDetailTab.Item);
        outputs.push(
          ...steps
            .filter(fnPropsNotNullish('outputs', 'recipeId', 'machines'))
            .filter((s) => s.outputs[itemId] != null)
            .map((s) => ({
              recipeId: s.recipeId,
              recipeObjectiveId: s.recipeObjectiveId,
              value: s.outputs[itemId],
              machines: s.machines,
            }))
        );

        const inputs = outputs.reduce((r: Rational, o) => {
          return r.sub(o.value);
        }, Rational.one);
        if (inputs.nonzero()) {
          outputs.push({
            inputs: true,
            value: inputs,
            machines: Rational.zero,
          });
        }

        outputs.sort((a, b) => b.value.sub(a.value).toNumber());
      }
      if (s.recipeId != null) {
        tabs.push(StepDetailTab.Recipe);
      }
      if (s.machines?.nonzero()) {
        tabs.push(StepDetailTab.Machine);
      }
      if (s.itemId != null) {
        for (const recipe of data.recipeIds.map((r) => data.recipeR[r])) {
          if (recipe.produces(s.itemId)) {
            recipeIds.push(recipe.id);
          }
        }
        if (recipeIds.length) {
          tabs.push(StepDetailTab.Recipes);
        }
      }

      e[s.id] = {
        tabs: tabs.map((t) => ({
          id: `step_${s.id}_${t}_tab`,
          label: t,
          url: `#step_${s.id}_${t}`,
          target: '_self',
        })),
        outputs,
        recipeIds,
      };

      return e;
    }, {})
);

export const getStepById = createSelector(getSteps, (steps) =>
  steps.reduce((e: Entities<Step>, s) => {
    e[s.id] = s;
    return e;
  }, {})
);

export const getStepByItemEntities = createSelector(getSteps, (steps) =>
  steps.reduce((e: Entities<Step>, s) => {
    if (s.itemId != null) {
      e[s.itemId] = s;
    }
    return e;
  }, {})
);

export const getStepTree = createSelector(getSteps, (steps) => {
  const tree: Entities<boolean[]> = {};
  const indents: Entities<number> = {};
  for (const step of steps) {
    let indent: boolean[] = [];
    if (step.parents) {
      const keys = Object.keys(step.parents);
      if (keys.length === 1 && indents[keys[0]] != null) {
        indent = new Array(indents[keys[0]] + 1).fill(false);
      }
    }
    indents[step.id] = indent.length;
    tree[step.id] = indent;
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (tree[step.id].length) {
      for (let j = i + 1; j < steps.length; j++) {
        const next = steps[j];
        if (tree[next.id]) {
          if (tree[next.id].length === tree[step.id].length) {
            for (let k = i; k < j; k++) {
              const trail = steps[k];
              if (tree[trail.id]) {
                tree[trail.id][tree[step.id].length - 1] = true;
              }
            }
            break;
          } else if (tree[next.id].length < tree[step.id].length) {
            break;
          }
        }
      }
    }
  }

  return tree;
});

export const getEffectivePowerUnit = createSelector(
  getSteps,
  Preferences.getPowerUnit,
  (steps, powerUnit) => {
    if (powerUnit === PowerUnit.Auto) {
      let minPower: Rational | undefined;
      for (const step of steps) {
        if (step.power != null) {
          if (minPower == null || step.power.lt(minPower)) {
            minPower = step.power;
          }
        }
      }
      minPower = minPower ?? Rational.zero;
      if (minPower.lt(Rational.thousand)) {
        return PowerUnit.kW;
      } else if (minPower.lt(Rational.million)) {
        return PowerUnit.MW;
      } else {
        return PowerUnit.GW;
      }
    } else {
      return powerUnit;
    }
  }
);
