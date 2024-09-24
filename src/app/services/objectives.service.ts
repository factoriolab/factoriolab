import { computed, inject, Injectable } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, pairwise } from 'rxjs';

import {
  addValueToRecordByIds,
  coalesce,
  fnPropsNotNullish,
  spread,
  toEntities,
} from '~/helpers';
import { displayRateInfo } from '~/models/enum/display-rate';
import { Game } from '~/models/enum/game';
import { ItemId } from '~/models/enum/item-id';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { PowerUnit } from '~/models/enum/power-unit';
import { StepDetailTab } from '~/models/enum/step-detail-tab';
import {
  isRecipeObjective,
  Objective,
  ObjectiveBase,
} from '~/models/objective';
import { Rational, rational } from '~/models/rational';
import { Step } from '~/models/step';
import { StepDetail, StepOutput } from '~/models/step-detail';
import { Store } from '~/models/store';
import { Entities, Optional } from '~/models/utils';
import { RateUtility } from '~/utilities/rate.utility';
import { RecipeUtility } from '~/utilities/recipe.utility';
import { SimplexUtility } from '~/utilities/simplex.utility';

import { ItemsService } from './items.service';
import { MachinesService } from './machines.service';
import { PreferencesService } from './preferences.service';
import { RecipesService } from './recipes.service';
import { SettingsService } from './settings.service';

export interface ObjectivesState {
  ids: string[];
  entities: Entities<Objective>;
  index: number;
}

export const initialObjectivesState: ObjectivesState = {
  ids: [],
  entities: {},
  index: 0,
};

@Injectable({
  providedIn: 'root',
})
export class ObjectivesService extends Store<ObjectivesState> {
  private itemsSvc = inject(ItemsService);
  private machinesSvc = inject(MachinesService);
  private preferencesSvc = inject(PreferencesService);
  private recipesSvc = inject(RecipesService);
  private settingsSvc = inject(SettingsService);

  baseObjectives = computed(() => {
    const state = this.state();
    const data = this.settingsSvc.dataset();

    return state.ids
      .map((i) => state.entities[i])
      .filter((o) =>
        isRecipeObjective(o)
          ? data.recipeEntities[o.targetId] != null
          : data.itemEntities[o.targetId] != null,
      );
  });

  objectives = computed(() => {
    const objectives = this.baseObjectives();
    const itemsState = this.itemsSvc.itemsState();
    const recipesState = this.recipesSvc.recipesState();
    const machinesState = this.machinesSvc.machinesState();
    const settings = this.settingsSvc.settings();
    const data = this.recipesSvc.adjustedDataset();

    return objectives.map((o) =>
      RecipeUtility.adjustObjective(
        o,
        itemsState,
        recipesState,
        machinesState,
        settings,
        data,
      ),
    );
  });

  normalizedObjectives = computed(() => {
    const objectives = this.objectives();
    const itemsState = this.itemsSvc.itemsState();
    const beltSpeed = this.settingsSvc.beltSpeed();
    const dispRateInfo = this.settingsSvc.displayRateInfo();
    const data = this.recipesSvc.adjustedDataset();

    return objectives.map((o) =>
      spread(o, {
        value: RateUtility.objectiveNormalizedRate(
          o,
          itemsState,
          beltSpeed,
          dispRateInfo,
          data,
        ),
      }),
    );
  });

  matrixResult = computed(() => {
    const objectives = this.normalizedObjectives();
    const settings = this.settingsSvc.settings();
    const data = this.recipesSvc.adjustedDataset();
    const paused = this.preferencesSvc.paused();

    return SimplexUtility.solve(objectives, settings, data, paused);
  });

  steps = computed(() => {
    const result = this.matrixResult();
    const objectives = this.objectives();
    const itemsState = this.itemsSvc.itemsState();
    const recipesState = this.recipesSvc.recipesState();
    const beltSpeed = this.settingsSvc.beltSpeed();
    const dispRateInfo = this.settingsSvc.displayRateInfo();
    const settings = this.settingsSvc.settings();
    const data = this.recipesSvc.adjustedDataset();

    return RateUtility.normalizeSteps(
      result.steps,
      objectives,
      itemsState,
      recipesState,
      beltSpeed,
      dispRateInfo,
      settings,
      data,
    );
  });

  stepsModified = computed(() => {
    const steps = this.steps();
    const objectives = this.baseObjectives();
    const itemsState = this.itemsSvc.state();
    const recipesState = this.recipesSvc.state();

    return {
      objectives: objectives.reduce((e: Entities<boolean>, p) => {
        e[p.id] =
          p.machineId != null ||
          p.modules != null ||
          p.beacons != null ||
          p.overclock != null;
        return e;
      }, {}),
      items: steps.reduce((e: Entities<boolean>, s) => {
        if (s.itemId) e[s.itemId] = itemsState[s.itemId] != null;
        return e;
      }, {}),
      recipes: steps.reduce((e: Entities<boolean>, s) => {
        if (s.recipeId) e[s.recipeId] = recipesState[s.recipeId] != null;
        return e;
      }, {}),
    };
  });

  totals = computed(() => {
    const steps = this.steps();
    const itemsState = this.itemsSvc.itemsState();
    const data = this.recipesSvc.adjustedDataset();

    const belts: Entities<Rational> = {};
    const wagons: Entities<Rational> = {};
    const machines: Entities<Rational> = {};
    const modules: Entities<Rational> = {};
    const beacons: Entities<Rational> = {};
    const beaconModules: Entities<Rational> = {};
    let power = rational.zero;
    let pollution = rational.zero;

    for (const step of steps) {
      if (step.itemId != null) {
        // Total Belts
        if (step.belts?.nonzero()) {
          const belt = itemsState[step.itemId].beltId;
          if (belt != null) {
            if (!belts[belt]) belts[belt] = rational.zero;

            belts[belt] = belts[belt].add(step.belts.ceil());
          }
        }

        // Total Wagons
        if (step.wagons?.nonzero()) {
          const wagon = itemsState[step.itemId].wagonId;
          if (wagon != null) {
            if (!wagons[wagon]) wagons[wagon] = rational.zero;

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
              if (!machines[machine]) machines[machine] = rational.zero;

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

            if (!beacons[beaconId]) beacons[beaconId] = rational.zero;

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
      if (step.power != null) power = power.add(step.power);

      // Total Pollution
      if (step.pollution != null) pollution = pollution.add(step.pollution);
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
  });

  stepDetails = computed(() => {
    const steps = this.steps();
    const settings = this.settingsSvc.settings();
    const data = this.recipesSvc.adjustedDataset();

    return steps.reduce((e: Entities<StepDetail>, s) => {
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
        }, rational.one);
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
        allRecipesIncluded: recipeIds.every(
          (r) => !settings.excludedRecipeIds.has(r),
        ),
      };

      return e;
    }, {});
  });

  stepById = computed(() => {
    const steps = this.steps();
    return toEntities(steps);
  });

  stepByItemEntities = computed(() => {
    const steps = this.steps();
    return steps.reduce((e: Entities<Step>, s) => {
      if (s.itemId != null) {
        e[s.itemId] = s;
      }
      return e;
    }, {});
  });

  stepTree = computed(() => {
    const steps = this.steps();

    const tree: Entities<boolean[]> = {};
    const indents: Entities<number> = {};
    for (const step of steps) {
      let indent: boolean[] = [];
      if (step.parents) {
        const keys = Object.keys(step.parents);
        if (keys.length === 1 && indents[keys[0]] != null) {
          indent = new Array<boolean>(indents[keys[0]] + 1).fill(false);
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

  effectivePowerUnit = computed(() => {
    const powerUnit = this.preferencesSvc.powerUnit();
    if (powerUnit !== PowerUnit.Auto) return powerUnit;

    const steps = this.steps();
    let minPower: Rational | undefined;
    for (const step of steps) {
      if (step.power != null && (minPower == null || step.power.lt(minPower)))
        minPower = step.power;
    }
    minPower = minPower ?? rational.zero;
    if (minPower.lt(rational(1000n))) return PowerUnit.kW;
    else if (minPower.lt(rational(1000000n))) return PowerUnit.MW;
    else return PowerUnit.GW;
  });

  recipesModified = computed(() => {
    const state = this.recipesSvc.state();
    const objectives = this.baseObjectives();

    return {
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
    };
  });

  constructor() {
    super(initialObjectivesState);

    toObservable(this.settingsSvc.displayRate)
      .pipe(
        pairwise(),
        filter(([before, after]) => before !== after),
      )
      .subscribe(([before, after]) => {
        const factor = displayRateInfo[after].value.div(
          displayRateInfo[before].value,
        );
        this.adjustDisplayRate(factor);
      });
  }

  add(objective: ObjectiveBase): void {
    this.reduce((state) => {
      let value = rational.one;
      const lastId = state.ids.at(-1);
      if (lastId) value = state.entities[lastId].value;

      return {
        ids: [...state.ids, state.index.toString()],
        entities: spread(state.entities, {
          [state.index]: {
            id: state.index.toString(),
            targetId: objective.targetId,
            value,
            unit: objective.unit,
            type: coalesce(objective.type, ObjectiveType.Output),
          },
        }),
        index: state.index + 1,
      };
    });
  }

  create(objective: Objective): void {
    const id = '0';
    this.set({
      ids: [id],
      entities: { [id]: spread(objective, { id }) },
      index: 1,
    });
  }

  remove(id: string): void {
    this.update((state) => ({
      ids: state.ids.filter((i) => i !== id),
      entities: this._removeEntry(state.entities, id),
    }));
  }

  setOrder(objectives: Objective[]): void {
    const ids = objectives.map((o) => o.id);
    this.update(() => ({ ids }));
  }

  updateEntity(id: string, partial: Partial<Objective>): void {
    this.update((state) => {
      const entities = this._updateEntity(state.entities, id, partial);
      return { entities };
    });
  }

  updateEntityField<K extends keyof Objective>(
    id: string,
    field: K,
    value: Objective[K],
    def?: Optional<Objective[K]>,
  ): void {
    this.update((state) => {
      const entities = this._updateField(state.entities, id, field, value, def);
      return { entities };
    });
  }

  adjustDisplayRate(factor: Rational): void {
    this.update((state) => {
      const entities = spread(state.entities);
      for (const objective of state.ids
        .map((i) => state.entities[i])
        .filter(
          (o) =>
            o.type !== ObjectiveType.Maximize &&
            (o.unit === ObjectiveUnit.Items || o.unit === ObjectiveUnit.Wagons),
        )) {
        const value = objective.value.mul(factor);
        entities[objective.id] = spread(objective, { value });
      }
      return { entities };
    });
  }

  resetFields(fields: (keyof Objective)[]): void {
    this.update((state) => {
      const entities = this._resetFields(state.entities, fields);
      return { entities };
    });
  }
}
