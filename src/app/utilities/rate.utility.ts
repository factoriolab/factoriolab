import {
  Dataset,
  DisplayRateInfo,
  Entities,
  ItemSettings,
  Rational,
  RationalProducer,
  RationalRecipe,
  RationalRecipeSettings,
  Step,
} from '~/models';

const ROOT_ID = '';

export class RateUtility {
  static addParentValue(step: Step, parentId: string, rate: Rational): void {
    if (!step.parents) {
      step.parents = {};
    }
    if (step.parents[parentId]) {
      step.parents[parentId] = step.parents[parentId].add(rate);
    } else {
      step.parents[parentId] = rate;
    }
  }

  static adjustPowerPollution(step: Step, recipe: RationalRecipe): void {
    if (step.factories?.nonzero() && !recipe.part) {
      if (recipe.drain?.nonzero() || recipe.consumption?.nonzero()) {
        // Reset power
        step.power = Rational.zero;

        // Calculate drain
        if (recipe.drain?.nonzero()) {
          step.power = step.power.add(step.factories.ceil().mul(recipe.drain));
        }
        // Calculate consumption
        if (recipe.consumption?.nonzero()) {
          step.power = step.power.add(step.factories.mul(recipe.consumption));
        }
      }

      // Calculate pollution
      if (recipe.pollution?.nonzero()) {
        step.pollution = step.factories.mul(recipe.pollution);
      }
    }
  }

  static normalizeSteps(
    steps: Step[],
    producers: RationalProducer[],
    itemSettings: Entities<ItemSettings>,
    recipeSettings: Entities<RationalRecipeSettings>,
    beaconReceivers: Rational | null,
    beltSpeed: Entities<Rational>,
    dispRateInfo: DisplayRateInfo,
    data: Dataset
  ): Step[] {
    const _steps = this.copy(steps);

    for (const step of _steps) {
      this.calculateParents(step, _steps);
      this.calculateSettings(step, producers, recipeSettings);
      this.calculateBelts(step, itemSettings, recipeSettings, beltSpeed, data);
      this.calculateOutputs(step, _steps, data);
      this.calculateBeacons(step, beaconReceivers, recipeSettings, data);
      this.calculateDisplayRate(step, dispRateInfo);
    }
    return this.calculateHierarchy(_steps);
  }

  static calculateParents(step: Step, steps: Step[]): void {
    if (step.recipe && step.factories) {
      const quantity = step.factories.div(step.recipe.time);
      for (const itemId of Object.keys(step.recipe.in)) {
        const rate = step.recipe.in[itemId];
        const itemStep = steps.find((s) => s.itemId === itemId);
        if (quantity.nonzero() && rate.nonzero() && itemStep != null) {
          this.addParentValue(itemStep, step.id, rate.mul(quantity));
        }
      }
    }
  }

  static calculateSettings(
    step: Step,
    producers: RationalProducer[],
    recipeSettings: Entities<RationalRecipeSettings>
  ): void {
    if (step.recipeId) {
      if (step.producerId) {
        step.recipeSettings = producers.find((p) => p.id === step.producerId);
      } else {
        step.recipeSettings = recipeSettings[step.recipeId];
      }
    }
  }

  static calculateBelts(
    step: Step,
    itemSettings: Entities<ItemSettings>,
    recipeSettings: Entities<RationalRecipeSettings>,
    beltSpeed: Entities<Rational>,
    data: Dataset
  ): void {
    let noItems = false;
    if (step.recipeId != null) {
      const factoryId = recipeSettings[step.recipeId].factoryId;
      if (factoryId != null) {
        const factory = data.factoryEntities[factoryId];
        const recipe = data.recipeEntities[step.recipeId];
        // No belts/wagons on research rows or rocket part rows
        noItems = !!(factory.research || (factory.silo && !recipe.part));
      }
    }
    if (noItems) {
      delete step.belts;
      delete step.wagons;
    } else if (step.itemId != null) {
      const belt = itemSettings[step.itemId].beltId;
      if (step.items != null && belt != null) {
        step.belts = step.items.div(beltSpeed[belt]);
      }
      const wagon = itemSettings[step.itemId].wagonId;
      if (step.items != null && wagon != null) {
        const item = data.itemEntities[step.itemId];
        if (item.stack) {
          step.wagons = step.items.div(
            data.cargoWagonEntities[wagon].size.mul(item.stack)
          );
        } else {
          step.wagons = step.items.div(data.fluidWagonEntities[wagon].capacity);
        }
      }
    }
  }

  static calculateOutputs(step: Step, steps: Step[], data: Dataset): void {
    if (step.recipe && step.factories?.nonzero()) {
      const recipe = step.recipe;
      const outputs: Entities<Rational> = {};
      for (const id of Object.keys(recipe.out)) {
        if (recipe.out[id].nonzero()) {
          const val = recipe.out[id].mul(step.factories).div(recipe.time);
          const outStep = steps.find((s) => s.itemId === id);
          if (outStep?.items?.nonzero()) {
            outputs[id] = val.div(outStep.items);
          }
        }
      }
      if (Object.keys(outputs).length > 0) {
        step.outputs = outputs;
      }
    }
  }

  static calculateBeacons(
    step: Step,
    beaconReceivers: Rational | null,
    recipeSettings: Entities<RationalRecipeSettings>,
    data: Dataset
  ): void {
    if (
      beaconReceivers?.nonzero() &&
      step.recipeId &&
      step.factories?.nonzero() &&
      !data.recipeEntities[step.recipeId].part &&
      recipeSettings[step.recipeId].beaconCount?.nonzero()
    ) {
      const settings = recipeSettings[step.recipeId];
      if (settings.beaconId != null) {
        if (settings.beaconTotal != null) {
          step.beacons = settings.beaconTotal;
        } else if (settings.beaconCount != null) {
          step.beacons = step.factories
            .ceil()
            .mul(settings.beaconCount)
            .div(beaconReceivers);
          if (step.beacons.lt(settings.beaconCount)) {
            // Can't be less than beacon count
            step.beacons = settings.beaconCount;
          }
        }

        const beacon = data.beaconEntities[settings.beaconId];
        if (beacon.usage?.nonzero() && step.beacons != null) {
          step.power = (step.power ?? Rational.zero).add(
            step.beacons.mul(beacon.usage)
          );
        }
      }
    }
  }

  static calculateDisplayRate(step: Step, dispRateInfo: DisplayRateInfo): void {
    if (step.items) {
      if (step.parents) {
        for (const key of Object.keys(step.parents)) {
          step.parents[key] = step.parents[key].div(step.items);
        }
      }
      step.items = step.items.mul(dispRateInfo.value);
    }
    if (step.surplus) {
      step.surplus = step.surplus.mul(dispRateInfo.value);
    }
    if (step.wagons) {
      step.wagons = step.wagons.mul(dispRateInfo.value);
    }
    if (step.pollution) {
      step.pollution = step.pollution.mul(dispRateInfo.value);
    }
    if (step.output) {
      step.output = step.output.mul(dispRateInfo.value);
    }
  }

  static calculateHierarchy(steps: Step[]): Step[] {
    // Determine parents
    const parents: Record<string, string> = {};
    for (const step of steps) {
      if (step.parents && Object.keys(step.parents).length === 1) {
        const stepId = Object.keys(step.parents)[0];
        const parent = steps.find((s) => s.id === stepId);
        if (parent) {
          if (step.id === parent.id) {
            parents[step.id] = ROOT_ID;
          } else {
            parents[step.id] = parent.id;
          }
        }
      } else {
        parents[step.id] = ROOT_ID;
      }
    }

    // Set up hierarchy groups
    const groups: Entities<Step[]> = {};
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      const p = parents[s.id];
      if (!groups[p]) {
        groups[p] = [];
      }
      groups[p].push(s);
    }

    // Perform recursive sort
    const sorted = this.sortRecursive(groups, ROOT_ID, []);

    // Add back any steps left out (potentially circular loops)
    sorted.push(...steps.filter((s) => sorted.indexOf(s) === -1));

    return sorted;
  }

  static sortRecursive(
    groups: Entities<Step[]>,
    id: string,
    result: Step[]
  ): Step[] {
    if (!groups[id]) {
      return [];
    }
    const group = groups[id];
    for (let i = 0; i < group.length; i++) {
      const s = group[i];
      result.push(s);
      this.sortRecursive(groups, s.id, result);
    }

    return result;
  }

  static copy(steps: Step[]): Step[] {
    return steps.map((s) =>
      s.parents ? { ...s, ...{ parents: { ...s.parents } } } : { ...s }
    );
  }
}
