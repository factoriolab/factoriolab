import { computed, effect, inject, Injectable, Injector } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { filter, pairwise, switchMap } from 'rxjs';

import { Solver } from '~/glpk/solver';
import { Option } from '~/models/option';
import { Rational, rational } from '~/models/rational';
import { Step } from '~/models/step';
import { StepDetail } from '~/models/step-detail';
import { StepDetailTab } from '~/models/step-detail-tab';
import { StepOutput } from '~/models/step-output';
import { fnPropsNotNullish } from '~/utils/nullish';
import { spread } from '~/utils/object';
import { addValueByIds, toRecord } from '~/utils/record';

import { Adjustment } from '../adjustment';
import { ItemsStore } from '../items/items-store';
import { MachinesStore } from '../machines/machines-store';
import { Normalization } from '../normalization';
import { PowerUnit } from '../preferences/power-unit';
import { PreferencesStore } from '../preferences/preferences-store';
import { RecipesStore } from '../recipes/recipes-store';
import { displayRateInfo } from '../settings/display-rate';
import { SettingsStore } from '../settings/settings-store';
import { RecordStore } from '../store';
import { isRecipeObjective, ObjectiveBase, ObjectiveState } from './objective';
import { ObjectiveType } from './objective-type';
import { ObjectiveUnit } from './objective-unit';

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

    const belts: Record<string, Rational> = {};
    const wagons: Record<string, Rational> = {};
    const machines: Record<string, Rational> = {};
    const modules: Record<string, Rational> = {};
    const beacons: Record<string, Rational> = {};
    const beaconModules: Record<string, Rational> = {};
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
          if (!recipe.part && !recipe.flags.has('hideProducer')) {
            const settings = step.recipeSettings;
            let machine = settings.machineId;
            if (machine && data.machineRecord[machine].totalRecipe) {
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
                  if (!m.id || m.count == null) return;
                  addValueByIds(modules, [m.id], value.mul(m.count));
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
                if (!m.id || m.count == null) return;
                addValueByIds(beaconModules, [m.id], value.mul(m.count));
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
    const settings = this.settingsStore.settings();
    const data = this.recipesStore.adjustedDataset();

    return steps.reduce((e: Record<string, StepDetail>, s) => {
      const tabs: StepDetailTab[] = [];
      const outputs: StepOutput[] = [];
      let recipeIds: string[] = [];
      let recipesEnabled: string[] = [];
      let recipeOptions: Option[] = [];
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
        if (recipeIds.length) tabs.push(StepDetailTab.Recipes);
        recipesEnabled = recipeIds.filter(
          (r) => !settings.excludedRecipeIds.has(r),
        );
        recipeOptions = recipeIds.map(
          (r): Option => ({
            value: r,
            label: data.recipeRecord[r].name,
          }),
        );
      } else if (s.recipeId != null) {
        recipeIds = [s.recipeId];
        recipesEnabled = [s.recipeId];
        recipeOptions = [
          { label: data.recipeRecord[s.recipeId].name, value: s.recipeId },
        ];
      }

      e[s.id] = {
        tabs: tabs.map((t) => {
          const id = `step_${s.id}_${t}_tab`;
          return {
            id,
            label: t,
            command:
              // istanbul ignore next: Simple assignment function; testing is unnecessary
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
        recipesEnabled,
        recipeOptions,
      };

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

  constructor() {
    super();

    // TODO: Is it really necessary to specify the injector here?
    const injector = inject(Injector);
    this.settingsStore.load$
      .pipe(
        switchMap(() =>
          toObservable(this.settingsStore.displayRate, { injector }).pipe(
            pairwise(),
            filter(([before, after]) => before !== after),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(([before, after]) => {
        const factor = displayRateInfo[after].value.div(
          displayRateInfo[before].value,
        );
        this.adjustDisplayRate(factor);
      });

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

  adjustDisplayRate(factor: Rational): void {
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
