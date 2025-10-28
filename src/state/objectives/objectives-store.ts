import { computed, effect, inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  faExclamationCircle,
  faPauseCircle,
} from '@fortawesome/free-solid-svg-icons';

import { TooltipType } from '~/components/tooltip/tooltip-type';
import { IconType } from '~/data/icon-type';
import { Option } from '~/option/option';
import { sortedKeyValues } from '~/rational/key-value-sorted';
import { Rational, rational } from '~/rational/rational';
import { Solver } from '~/solver/solver';
import { Step } from '~/solver/step';
import { InterpolateParams } from '~/translate/translate';
import { coalesce, notNullish } from '~/utils/nullish';
import { spread } from '~/utils/object';
import { toRecord } from '~/utils/record';

import { Adjustment } from '../adjustment';
import { ItemsStore } from '../items/items-store';
import { MachinesStore } from '../machines/machines-store';
import { Normalization } from '../normalization';
import { PowerUnit } from '../preferences/power-unit';
import { PreferencesStore } from '../preferences/preferences-store';
import { RecipeState } from '../recipes/recipe-state';
import { RecipesStore } from '../recipes/recipes-store';
import { DisplayRate, displayRateInfo } from '../settings/display-rate';
import { SettingsStore } from '../settings/settings-store';
import { RecordStore } from '../store';
import { ItemSource } from './item-source';
import { MessageData } from './message-data';
import { isRecipeObjective, ObjectiveBase, ObjectiveState } from './objective';
import { ObjectiveType } from './objective-type';
import { ObjectiveUnit } from './objective-unit';
import { StepDetailRow } from './step-detail-row';
import { StepDetailSection } from './step-detail-section';
import { StepRecipes } from './step-recipes';
import { TotalValue } from './total-value';

@Injectable({ providedIn: 'root' })
export class ObjectivesStore extends RecordStore<ObjectiveState> {
  private readonly title = inject(Title);
  private readonly adjustment = inject(Adjustment);
  private readonly itemsStore = inject(ItemsStore);
  private readonly machinesStore = inject(MachinesStore);
  private readonly normalization = inject(Normalization);
  private readonly preferencesStore = inject(PreferencesStore);
  private readonly recipesStore = inject(RecipesStore);
  private readonly settingsStore = inject(SettingsStore);
  private readonly solver = inject(Solver);

  baseObjectives = computed(() => {
    const state = this.state();
    const data = this.settingsStore.dataset();

    return Object.keys(state)
      .map((i) => state[i])
      .filter((o) =>
        isRecipeObjective(o)
          ? data.recipeRecord[o.targetId] != null
          : data.itemRecord[o.targetId] != null,
      );
  });

  objectives = computed(() => {
    const objectives = this.baseObjectives();
    const itemsState = this.itemsStore.settings();
    const recipesState = this.recipesStore.settings();
    const machinesState = this.machinesStore.settings();
    const settings = this.settingsStore.settings();
    const data = this.recipesStore.adjustedDataset();

    return objectives.map((o) =>
      this.adjustment.adjustObjective(
        o,
        itemsState,
        recipesState,
        machinesState,
        settings,
        data,
      ),
    );
  });

  normalizedObjectives = computed(() =>
    this.objectives().map((o) =>
      spread(o, { value: this.normalization.normalizeRate(o) }),
    ),
  );

  matrixResult = computed(() => {
    const objectives = this.normalizedObjectives();
    const settings = this.settingsStore.settings();
    const data = this.recipesStore.adjustedDataset();
    const paused = this.preferencesStore.paused();

    return this.solver.solve(objectives, settings, data, paused);
  });

  steps = computed(() => {
    const result = this.matrixResult();
    const objectives = this.objectives();

    return this.normalization.normalizeSteps(result.steps, objectives);
  });

  stepsModified = computed(() => {
    const steps = this.steps();
    const objectives = this.baseObjectives();
    const itemsState = this.itemsStore.state();
    const recipesState = this.recipesStore.state();

    return {
      objectives: objectives.reduce((e: Record<string, boolean>, p) => {
        e[p.id] =
          p.machineId != null ||
          p.modules != null ||
          p.beacons != null ||
          p.overclock != null;
        return e;
      }, {}),
      items: steps.reduce((e: Record<string, boolean>, s) => {
        if (s.itemId) e[s.itemId] = itemsState[s.itemId] != null;
        return e;
      }, {}),
      recipes: steps.reduce((e: Record<string, boolean>, s) => {
        if (s.recipeId) e[s.recipeId] = recipesState[s.recipeId] != null;
        return e;
      }, {}),
    };
  });

  totals = computed(() => {
    const steps = this.steps();
    const itemsState = this.itemsStore.settings();
    const data = this.recipesStore.adjustedDataset();

    const belts: Record<string, TotalValue> = {};
    const wagons: Record<string, TotalValue> = {};
    const machines: Record<string, TotalValue> = {};
    const beacons: Record<string, TotalValue> = {};
    let power = rational.zero;
    let pollution = rational.zero;

    for (const step of steps) {
      if (step.itemId != null) {
        // Total Belts
        if (step.belts?.nonzero()) {
          const belt = itemsState[step.itemId].beltId;
          if (belt != null) {
            belts[belt] ??= {
              total: rational.zero,
              iconType: 'item',
              tooltipType: 'belt',
            };

            belts[belt].total = belts[belt].total.add(step.belts.ceil());
          }
        }

        // Total Wagons
        if (step.wagons?.nonzero()) {
          const wagon = itemsState[step.itemId].wagonId;
          if (wagon != null) {
            wagons[wagon] ??= {
              total: rational.zero,
              iconType: 'item',
              tooltipType: 'wagon',
            };

            wagons[wagon].total = wagons[wagon].total.add(step.wagons.ceil());
          }
        }
      }

      function addValueByIds(
        record: Record<string, TotalValue>,
        ids: string[],
        tooltipType: TooltipType,
        value: Rational,
      ): void {
        ids.forEach((id) => {
          record[id] ??= {
            total: rational.zero,
            iconType: 'item',
            tooltipType,
          };

          record[id].total = record[id].total.add(value);
        });
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
          if (!recipe.part && !recipe.flags.has('hideProducer')) {
            const settings = step.recipeSettings;
            let machine = settings.machineId;
            let iconType: IconType = 'item';
            let tooltipType: TooltipType = 'machine';
            if (machine && data.machineRecord[machine].totalRecipe) {
              // Use recipe id (vein type) in place of mining machine for DSP mining
              machine = step.recipeId;
              iconType = 'recipe';
              tooltipType = 'recipe';
            }

            if (machine != null) {
              machines[machine] ??= {
                total: rational.zero,
                iconType,
                tooltipType,
              };

              const value = step.machines.ceil();
              machines[machine].total = machines[machine].total.add(value);

              // Check for modules to add
              if (settings.modules != null) {
                settings.modules.forEach((m) => {
                  if (!m.id || m.count == null) return;
                  addValueByIds(machines, [m.id], 'module', value.mul(m.count));
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

            beacons[beaconId] ??= {
              total: rational.zero,
              iconType: 'item',
              tooltipType: 'beacon',
            };

            const value = total.ceil();
            beacons[beaconId].total = beacons[beaconId].total.add(value);

            // Check for modules to add
            if (beacon.modules != null) {
              beacon.modules.forEach((m) => {
                if (!m.id || m.count == null) return;
                addValueByIds(beacons, [m.id], 'module', value.mul(m.count));
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
      beacons,
      power,
      pollution,
    };
  });

  itemSourceMap = computed(() => {
    const steps = this.steps();
    const result = steps.reduce<Record<string, ItemSource[]>>((e, step) => {
      if (step.outputs == null) return e;

      for (const itemId of Object.keys(step.outputs)) {
        e[itemId] ??= [];
        e[itemId].push({ step, value: step.outputs[itemId] });
      }

      return e;
    }, {});

    for (const itemId of Object.keys(result)) {
      const inputs = result[itemId].reduce((r: Rational, o) => {
        return r.sub(o.value);
      }, rational.one);
      if (inputs.nonzero()) {
        result[itemId].push({
          isInput: true,
          value: inputs,
        });
      }

      result[itemId].sort((a, b) => b.value.sub(a.value).toNumber());
    }

    return result;
  });

  stepDetails = computed(() => {
    const steps = this.steps();
    const stepById = this.stepById();
    const stepByItem = this.stepByItemRecord();
    const data = this.settingsStore.dataset();
    const itemsState = this.itemsStore.settings();
    const itemSourceMap = this.itemSourceMap();

    return steps.reduce<
      Record<string, Record<StepDetailSection, StepDetailRow[]>>
    >((e, s) => {
      let destinations: StepDetailRow[] = [];
      let sources: StepDetailRow[] = [];
      let depletion: StepDetailRow[] = [];
      let inputs: StepDetailRow[] = [];
      let outputs: StepDetailRow[] = [];
      if (s.itemId != null && s.items != null) {
        const itemId = s.itemId; // Store null-checked id
        const itemSettings = itemsState[itemId];
        const itemSources = itemSourceMap[itemId];
        if (s.parents) {
          destinations = sortedKeyValues(s.parents).map(([key, value]) => {
            const row: StepDetailRow = {
              items: s.items?.mul(value),
              itemId,
              belts: s.belts?.mul(value),
              beltId: itemSettings.beltId,
              stack: itemSettings.stack,
              wagons: s.wagons?.mul(value),
              wagonId: itemSettings.wagonId,
              recipeId: s.recipeId,
              recipeObjectiveId: s.recipeObjectiveId,
              percent: value,
              destId: stepById[key]?.recipeId,
              destType: 'recipe',
              isOutput: key === '',
            };
            if (itemSources.length === 1) {
              row.machines = s.machines?.mul(value);
              row.machineId = s.recipeSettings?.machineId;
            }

            return row;
          });
        }

        if (
          itemSources.length > 1 ||
          (itemSources.length === 1 && itemSources[0].step?.id !== s.id)
        ) {
          sources = itemSources.map((i) => ({
            items: s.items?.mul(i.value),
            itemId,
            belts: s.belts?.mul(i.value),
            beltId: itemSettings.beltId,
            stack: itemSettings.stack,
            wagons: s.wagons?.mul(i.value),
            wagonId: itemSettings.wagonId,
            machines: i.step?.machines,
            machineId: i.step?.recipeSettings?.machineId,
            recipeId: i.step?.recipeId,
            recipeObjectiveId: i.step?.recipeObjectiveId,
            percent: i.value,
            percentOnDest: true,
            destId: s.itemId,
            destType: 'item',
            isInput: i.isInput,
          }));
        }
      }

      if (s.recipe) {
        const recipe = s.recipe;
        if (s.outputs) {
          const outputs = s.outputs;
          if (
            data.flags.has('miningDepletion') &&
            s.recipe.flags.has('mining')
          ) {
            depletion = sortedKeyValues(s.outputs)
              .map(([key]) => {
                const step = stepByItem[key];
                const percent = outputs[key];
                if (step == null || percent == null) return undefined;
                return {
                  items: step.items
                    ?.mul(percent)
                    .div(recipe.effects.productivity),
                  itemId: key,
                };
              })
              .filter(notNullish);
          }
        }

        inputs = sortedKeyValues(recipe.in)
          .map(([key]): StepDetailRow | undefined => {
            const step = stepByItem[key];
            const percent = step?.parents?.[s.id];
            let source: ItemSource | undefined;
            if (step.itemId && itemSourceMap[step.itemId].length === 1)
              source = itemSourceMap[step.itemId][0];

            if (step == null || percent == null) return undefined;
            return {
              items: step.items?.mul(percent),
              itemId: key,
              belts: step.belts?.mul(percent),
              beltId: itemsState[key].beltId,
              stack: itemsState[key].stack,
              wagons: step.wagons?.mul(percent),
              wagonId: itemsState[key].wagonId,
              machines: source?.step?.machines?.mul(percent),
              machineId: source?.step?.recipeSettings?.machineId,
              recipeId: source?.step?.recipeId,
              recipeObjectiveId: source?.step?.recipeObjectiveId,
              percent,
              destId: s.recipeId,
              destRecipeObjectiveId: s.recipeObjectiveId,
              destType: 'recipe',
            };
          })
          .filter(notNullish);

        outputs = sortedKeyValues(recipe.out)
          .map(([key]): StepDetailRow | undefined => {
            const step = stepByItem[key];
            const percent = s.outputs?.[key];
            if (step == null || percent == null) return undefined;

            return {
              items: step.items?.mul(percent),
              itemId: key,
              belts: step.belts?.mul(percent),
              beltId: itemsState[key].beltId,
              stack: itemsState[key].stack,
              wagons: step.wagons?.mul(percent),
              wagonId: itemsState[key].wagonId,
              machines: s.machines,
              machineId: s.recipeSettings?.machineId,
              recipeId: s.recipeId,
              recipeObjectiveId: s.recipeObjectiveId,
              percent,
              percentOnDest: true,
              destId: key,
              destType: 'item',
              destRecipeObjectiveId: s.recipeObjectiveId,
            };
          })
          .filter(notNullish);
      }

      e[s.id] = {
        sources,
        destinations,
        depletion,
        inputs,
        outputs,
      };

      return e;
    }, {});
  });

  stepRecipes = computed(() => {
    const steps = this.steps();
    const data = this.recipesStore.adjustedDataset();
    const settings = this.settingsStore.settings();

    return steps.reduce<Record<string, StepRecipes>>((e, s) => {
      let ids: string[] = [];
      let enabledIds: string[] = [];

      if (s.itemId != null) {
        ids = data.itemRecipeIds[s.itemId];
        enabledIds = ids.filter((r) => !settings.excludedRecipeIds.has(r));
      } else if (s.recipeId != null) {
        ids = [s.recipeId];
        enabledIds = [s.recipeId];
      }

      const options = ids.map(
        (i): Option => ({
          label: data.recipeRecord[i].name,
          value: i,
          icon: i,
          iconType: 'recipe',
          tooltip: i,
          tooltipType: 'recipe',
        }),
      );

      e[s.id] = { ids, enabledIds, options };

      return e;
    }, {});
  });

  stepById = computed(() => {
    const steps = this.steps();
    return toRecord(steps);
  });

  stepByItemRecord = computed(() => {
    const steps = this.steps();
    return steps.reduce((e: Record<string, Step>, s) => {
      if (s.itemId != null) {
        e[s.itemId] = s;
      }
      return e;
    }, {});
  });

  stepTree = computed(() => {
    const steps = this.steps();

    const tree: Record<string, boolean[]> = {};
    const indents: Record<string, number> = {};
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
    const powerUnit = this.preferencesStore.powerUnit();
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
    const state = this.recipesStore.state();
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

  message = computed((): MessageData | undefined => {
    const objectives = this.objectives();
    const matrixResult = this.matrixResult();
    const settings = this.settingsStore.settings();

    if (matrixResult.resultType === 'paused')
      return { icon: faPauseCircle, detail: 'objectives.pausedMessage' };

    if (matrixResult.resultType !== 'failed') return;

    const icon = faExclamationCircle;
    let summary = 'objectives.error';
    let detail = 'objectives.errorDetail';
    let recipeId: string | undefined;
    const info = 'objectives.errorSimplexInfo';
    const params: InterpolateParams = {
      returnCode: coalesce(matrixResult.returnCode, 'unknown'),
      simplexStatus: coalesce(matrixResult.simplexStatus, 'unknown'),
    };

    if (matrixResult.simplexStatus === 'unbounded') {
      const maxObjectives = objectives.filter(
        (o) => o.type === ObjectiveType.Maximize,
      );

      summary = 'objectives.errorUnbounded';
      detail = 'objectives.errorUnboundedDetail';

      if (matrixResult.unboundedRecipeId) {
        detail = 'objectives.errorSimplexUnboundedRecipe';
        recipeId = matrixResult.unboundedRecipeId;
      } else if (
        maxObjectives.length &&
        objectives.every((o) => o.type !== ObjectiveType.Limit)
      ) {
        // Found maximize objectives but no limits
        detail = 'objectives.errorNoLimits';
      } else if (
        maxObjectives.some((o) =>
          o.unit === ObjectiveUnit.Machines
            ? settings.excludedRecipeIds.has(o.targetId)
            : settings.excludedItemIds.has(o.targetId),
        )
      ) {
        // Found an excluded maximize objective
        detail = 'objectives.errorMaximizeExcluded';
      }
    } else if (matrixResult.simplexStatus === 'no_feasible') {
      summary = 'objectives.errorInfeasible';
      detail = 'objectives.errorInfeasibleDetail';
    }

    return { icon, summary, detail, info, params, recipeId };
  });

  constructor() {
    super();

    effect(() => {
      const objectives = this.baseObjectives();
      const data = this.settingsStore.dataset();

      const name = objectives
        .map((o) =>
          isRecipeObjective(o)
            ? data.recipeRecord[o.targetId]?.name
            : data.itemRecord[o.targetId]?.name,
        )
        .find((n) => n != null);
      if (name == null) this.title.setTitle('FactorioLab');
      else this.title.setTitle(`${name} | FactorioLab`);
    });
  }

  add(objective: ObjectiveBase): void {
    this.reduce((state) => {
      let n = 1;
      while (state[n.toString()] != null) n++;
      const id = n.toString();
      const base = {
        id,
        type: ObjectiveType.Output,
      } as ObjectiveState;
      return spread(state, { [id]: spread(base, objective) });
    });
  }

  create(objective: Omit<ObjectiveState, 'id'>): void {
    const id = '1';
    this.set({ [id]: spread(objective as ObjectiveState, { id }) });
  }

  remove(id: string): void {
    this.reduce((state) => {
      state = this._removeEntry(state, id);
      const objectives = Object.keys(state).map((i) => state[i]);
      return this.reduceObjectives(objectives);
    });
  }

  setOrder(objectives: ObjectiveState[]): void {
    this.set(this.reduceObjectives(objectives));
  }

  updateRecipeField<K extends keyof RecipeState>(
    step: Step,
    field: K,
    value: ObjectiveState[K],
    def?: ObjectiveState[K],
  ): void {
    if (step.recipeObjectiveId) {
      this.updateRecordField(step.recipeObjectiveId, field, value, def);
    } else if (step.recipeId) {
      this.recipesStore.updateRecordField(step.recipeId, field, value, def);
    }
  }

  adjustDisplayRate(displayRate: DisplayRate): void {
    const current = this.settingsStore.displayRate();
    const factor = displayRateInfo[displayRate].value.div(
      displayRateInfo[current].value,
    );
    this.reduce((state) => {
      const next = spread(state);
      const ids = Object.keys(next);
      for (const objective of ids
        .map((i) => state[i])
        .filter(
          (o) =>
            o.type !== ObjectiveType.Maximize &&
            (o.unit === ObjectiveUnit.Items || o.unit === ObjectiveUnit.Wagons),
        )) {
        const value = objective.value.mul(factor);
        next[objective.id] = spread(objective, { value });
      }

      return next;
    });

    this.settingsStore.apply({ displayRate });
  }

  private reduceObjectives(
    objectives: ObjectiveState[],
  ): Record<string, ObjectiveState> {
    return objectives.reduce((e: Record<string, ObjectiveState>, o, i) => {
      const id = (i + 1).toString();
      e[id] = spread(o, { id });
      return e;
    }, {});
  }
}
