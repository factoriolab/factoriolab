import { createSelector } from '@ngrx/store';

import { fnPropsNotNullish } from '~/helpers';
import {
  Entities,
  Game,
  isRecipeObjective,
  ItemId,
  ObjectiveRational,
  PowerUnit,
  Rational,
  RecipeRational,
  RecipeSettingsRational,
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
  Machines.getMachinesState,
  Settings.getDataset,
  (objectives, machinesState, data) =>
    objectives.map((o) =>
      RecipeUtility.adjustObjective(o, machinesState, data),
    ),
);

export const getObjectiveRationals = createSelector(
  getObjectives,
  Settings.getAdjustmentData,
  Items.getItemsState,
  Recipes.getRecipesStateRational,
  Recipes.getAdjustedDataset,
  (objectives, adj, itemsState, recipesState, data) =>
    objectives.map((o) => {
      let recipe: RecipeRational | undefined;
      if (isRecipeObjective(o)) {
        recipe = RecipeUtility.adjustRecipe(
          o.targetId,
          adj.proliferatorSprayId,
          adj.miningBonus,
          adj.researchSpeed,
          adj.netProductionOnly,
          new RecipeSettingsRational(o),
          itemsState,
          data,
        );
        RecipeUtility.adjustLaunchRecipeObjective(recipe, recipesState, data);
        recipe.finalize();
      }

      return new ObjectiveRational(o, recipe);
    }),
);

export const getNormalizedObjectives = createSelector(
  getObjectiveRationals,
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
  Settings.getRationalCost,
  Recipes.getAdjustedDataset,
  Preferences.getPaused,
  (
    objectives,
    itemsSettings,
    recipesSettings,
    researchedTechnologyIds,
    maximizeType,
    surplusMachinesOutput,
    cost,
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
      cost,
      data,
      paused,
    ),
);

export const getSteps = createSelector(
  getMatrixResult,
  getObjectiveRationals,
  Items.getItemsState,
  Recipes.getRecipesStateRational,
  Settings.getRationalBeaconReceivers,
  Settings.getBeltSpeed,
  Settings.getDisplayRateInfo,
  Recipes.getAdjustedDataset,
  (
    result,
    objectives,
    itemsSettings,
    recipesSettings,
    beaconReceivers,
    beltSpeed,
    dispRateInfo,
    data,
  ) =>
    RateUtility.normalizeSteps(
      result.steps,
      objectives,
      itemsSettings,
      recipesSettings,
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
        p.machineModuleIds != null ||
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
    const machineModules: Entities<Rational> = {};
    const beacons: Entities<Rational> = {};
    const beaconModules: Entities<Rational> = {};
    let power = Rational.zero;
    let pollution = Rational.zero;

    for (const step of steps) {
      if (step.itemId != null) {
        // Total Belts
        if (step.belts?.nonzero()) {
          const belt = itemsSettings[step.itemId].beltId;
          if (belt != null) {
            if (!belts[belt]) {
              belts[belt] = Rational.zero;
            }
            belts[belt] = belts[belt].add(step.belts.ceil());
          }
        }

        // Total Wagons
        if (step.wagons?.nonzero()) {
          const wagon = itemsSettings[step.itemId].wagonId;
          if (wagon != null) {
            if (!wagons[wagon]) {
              wagons[wagon] = Rational.zero;
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
                machines[machine] = Rational.zero;
              }

              const value = step.machines.ceil();
              machines[machine] = machines[machine].add(value);

              // Check for modules to add
              if (settings.machineModuleIds) {
                addValueToRecordByIds(
                  machineModules,
                  settings.machineModuleIds.filter((i) => i !== ItemId.Module),
                  value,
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

            if (!beacons[beaconId]) {
              beacons[beaconId] = Rational.zero;
            }

            const value = total.ceil();
            beacons[beaconId] = beacons[beaconId].add(value);

            // Check for modules to add
            if (beacon.moduleIds != null) {
              addValueToRecordByIds(
                beaconModules,
                beacon.moduleIds.filter((i) => i !== ItemId.Module),
                value,
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
  },
);

function addValueToRecordByIds(
  record: Entities<Rational>,
  ids: string[],
  value: Rational,
): void {
  ids.forEach((id) => {
    if (!record[id]) {
      record[id] = Rational.zero;
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
            .map((s) => ({
              recipeId: s.recipeId,
              recipeObjectiveId: s.recipeObjectiveId,
              value: s.outputs[itemId],
              machines: s.machines,
            })),
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
          state[id].machineModuleIds != null ||
          state[id].overclock != null,
      ) ||
      objectives.some(
        (p) =>
          p.fuelId != null ||
          p.machineId != null ||
          p.machineModuleIds != null ||
          p.overclock != null,
      ),
    beacons:
      Object.keys(state).some((id) => state[id].beacons != null) ||
      objectives.some((p) => p.beacons != null),
    cost: Object.keys(state).some((id) => state[id].cost),
  }),
);
