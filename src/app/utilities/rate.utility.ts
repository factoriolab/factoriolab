import {
  Dataset,
  DisplayRate,
  DisplayRateVal,
  Entities,
  ItemSettings,
  Rational,
  RationalRecipe,
  RationalRecipeSettings,
  RecipeSettings,
  Step,
} from '~/models';
import { ItemsState } from '~/store/items';

const ROOT_ID = '';

export class RateUtility {
  static addStepsFor(
    itemId: string,
    rate: Rational,
    steps: Step[],
    itemSettings: ItemsState,
    data: Dataset,
    parentId?: string
  ): void {
    let recipe: RationalRecipe | null | undefined;

    if (!itemSettings[itemId].ignore) {
      recipe = data.recipeR[data.itemRecipeId[itemId]];

      if (
        recipe &&
        (Object.keys(recipe.out).length > 1 || !recipe.produces(itemId))
      ) {
        // Ignore dedicated recipe if it has multiple outputs
        // or does not produce a net-output of the item
        recipe = null;
      }
    }

    // Find existing step for this item
    let step = steps.find((s) => s.itemId === itemId);

    if (step != null) {
      steps.push(steps.splice(steps.indexOf(step), 1)[0]);
    } else {
      // No existing step found, create a new one
      step = {
        id: steps.length.toString(),
        itemId,
        items: Rational.zero,
      };

      if (recipe) {
        step.recipeId = recipe.id;
      }

      steps.push(step);
    }

    // Adjust for consumption instead of production if desired
    if (recipe?.adjustProd) {
      rate = rate.mul(recipe.productivity);
    }

    // Add items to the step
    step.items = (step.items ?? Rational.zero).add(rate);

    if (parentId != null) {
      this.addParentValue(step, parentId, rate);
    }

    if (recipe) {
      // Calculate number of outputs from recipe
      const out = recipe.out[itemId].sub(recipe.in[itemId] ?? Rational.zero);

      // Calculate factories
      step.factories = step.items.mul(recipe.time).div(out);

      this.adjustPowerPollution(step, recipe);

      // Recurse adding steps for ingredients
      if (step.items.nonzero()) {
        for (const ingredient of Object.keys(recipe.in)) {
          const ingredientRate = rate.mul(recipe.in[ingredient]).div(out);
          if (ingredient === itemId) {
            this.addParentValue(step, recipe.id, ingredientRate);
          } else {
            RateUtility.addStepsFor(
              ingredient,
              ingredientRate,
              steps,
              itemSettings,
              data,
              recipe.id
            );
          }
        }
      }
    }
  }

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

  static calculateBelts(
    steps: Step[],
    itemSettings: Entities<ItemSettings>,
    recipeSettings: Entities<RecipeSettings>,
    beltSpeed: Entities<Rational>,
    data: Dataset
  ): Step[] {
    for (const step of steps) {
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
            step.wagons = step.items.div(
              data.fluidWagonEntities[wagon].capacity
            );
          }
        }
      }
    }
    return steps;
  }

  static calculateOutputs(steps: Step[], data: Dataset): Step[] {
    for (const step of steps) {
      if (step.recipeId && step.factories?.nonzero()) {
        const recipe = data.recipeR[step.recipeId];
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
    return steps;
  }

  static calculateBeacons(
    steps: Step[],
    beaconReceivers: Rational | null,
    recipeSettings: Entities<RationalRecipeSettings>,
    data: Dataset
  ): Step[] {
    if (beaconReceivers && beaconReceivers.nonzero()) {
      for (const step of steps) {
        if (
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
    }
    return steps;
  }

  static displayRate(steps: Step[], displayRate: DisplayRate): Step[] {
    const displayRateVal = DisplayRateVal[displayRate];
    for (const step of steps) {
      if (step.items) {
        if (step.parents) {
          for (const key of Object.keys(step.parents)) {
            step.parents[key] = step.parents[key].div(step.items);
          }
        }
        step.items = step.items.mul(displayRateVal);
      }
      if (step.surplus) {
        step.surplus = step.surplus.mul(displayRateVal);
      }
      if (step.wagons) {
        step.wagons = step.wagons.mul(displayRateVal);
      }
      if (step.pollution) {
        step.pollution = step.pollution.mul(displayRateVal);
      }
    }
    return steps;
  }

  static sortHierarchy(steps: Step[]): Step[] {
    // Determine parents
    const parents: Record<string, string> = {};
    for (const step of steps) {
      if (step.parents && Object.keys(step.parents).length === 1) {
        const recipeId = Object.keys(step.parents)[0];
        const parent = steps.find((s) => s.recipeId === recipeId);
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
