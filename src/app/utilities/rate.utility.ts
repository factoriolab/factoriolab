import {
  Dataset,
  DisplayRateInfo,
  Entities,
  Game,
  ItemSettings,
  Rational,
  RationalProducer,
  RationalRecipe,
  RationalRecipeSettings,
  Step,
  toEntities,
} from '~/models';

const ROOT_ID = '';

export class RateUtility {
  static addEntityValue(
    step: Step,
    key: 'parents' | 'outputs',
    parentId: string,
    rate: Rational
  ): void {
    const obj = step[key];
    if (!obj) {
      step[key] = { [parentId]: rate };
    } else if (obj[parentId]) {
      obj[parentId] = obj[parentId].add(rate);
    } else {
      obj[parentId] = rate;
    }
  }

  static adjustPowerPollution(
    step: Step,
    recipe: RationalRecipe,
    game: Game
  ): void {
    if (step.factories?.nonzero() && !recipe.part) {
      if (recipe.drain?.nonzero() || recipe.consumption?.nonzero()) {
        // Reset power
        step.power = Rational.zero;

        // Calculate drain
        if (recipe.drain?.nonzero()) {
          let factories = step.factories.ceil();
          if (game === Game.DysonSphereProgram) {
            // In DSP drain is not cumulative; only add for inactive machines
            factories = factories.sub(step.factories);
          }

          step.power = step.power.add(factories.mul(recipe.drain));
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
      this.calculateParentsOutputs(step, _steps);
    }

    const producerEntities = toEntities(producers);

    for (const step of _steps) {
      this.calculateSettings(step, producerEntities, recipeSettings);
      this.calculateBelts(step, itemSettings, beltSpeed, data);
      this.calculateBeacons(step, beaconReceivers, data);
      this.calculateDisplayRate(step, dispRateInfo);
      this.calculateChecked(
        step,
        itemSettings,
        recipeSettings,
        producerEntities
      );
    }

    return this.calculateHierarchy(_steps);
  }

  static calculateParentsOutputs(step: Step, steps: Step[]): void {
    if (step.recipe && step.factories?.nonzero()) {
      const recipe = step.recipe;
      const quantity = step.factories.div(recipe.time);
      for (const itemId of Object.keys(recipe.in)) {
        if (recipe.in[itemId].nonzero()) {
          const rate = recipe.in[itemId].mul(quantity);
          const itemStep = steps.find((s) => s.itemId === itemId);
          if (itemStep != null) {
            this.addEntityValue(itemStep, 'parents', step.id, rate);
          }
        }
      }
      for (const itemId of Object.keys(recipe.out)) {
        if (recipe.out[itemId].nonzero()) {
          const rate = recipe.out[itemId].mul(quantity);
          const itemStep = steps.find((s) => s.itemId === itemId);
          if (itemStep?.items?.nonzero()) {
            this.addEntityValue(
              step,
              'outputs',
              itemId,
              rate.div(itemStep.items)
            );
          }
        }
      }
    }
  }

  static calculateSettings(
    step: Step,
    producerEntities: Entities<RationalProducer>,
    recipeSettings: Entities<RationalRecipeSettings>
  ): void {
    if (step.recipeId) {
      if (step.producerId) {
        step.recipeSettings = producerEntities[step.producerId];
      } else {
        step.recipeSettings = recipeSettings[step.recipeId];
      }
    }
  }

  static calculateBelts(
    step: Step,
    itemSettings: Entities<ItemSettings>,
    beltSpeed: Entities<Rational>,
    data: Dataset
  ): void {
    let noItems = false;
    if (step.recipeId != null && step.recipeSettings != null) {
      const factoryId = step.recipeSettings.factoryId;
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

  static calculateBeacons(
    step: Step,
    beaconReceivers: Rational | null,
    data: Dataset
  ): void {
    if (
      !beaconReceivers?.nonzero() ||
      step.recipeId == null ||
      !step.factories?.nonzero() ||
      data.recipeEntities[step.recipeId].part ||
      step.recipeSettings == null
    ) {
      return;
    }

    const factories = step.factories;

    const settings = step.recipeSettings;
    if (settings.beacons == null) return;

    step.recipeSettings = {
      ...step.recipeSettings,
      ...{
        beacons: settings.beacons.map((b) => {
          let total = b.total;
          if (b.id != null) {
            if (b.count != null && total == null) {
              total = factories.ceil().mul(b.count).div(beaconReceivers);
              if (total.lt(b.count)) {
                // Can't be less than beacon count
                total = b.count;
              }
            }

            const beacon = data.beaconEntities[b.id];
            if (beacon.usage?.nonzero() && total != null) {
              step.power = (step.power ?? Rational.zero).add(
                total.mul(beacon.usage)
              );
            }
          }

          return { ...b, total };
        }),
      },
    };
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

  static calculateChecked(
    step: Step,
    itemSettings: Entities<ItemSettings>,
    recipeSettings: Entities<RationalRecipeSettings>,
    producerEntities: Entities<RationalProducer>
  ): void {
    // Priority: 1) Item state, 2) Producer state, 3) Recipe state
    if (step.itemId != null) {
      step.checked = itemSettings[step.itemId].checked;
    } else if (step.producerId != null) {
      step.checked = producerEntities[step.producerId].checked;
    } else if (step.recipeId != null) {
      step.checked = recipeSettings[step.recipeId].checked;
    }
  }

  static calculateHierarchy(steps: Step[]): Step[] {
    // Determine parents
    const parents: Entities<string> = {};
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
