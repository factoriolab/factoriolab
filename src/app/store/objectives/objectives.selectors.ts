import { createSelector } from '@ngrx/store';

import { fnPropsNotNullish } from '~/helpers';
import {
  Entities,
  Game,
  isRecipeObjective,
  ItemId,
  PowerUnit,
  rational,
  Rational,
  Step,
  StepDetail,
  StepDetailTab,
  StepOutput,
} from '~/models';
import { RateUtility, RecipeUtility, SimplexUtility } from '~/utilities';
import { LabState } from '../';
import * as Items from '../items';
import * as Machines from '../machines';
import * as Preferences from '../preferences';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import { ObjectivesState } from './objectives.reducer';

/* Base selector functions */
export const objectivesState = (state: LabState): ObjectivesState =>
  state.objectivesState;

export const getIds = createSelector(objectivesState, (state) => state.ids);
export const getEntities = createSelector(
  objectivesState,
  (state) => state.entities,
);

/** Complex selectors */
export const getBaseObjectives = createSelector(
  getIds,
  getEntities,
  Settings.getDataset,
  (ids, entities, data) =>
    ids
      .map((i) => entities[i])
      .filter((o) =>
        isRecipeObjective(o)
          ? data.recipeEntities[o.targetId] != null
          : data.itemEntities[o.targetId] != null,
      ),
);

export const getObjectives = createSelector(
  getBaseObjectives,
  Items.getItemsState,
  Recipes.getRecipesState,
  Machines.getMachinesState,
  Settings.settingsState,
  Recipes.getAdjustedDataset,
  (objectives, itemsState, recipesState, machinesState, settings, data) =>
    objectives.map((o) =>
      RecipeUtility.adjustObjective(
        o,
        itemsState,
        recipesState,
        machinesState,
        settings,
        data,
      ),
    ),
);

export const getNormalizedObjectives = createSelector(
  getObjectives,
  Items.getItemsState,
  Settings.getBeltSpeed,
  Settings.getDisplayRateInfo,
  Recipes.getAdjustedDataset,
  (objectives, itemsSettings, beltSpeed, displayRateInfo, data) =>
    objectives.map((o) => ({
      ...o,
      ...{
        value: RateUtility.objectiveNormalizedRate(
          o,
          itemsSettings,
          beltSpeed,
          displayRateInfo,
          data,
        ),
      },
    })),
);

export const getMatrixResult = createSelector(
  getNormalizedObjectives,
  Items.getItemsState,
  Recipes.getRecipesState,
  Settings.getAllResearchedTechnologyIds,
  Settings.getMaximizeType,
  Settings.getSurplusMachinesOutput,
  Settings.getCosts,
  Recipes.getAdjustedDataset,
  Preferences.getPaused,
  (
    objectives,
    itemsSettings,
    recipesSettings,
    researchedTechnologyIds,
    maximizeType,
    surplusMachinesOutput,
    costs,
    data,
    paused,
  ) =>
    SimplexUtility.solve(
      objectives,
      itemsSettings,
      recipesSettings,
      researchedTechnologyIds,
      maximizeType,
      surplusMachinesOutput,
      costs,
      data,
      paused,
    ),
);

export const getSteps = createSelector(
  getMatrixResult,
  getObjectives,
  Items.getItemsState,
  Recipes.getRecipesState,
  Settings.getBeaconReceivers,
  Settings.getBeltSpeed,
  Settings.getDisplayRateInfo,
  Recipes.getAdjustedDataset,
  (
    result,
    objectives,
    itemsState,
    recipesState,
    beaconReceivers,
    beltSpeed,
    dispRateInfo,
    data,
  ) =>
    RateUtility.normalizeSteps(
      result.steps,
      objectives,
      itemsState,
      recipesState,
      beaconReceivers,
      beltSpeed,
      dispRateInfo,
      data,
    ),
);

export const getZipState = createSelector(
  objectivesState,
  Items.itemsState,
  Recipes.recipesState,
  Machines.machinesState,
  Settings.settingsState,
  (objectives, itemsState, recipesState, machinesState, settings) => ({
    objectives,
    itemsState,
    recipesState,
    machinesState,
    settings,
  }),
);

export const getStepsModified = createSelector(
  getSteps,
  getBaseObjectives,
  Items.itemsState,
  Recipes.recipesState,
  (steps, objectives, itemsSettings, recipesSettings) => ({
    objectives: objectives.reduce((e: Entities<boolean>, p) => {
      e[p.id] =
        p.machineId != null ||
        p.modules != null ||
        p.beacons != null ||
        p.overclock != null;
      return e;
    }, {}),
    items: steps.reduce((e: Entities<boolean>, s) => {
      if (s.itemId) {
        e[s.itemId] = itemsSettings[s.itemId] != null;
      }
      return e;
    }, {}),
    recipes: steps.reduce((e: Entities<boolean>, s) => {
      if (s.recipeId) {
        e[s.recipeId] = recipesSettings[s.recipeId] != null;
      }
      return e;
    }, {}),
  }),
);

export const getTotals = createSelector(
  getSteps,
  Items.getItemsState,
  Recipes.getAdjustedDataset,
  (steps, itemsSettings, data) => {
    const belts: Entities<Rational> = {};
    const wagons: Entities<Rational> = {};
    const machines: Entities<Rational> = {};
    const modules: Entities<Rational> = {};
    const beacons: Entities<Rational> = {};
    const beaconModules: Entities<Rational> = {};
    let power = rational(0n);
    let pollution = rational(0n);

    for (const step of steps) {
      if (step.itemId != null) {
        // Total Belts
        if (step.belts?.nonzero()) {
          const belt = itemsSettings[step.itemId].beltId;
          if (belt != null) {
            if (!belts[belt]) {
              belts[belt] = rational(0n);
            }
            belts[belt] = belts[belt].add(step.belts.ceil());
          }
        }

        // Total Wagons
        if (step.wagons?.nonzero()) {
          const wagon = itemsSettings[step.itemId].wagonId;
          if (wagon != null) {
            if (!wagons[wagon]) {
              wagons[wagon] = rational(0n);
            }
            wagons[wagon] = wagons[wagon].add(step.wagons.ceil());
          }
        }
      }

      if (
        step.recipeId != null &&
        step.recipe != null &&
        step.recipeSettings != null
      ) {
        // Total Machines & Modules
        if (step.machines?.nonzero()) {
          const recipe = step.recipe;
          // Don't include silos from launch recipes
          if (!recipe.part) {
            const settings = step.recipeSettings;
            let machine = settings.machineId;
            if (
              data.game === Game.DysonSphereProgram &&
              machine === ItemId.MiningMachine
            ) {
              // Use recipe id (vein type) in place of mining machine for DSP mining
              machine = step.recipeId;
            }
            if (machine != null) {
              if (!machines[machine]) {
                machines[machine] = rational(0n);
              }

              const value = step.machines.ceil();
              machines[machine] = machines[machine].add(value);

              // Check for modules to add
              if (settings.modules != null) {
                settings.modules.forEach((m) => {
                  if (m.id == null || m.count == null || m.id === ItemId.Module)
                    return;
                  addValueToRecordByIds(modules, [m.id], value.mul(m.count));
                });
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

            if (!beacons[beaconId]) {
              beacons[beaconId] = rational(0n);
            }

            const value = total.ceil();
            beacons[beaconId] = beacons[beaconId].add(value);

            // Check for modules to add
            if (beacon.modules != null) {
              beacon.modules.forEach((m) => {
                if (m.id == null || m.count == null || m.id === ItemId.Module)
                  return;
                addValueToRecordByIds(
                  beaconModules,
                  [m.id],
                  value.mul(m.count),
                );
              });
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
      modules,
      beacons,
      beaconModules,
      power,
      pollution,
    };
  },
);

function addValueToRecordByIds(
  record: Entities<Rational>,
  ids: string[],
  value: Rational,
): void {
  ids.forEach((id) => {
    if (!record[id]) {
      record[id] = rational(0n);
    }

    record[id] = record[id].add(value);
  });
}

export const getStepDetails = createSelector(
  getSteps,
  Recipes.getRecipesState,
  Recipes.getAdjustedDataset,
  (steps, recipesState, data) =>
    steps.reduce((e: Entities<StepDetail>, s) => {
      const tabs: StepDetailTab[] = [];
      const outputs: StepOutput[] = [];
      let recipeIds: string[] = [];
      if (s.itemId != null && s.items != null) {
        const itemId = s.itemId; // Store null-checked id
        tabs.push(StepDetailTab.Item);
        outputs.push(
          ...steps
            .filter(fnPropsNotNullish('outputs', 'recipeId', 'machines'))
            .filter((s) => s.outputs[itemId] != null)
            .map(
              (s): StepOutput => ({
                step: s,
                value: s.outputs[itemId],
              }),
            ),
        );

        const inputs = outputs.reduce((r: Rational, o) => {
          return r.sub(o.value);
        }, rational(1n));
        if (inputs.nonzero()) {
          outputs.push({
            inputs: true,
            value: inputs,
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
        recipeIds = data.itemRecipeIds[s.itemId];
        if (recipeIds.length) {
          tabs.push(StepDetailTab.Recipes);
        }
      }

      e[s.id] = {
        tabs: tabs.map((t) => {
          const id = `step_${s.id}_${t}_tab`;
          return {
            id,
            label: t,
            command:
              // Simple assignment function; testing is unnecessary
              // istanbul ignore next
              (): void => {
                history.replaceState(
                  {},
                  '',
                  `${window.location.href.replace(/#(.*)$/, '')}#${id}`,
                );
              },
          };
        }),
        outputs,
        recipeIds,
        allRecipesIncluded: recipeIds.every((r) => !recipesState[r].excluded),
      };

      return e;
    }, {}),
);

export const getStepById = createSelector(getSteps, (steps) =>
  steps.reduce((e: Entities<Step>, s) => {
    e[s.id] = s;
    return e;
  }, {}),
);

export const getStepByItemEntities = createSelector(getSteps, (steps) =>
  steps.reduce((e: Entities<Step>, s) => {
    if (s.itemId != null) {
      e[s.itemId] = s;
    }
    return e;
  }, {}),
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
      minPower = minPower ?? rational(0n);
      if (minPower.lt(rational(1000n))) {
        return PowerUnit.kW;
      } else if (minPower.lt(rational(1000000n))) {
        return PowerUnit.MW;
      } else {
        return PowerUnit.GW;
      }
    } else {
      return powerUnit;
    }
  },
);

export const getRecipesModified = createSelector(
  Recipes.recipesState,
  getBaseObjectives,
  (state, objectives) => ({
    checked:
      Object.keys(state).some((id) => state[id].checked != null) ||
      objectives.some((p) => p.checked != null),
    machines:
      Object.keys(state).some(
        (id) =>
          state[id].fuelId != null ||
          state[id].machineId != null ||
          state[id].modules != null ||
          state[id].overclock != null,
      ) ||
      objectives.some(
        (p) =>
          p.fuelId != null ||
          p.machineId != null ||
          p.modules != null ||
          p.overclock != null,
      ),
    beacons:
      Object.keys(state).some((id) => state[id].beacons != null) ||
      objectives.some((p) => p.beacons != null),
    cost: Object.keys(state).some((id) => state[id].cost),
  }),
);
