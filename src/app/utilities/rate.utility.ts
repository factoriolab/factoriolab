import {
  Step,
  Dataset,
  DisplayRate,
  Entities,
  Node,
  Rational,
  DisplayRateVal,
  ROCKET_PART_ID,
  SPACE_SCIENCE_ID,
} from '~/models';
import { ItemsState } from '~/store/items';
import { RecipesState } from '~/store/recipes';

export class RateUtility {
  static LAUNCH_TIME = new Rational(BigInt(2420), BigInt(60));

  static addStepsFor(
    itemId: string,
    rate: Rational,
    steps: Step[],
    itemSettings: ItemsState,
    recipeSettings: RecipesState,
    fuel: string,
    data: Dataset,
    depth: number = 0,
    parentId: string = null
  ) {
    const recipe = data.recipeR[data.itemRecipeIds[itemId]];

    // Find existing step for this item
    let step = steps.find((s) => s.itemId === itemId);

    if (step) {
      step.depth = Math.max(step.depth, depth);
    } else {
      // No existing step found, create a new one
      step = {
        depth,
        itemId,
        recipeId: recipe ? recipe.id : null,
        items: Rational.zero,
        factories: Rational.zero,
      };

      steps.push(step);
    }

    // Adjust for consumption instead of production if desired
    if (recipe?.adjustProd) {
      rate = rate.mul(recipe.adjustProd);
    }

    // Add items to the step
    step.items = step.items.add(rate);

    this.addParentValue(step, parentId, rate);

    if (recipe) {
      // Calculate number of outputs from recipe
      const out = recipe.out[itemId];

      // Calculate factories
      if (itemId === SPACE_SCIENCE_ID) {
        // Factories are for rocket parts, space science packs are a side effect
        step.factories = null;
      } else {
        step.factories = step.items.mul(recipe.time).div(out);
        // Add # of factories to actually launch rockets
        if (itemId === ROCKET_PART_ID) {
          step.factories = step.factories.add(
            step.items.div(Rational.hundred).mul(this.LAUNCH_TIME)
          );
        }
      }

      // Recurse adding steps for ingredients
      if (
        recipe.in &&
        step.items.nonzero() &&
        !itemSettings[step.itemId].ignore
      ) {
        const inDepth = depth + 1;
        for (const ingredient of Object.keys(recipe.in)) {
          const ingredientRate = rate.mul(recipe.in[ingredient]).div(out);
          RateUtility.addStepsFor(
            ingredient,
            ingredientRate,
            steps,
            itemSettings,
            recipeSettings,
            fuel,
            data,
            inDepth,
            itemId
          );
        }
      }
    }
  }

  static addParentValue(step: Step, parentId: string, rate: Rational) {
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

  static addNodesFor(
    parent: Node,
    itemId: string,
    rate: Rational,
    itemSettings: ItemsState,
    recipeSettings: RecipesState,
    fuel: string,
    data: Dataset
  ) {
    const recipe = data.recipeR[data.itemRecipeIds[itemId]];

    const node: Node = {
      id: `${parent.id}:${itemId}`,
      name: data.itemEntities[itemId].name,
      itemId,
      recipeId: itemId as any,
      items: rate,
      factories: Rational.zero,
    };

    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(node);

    if (recipe) {
      // Calculate number of outputs from recipe
      const out = recipe.out[itemId];

      // Calculate factories
      if (itemId === SPACE_SCIENCE_ID) {
        // Factories are for rocket parts, space science packs are a side effect
        node.factories = null;
      } else {
        node.factories = node.items.mul(recipe.time).div(out);
        // Add # of factories to actually launch rockets
        if (itemId === ROCKET_PART_ID) {
          node.factories = node.factories.add(
            node.items.div(Rational.hundred).mul(this.LAUNCH_TIME)
          );
        }
      }

      // Recurse adding nodes for ingredients
      if (
        recipe.in &&
        node.items.nonzero() &&
        !itemSettings[node.itemId].ignore
      ) {
        for (const ingredient of Object.keys(recipe.in)) {
          RateUtility.addNodesFor(
            node,
            ingredient,
            rate.mul(recipe.in[ingredient]).div(out),
            itemSettings,
            recipeSettings,
            fuel,
            data
          );
        }
      }
    }
  }

  static calculateBelts(
    steps: Step[],
    itemSettings: ItemsState,
    beltSpeed: Entities<Rational>
  ) {
    steps = steps.map((s) => ({ ...s }));
    for (const step of steps) {
      const belt = itemSettings[step.itemId]?.belt;
      if (step.items && belt) {
        step.belts = step.items.div(beltSpeed[belt]);
      }
    }
    return steps;
  }

  static calculateNodeBelts(
    node: Node,
    itemSettings: ItemsState,
    beltSpeed: Entities<Rational>
  ) {
    node = { ...node };
    node.children = node.children.map((n) => ({ ...n }));
    const belt = itemSettings[node.itemId]?.belt;
    if (node.items && belt) {
      node.belts = node.items.div(beltSpeed[belt]);
    }
    if (node.children) {
      for (const child of node.children) {
        this.calculateNodeBelts(child, itemSettings, beltSpeed);
      }
    }
    return node;
  }

  static displayRate(steps: Step[], displayRate: DisplayRate) {
    steps = steps.map((s) => ({ ...s }));
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
    }
    return steps;
  }

  static nodeDisplayRate(node: Node, displayRate: DisplayRate) {
    const displayRateVal = DisplayRateVal[displayRate];
    if (node.items) {
      node.items = node.items.mul(displayRateVal);
    }
    if (node.surplus) {
      node.surplus = node.surplus.mul(displayRateVal);
    }
    if (node.children) {
      for (const child of node.children) {
        this.nodeDisplayRate(child, displayRate);
      }
    }
    return node;
  }
}
