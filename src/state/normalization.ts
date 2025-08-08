import { Injectable } from '@angular/core';

import {
  SankeyLinkExtraProperties,
  SankeyNodeExtraProperties,
} from '~/d3-sankey/models';
import { sankey } from '~/d3-sankey/sankey';
import { EnergyType } from '~/models/data/energy-type';
import { Rational, rational } from '~/models/rational';
import { Step } from '~/models/step';
import { coalesce } from '~/utils/nullish';
import { spread } from '~/utils/object';
import { toRecord } from '~/utils/record';

import { ItemSettings } from './items/item-settings';
import { ObjectiveSettings } from './objectives/objective';
import { ObjectiveType } from './objectives/objective-type';
import { ObjectiveUnit } from './objectives/objective-unit';
import { RecipeSettings } from './recipes/recipe-settings';
import { AdjustedDataset } from './settings/dataset';
import { DisplayRateInfo } from './settings/display-rate';
import { Settings } from './settings/settings';

const ROOT_ID = '';

@Injectable({ providedIn: 'root' })
export class Normalization {
  normalizeRate(
    objective: ObjectiveSettings,
    items: Record<string, ItemSettings>,
    beltSpeed: Record<string, Rational>,
    displayRateInfo: DisplayRateInfo,
    data: AdjustedDataset,
  ): Rational {
    // Ignore unit entirely when maximizing, do not adjust if unit is Machines
    if (
      objective.unit === ObjectiveUnit.Machines ||
      objective.type === ObjectiveType.Maximize
    )
      return objective.value;

    const rate = objective.value;
    let factor = rational.one;
    switch (objective.unit) {
      case ObjectiveUnit.Items: {
        factor = displayRateInfo.value.reciprocal();
        break;
      }
      case ObjectiveUnit.Belts: {
        const itemSettings = items[objective.targetId];
        if (itemSettings.beltId)
          factor = beltSpeed[itemSettings.beltId].mul(
            coalesce(itemSettings.stack, rational.one),
          );
        break;
      }
      case ObjectiveUnit.Wagons: {
        const wagonId = items[objective.targetId].wagonId;
        if (wagonId) {
          const item = data.itemRecord[objective.targetId];
          const wagon = data.itemRecord[wagonId];
          if (item.stack && wagon.cargoWagon) {
            factor = item.stack
              .mul(wagon.cargoWagon.size)
              .div(displayRateInfo.value);
          } else if (wagon.fluidWagon) {
            factor = wagon.fluidWagon.capacity.div(displayRateInfo.value);
          }
        }
        break;
      }
    }

    // Adjust based on productivity for technology objectives
    const recipe =
      data.adjustedRecipe[data.itemRecipeIds[objective.targetId][0]];
    if (recipe?.flags.has('technology'))
      factor = factor.mul(recipe.effects.productivity);

    return rate.mul(factor);
  }

  normalizeSteps(
    steps: Step[],
    objectives: ObjectiveSettings[],
    items: Record<string, ItemSettings>,
    recipes: Record<string, RecipeSettings>,
    beltSpeed: Record<string, Rational>,
    dispRateInfo: DisplayRateInfo,
    settings: Settings,
    data: AdjustedDataset,
  ): Step[] {
    const _steps = this.copy(steps);

    for (const step of _steps) this.calculateParentsOutputs(step, _steps);

    const objectiveRecord = toRecord(objectives);

    for (const step of _steps) {
      this.calculateSettings(step, objectiveRecord, recipes);
      this.calculateBelts(step, items, beltSpeed, data);
      this.calculateBeacons(step, settings.beaconReceivers, data);
      this.calculateDisplayRate(step, dispRateInfo);
      this.calculateChecked(step, settings);
    }

    this.sortBySankey(_steps);
    return this.calculateHierarchy(_steps);
  }

  private calculateParentsOutputs(step: Step, steps: Step[]): void {
    if (step.recipe && step.machines?.nonzero()) {
      const recipe = step.recipe;
      const quantity = step.machines.div(recipe.time);
      for (const itemId of Object.keys(recipe.in)) {
        if (recipe.in[itemId].nonzero()) {
          const amount = recipe.in[itemId].mul(quantity);
          const itemStep = steps.find((s) => s.itemId === itemId);
          if (itemStep != null)
            this.addEntityValue(
              itemStep,
              'parents',
              step.id,
              amount.simplify(),
            );
        }
      }
      for (const itemId of Object.keys(recipe.out)) {
        if (recipe.out[itemId].nonzero()) {
          const amount = recipe.out[itemId].mul(quantity);
          const itemStep = steps.find((s) => s.itemId === itemId);
          if (itemStep?.items?.nonzero()) {
            this.addEntityValue(
              step,
              'outputs',
              itemId,
              amount.div(itemStep.items).simplify(),
            );
          }
        }
      }
    }
  }

  private calculateSettings(
    step: Step,
    objectiveRecord: Record<string, ObjectiveSettings>,
    recipes: Record<string, RecipeSettings>,
  ): void {
    if (step.recipeId) {
      if (step.recipeObjectiveId)
        step.recipeSettings = objectiveRecord[step.recipeObjectiveId];
      else step.recipeSettings = recipes[step.recipeId];
    }
  }

  private calculateBelts(
    step: Step,
    items: Record<string, ItemSettings>,
    beltSpeed: Record<string, Rational>,
    data: AdjustedDataset,
  ): void {
    let noItems = false;
    if (step.recipeId != null && step.recipeSettings != null) {
      const machineId = step.recipeSettings.machineId;
      if (machineId != null) {
        const machine = data.machineRecord[machineId];
        const recipe = data.recipeRecord[step.recipeId];
        // No belts/wagons on research rows or rocket part rows
        noItems = !!(
          recipe.flags.has('technology') ||
          (machine.silo && !recipe.part)
        );
      }
    }
    if (noItems) {
      delete step.belts;
      delete step.wagons;
    } else if (step.itemId != null) {
      const itemSettings = items[step.itemId];
      const belt = itemSettings.beltId;
      if (step.items != null && belt != null) {
        step.belts = step.items.div(beltSpeed[belt]);

        if (itemSettings.stack?.nonzero())
          step.belts = step.belts.div(itemSettings.stack);
      }

      const wagon = itemSettings.wagonId;
      if (step.items != null && wagon != null) {
        const item = data.itemRecord[step.itemId];
        if (item.stack) {
          step.wagons = step.items.div(
            data.cargoWagonRecord[wagon].size.mul(item.stack),
          );
        } else
          step.wagons = step.items.div(data.fluidWagonRecord[wagon].capacity);
      }
    }
  }

  private calculateBeacons(
    step: Step,
    beaconReceivers: Rational | undefined,
    data: AdjustedDataset,
  ): void {
    if (
      !beaconReceivers?.nonzero() ||
      step.recipeId == null ||
      !step.machines?.nonzero() ||
      data.recipeRecord[step.recipeId].part ||
      step.recipeSettings == null
    )
      return;

    const machines = step.machines;

    const settings = step.recipeSettings;
    if (settings.beacons == null) return;

    step.recipeSettings = spread(step.recipeSettings, {
      beacons: settings.beacons.map((b) => {
        let total = b.total;
        if (b.id != null) {
          if (b.count != null && total == null) {
            total = machines.ceil().mul(b.count).div(beaconReceivers);
            if (total.lt(b.count)) {
              // Can't be less than beacon count
              total = b.count;
            }
          }

          const beacon = data.beaconRecord[b.id];
          if (
            beacon.type === EnergyType.Electric &&
            beacon.usage != null &&
            total != null
          ) {
            step.power = (step.power ?? rational.zero).add(
              total.mul(beacon.usage),
            );
          }
        }

        return { ...b, total };
      }),
    });
  }

  private calculateDisplayRate(
    step: Step,
    dispRateInfo: DisplayRateInfo,
  ): void {
    if (step.items) {
      if (step.parents && step.items.nonzero()) {
        for (const key of Object.keys(step.parents))
          step.parents[key] = step.parents[key].div(step.items);
      }

      step.items = step.items.mul(dispRateInfo.value);
    }

    if (step.surplus) step.surplus = step.surplus.mul(dispRateInfo.value);
    if (step.wagons) step.wagons = step.wagons.mul(dispRateInfo.value);
    if (step.pollution) step.pollution = step.pollution.mul(dispRateInfo.value);
    if (step.output) step.output = step.output.mul(dispRateInfo.value);
  }

  private calculateChecked(step: Step, settings: Settings): void {
    // Priority: 1) Item settings, 2) Recipe objective settings, 3) Recipe settings
    if (step.itemId != null)
      step.checked = settings.checkedItemIds.has(step.itemId);
    else if (step.recipeObjectiveId != null)
      step.checked = settings.checkedObjectiveIds.has(step.recipeObjectiveId);
    else if (step.recipeId != null)
      step.checked = settings.checkedRecipeIds.has(step.recipeId);
  }

  /** Generates a simple sankey diagram and sorts steps by their node depth */
  private sortBySankey(steps: Step[]): void {
    interface SimpleNode extends SankeyNodeExtraProperties {
      id: string;
      stepId: string;
    }
    interface SimpleLink extends SankeyLinkExtraProperties {
      source: string;
      target: string;
      value: number;
    }

    const stepMap = steps.reduce((e: Record<string, Step>, s) => {
      e[s.id] = s;
      return e;
    }, {});
    const nodes: SimpleNode[] = [];
    const links: SimpleLink[] = [];

    for (const step of steps) {
      if (step.itemId) {
        const id = `i|${step.itemId}`;
        nodes.push({ id, stepId: step.id });
        if (step.parents) {
          for (const stepId of Object.keys(step.parents)) {
            if (stepId === '') continue;
            const recipeId = stepMap[stepId].recipeId;
            if (recipeId == null) continue;
            links.push({
              source: id,
              target: `r|${recipeId}`,
              value: 1,
            });
          }
        }
      }

      if (step.recipeId) {
        const id = `r|${step.recipeId}`;
        nodes.push({ id, stepId: step.id });
        if (step.outputs) {
          for (const itemId of Object.keys(step.outputs)) {
            links.push({ source: id, target: `i|${itemId}`, value: 1 });
          }
        }
      }
    }

    if (!nodes.length || !links.length) return;

    const result = sankey<SimpleNode, SimpleLink>().nodeId((d) => d.id)({
      nodes,
      links,
    });
    for (const step of steps) {
      step.depth = result.nodes.find((n) => n.stepId === step.id)?.depth;
    }

    // Rank output steps highest, then rank by sankey depth
    function stepRank(step: Step): number {
      if (step.output) return 100000;
      return coalesce(step.depth, 0);
    }

    steps.sort((a, b) => stepRank(b) - stepRank(a));
  }

  private calculateHierarchy(steps: Step[]): Step[] {
    // Determine parents
    const parents: Record<string, string> = {};
    for (const step of steps) {
      if (
        step.parents == null ||
        step.parents[ROOT_ID] ||
        Object.keys(step.parents).length > 1
      ) {
        parents[step.id] = ROOT_ID;
      } else {
        const stepId = Object.keys(step.parents)[0];
        const parent = steps.find((s) => s.id === stepId);
        if (parent) {
          if (step.id === parent.id) {
            parents[step.id] = ROOT_ID;
          } else {
            parents[step.id] = parent.id;
          }
        }
      }
    }

    // Set up hierarchy groups
    const groups: Record<string, Step[]> = {};
    for (const step of steps) {
      const parentId = parents[step.id];
      if (!groups[parentId]) {
        groups[parentId] = [];
      }
      groups[parentId].push(step);
    }

    // Perform recursive sort
    const sorted = new Set<Step>();
    this.sortRecursive(groups, ROOT_ID, sorted);

    // Add back any remaining steps according to their separate hierarchy
    while (sorted.size < steps.length) {
      const step = steps.find((s) => !sorted.has(s));
      // istanbul ignore next: Should be impossible inside this while statement
      if (step == null) break;
      sorted.add(step);
      this.sortRecursive(groups, step.id, sorted);
    }

    return Array.from(sorted);
  }

  private sortRecursive(
    groups: Record<string, Step[]>,
    id: string,
    result: Set<Step>,
  ): void {
    if (!groups[id]) return;

    const group = groups[id];
    delete groups[id]; // Remove this group so we don't check it again
    for (const s of group) {
      result.add(s);
      this.sortRecursive(groups, s.id, result);
    }
  }

  private addEntityValue(
    step: Step,
    key: 'parents' | 'outputs',
    parentId: string,
    value: Rational,
  ): void {
    const obj = step[key];
    if (!obj) step[key] = { [parentId]: value };
    else if (obj[parentId]) obj[parentId] = obj[parentId].add(value);
    else obj[parentId] = value;
  }

  private copy(steps: Step[]): Step[] {
    return steps.map((s) =>
      s.parents ? spread(s, { parents: spread(s.parents) }) : spread(s),
    );
  }
}
