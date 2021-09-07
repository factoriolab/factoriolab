import {
  Step,
  Dataset,
  DisplayRate,
  Entities,
  Rational,
  DisplayRateVal,
  RationalRecipe,
  RationalRecipeSettings,
} from '~/models';
import { ItemsState } from '~/store/items';
import { RecipesState } from '~/store/recipes';

export class RateUtility {
  static addStepsFor(
    itemId: string,
    rate: Rational,
    steps: Step[],
    itemSettings: ItemsState,
    data: Dataset,
    parentId: string = null
  ): void {
    let recipe: RationalRecipe;

    if (!itemSettings[itemId].ignore) {
      recipe = data.recipeR[data.itemRecipeIds[itemId]];

      if (recipe && !recipe.produces(itemId)) {
        recipe = null;
      }
    }

    // Find existing step for this item
    let step = steps.find((s) => s.itemId === itemId);

    if (step) {
      steps.push(steps.splice(steps.indexOf(step), 1)[0]);
    } else {
      // No existing step found, create a new one
      step = {
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
    step.items = step.items.add(rate);

    this.addParentValue(step, parentId, rate);

    if (recipe) {
      // Calculate number of outputs from recipe
      const out = recipe.out[itemId].sub(recipe.in?.[itemId] || Rational.zero);

      // Calculate factories
      step.factories = step.items.mul(recipe.time).div(out);

      this.adjustPowerPollution(step, recipe);

      // Recurse adding steps for ingredients
      if (recipe.in && step.items.nonzero()) {
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
    if (parentId) {
      if (!step.parents) {
        step.parents = {};
      }
      if (step.parents[parentId]) {
        step.parents[parentId] = step.parents[parentId].add(rate);
      } else {
        step.parents[parentId] = rate;
      }
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
    itemSettings: ItemsState,
    recipeSettings: RecipesState,
    beltSpeed: Entities<Rational>,
    data: Dataset
  ): Step[] {
    for (const step of steps) {
      let noItems = false;
      if (step.recipeId) {
        const factory =
          data.itemEntities[recipeSettings[step.recipeId].factory].factory;
        const recipe = data.recipeEntities[step.recipeId];
        // No belts/wagons on research rows or rocket part rows
        noItems = factory.research || (factory.silo && !recipe.part);
      }
      if (noItems) {
        step.belts = null;
        step.wagons = null;
      } else {
        const belt = itemSettings[step.itemId]?.belt;
        if (step.items && belt) {
          step.belts = step.items.div(beltSpeed[belt]);
        }
        const wagon = itemSettings[step.itemId]?.wagon;
        if (step.items && wagon) {
          const item = data.itemR[step.itemId];
          if (item.stack) {
            step.wagons = step.items.div(
              data.itemR[wagon].cargoWagon.size.mul(item.stack)
            );
          } else {
            step.wagons = step.items.div(data.itemR[wagon].fluidWagon.capacity);
          }
        }
      }
    }
    return steps;
  }

  static calculateOutputs(steps: Step[], data: Dataset): Step[] {
    for (const step of steps.filter((s) => s.recipeId)) {
      const recipe = data.recipeR[step.recipeId];
      step.outputs = {};
      for (const id of Object.keys(recipe.out)) {
        const val = recipe.out[id].mul(step.factories).div(recipe.time);
        const outStep = steps.find((s) => s.itemId === id);
        step.outputs[id] = val.div(outStep.items);
      }
    }
    return steps;
  }

  static calculateBeacons(
    steps: Step[],
    beaconReceivers: Rational,
    recipeSettings: Entities<RationalRecipeSettings>,
    data: Dataset
  ): Step[] {
    if (beaconReceivers && beaconReceivers.nonzero()) {
      for (const step of steps.filter(
        (s) =>
          s.factories?.nonzero() &&
          !data.recipeEntities[s.recipeId].part &&
          recipeSettings[s.recipeId].beaconCount?.nonzero()
      )) {
        const settings = recipeSettings[step.recipeId];
        if (settings.beaconTotal) {
          step.beacons = settings.beaconTotal;
        } else {
          step.beacons = step.factories
            .ceil()
            .mul(settings.beaconCount)
            .div(beaconReceivers);
        }

        const beacon = data.itemR[settings.beacon].beacon;
        step.power = step.power.add(step.beacons.mul(beacon.usage));
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
    // Assign unique ids
    for (const step of steps) {
      step.id = `${step.itemId || ''}.${step.recipeId || ''}`;
    }

    // Determine parents
    const parents: Entities = {};
    for (const step of steps) {
      if (step.parents && Object.keys(step.parents).length === 1) {
        const recipeId = Object.keys(step.parents)[0];
        const parent = steps.find((s) => s.recipeId === recipeId);
        if (step.id === parent.id) {
          parents[step.id] = '';
        } else {
          parents[step.id] = parent.id;
        }
      } else {
        parents[step.id] = '';
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
    const sorted = this.sortRecursive(groups, '', []);

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
