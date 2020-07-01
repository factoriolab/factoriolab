import {
  Step,
  DisplayRate,
  Entities,
  ItemId,
  RecipeId,
  CategoryId,
  Node,
  Rational,
  DisplayRateVal,
} from '~/models';
import { RationalDataset } from '~/store/dataset';
import { ItemsState } from '~/store/items';
import { RecipesState } from '~/store/recipes';

export class RateUtility {
  static LAUNCH_TIME = new Rational(BigInt(2420), BigInt(60));

  static addStepsFor(
    parentId: ItemId,
    itemId: ItemId,
    rate: Rational,
    steps: Step[],
    itemSettings: ItemsState,
    recipeSettings: RecipesState,
    fuel: ItemId,
    data: RationalDataset
  ) {
    const recipe = data.recipeR[itemId];
    const item = data.itemR[itemId];

    // Find existing step for this item
    let step = steps.find((s) => s.itemId === itemId);

    if (!step) {
      // No existing step found, create a new one
      step = {
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

    if (recipe) {
      // Calculate number of outputs from recipe
      const out = recipe.out[itemId];

      // Calculate factories
      if (itemId === ItemId.SpaceSciencePack) {
        // Factories are for rocket parts, space science packs are a side effect
        step.factories = null;
      } else {
        step.factories = step.items.mul(recipe.time).div(out);
        if (item.category === CategoryId.Research) {
          step.factories = step.factories;
        }
        // Add # of factories to actually launch rockets
        if (itemId === ItemId.RocketPart) {
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
        for (const ingredient of Object.keys(recipe.in)) {
          const ingredientRate = rate.mul(recipe.in[ingredient]).div(out);
          RateUtility.addStepsFor(
            itemId,
            ingredient as ItemId,
            ingredientRate,
            steps,
            itemSettings,
            recipeSettings,
            fuel,
            data
          );
        }
      }
    }
  }

  static addNodesFor(
    parent: Node,
    itemId: ItemId,
    rate: Rational,
    itemSettings: ItemsState,
    recipeSettings: RecipesState,
    fuel: ItemId,
    data: RationalDataset
  ) {
    const recipe = data.recipeR[itemId];
    const item = data.itemR[itemId];

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
      // Mark complex recipes
      if ((recipe.id as string) !== itemId) {
        node.recipeId = recipe.id;
      }

      // Calculate number of outputs from recipe
      const out = recipe.out[itemId];

      // Calculate factories
      if (itemId === ItemId.SpaceSciencePack) {
        // Factories are for rocket parts, space science packs are a side effect
        node.factories = null;
      } else {
        node.factories = node.items.mul(recipe.time).div(out);
        if (item.category === CategoryId.Research) {
          node.factories = node.factories;
        }
        // Add # of factories to actually launch rockets
        if (itemId === ItemId.RocketPart) {
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
            ingredient as ItemId,
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
