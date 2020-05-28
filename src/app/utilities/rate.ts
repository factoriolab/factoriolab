import Fraction from 'fraction.js';

import {
  Step,
  DisplayRate,
  Entities,
  ItemId,
  RecipeId,
  Factors,
  CategoryId,
  Node,
} from '~/models';
import { DatasetState } from '~/store/dataset';
import { RecipeState } from '~/store/recipe';

export class RateUtility {
  static LAUNCH_TIME = new Fraction(2420, 60);

  static addStepsFor(
    parentId: ItemId,
    itemId: ItemId,
    rate: Fraction,
    steps: Step[],
    settings: RecipeState,
    factors: Entities<Factors>,
    fuel: ItemId,
    oilRecipe: RecipeId,
    data: DatasetState
  ) {
    let recipe = data.recipeEntities[itemId];
    const categoryId = data.itemEntities[itemId].category;

    if (!recipe) {
      // No recipe for this step, check for simple oil recipes
      recipe = this.findBasicOilRecipe(itemId, oilRecipe, data);
    }

    // Find existing step for this item
    let step = steps.find((s) => s.itemId === itemId);

    if (!step) {
      // No existing step found, create a new one
      const item = data.itemEntities[itemId];
      step = {
        itemId,
        recipeId: itemId as any,
        items: new Fraction(0),
        factories: new Fraction(0),
        settings: recipe
          ? settings[recipe.id]
          : { belt: item.stack ? null : ItemId.Pipe },
      };

      steps.push(step);
    }

    // Add items to the step
    if (categoryId === CategoryId.Research) {
      step.items = step.items.add(rate.mul(factors[recipe.id].prod));
    } else {
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
    }

    if (recipe) {
      // Mark complex recipes
      if ((recipe.id as string) !== itemId) {
        step.recipeId = recipe.id;
      }

      const f = factors[recipe.id];

      // Calculate number of outputs from recipe
      const prod =
        data.itemEntities[itemId].category === CategoryId.Research
          ? new Fraction(1)
          : f.prod;
      const out = new Fraction(recipe.out ? recipe.out[itemId] : 1).mul(prod);

      // Calculate factories
      if (itemId === ItemId.SpaceSciencePack) {
        // Factories are for rocket parts, space science packs are a side effect
        step.factories = null;
      } else {
        step.factories = step.items.mul(recipe.time).div(out).div(f.speed);
        if (categoryId === CategoryId.Research) {
          step.factories = step.factories.div(f.prod);
        }
        // Add # of factories to actually launch rockets
        if (itemId === ItemId.RocketPart) {
          step.factories = step.factories.add(
            step.items.div(100).mul(this.LAUNCH_TIME)
          );
        }
        // Add fuel required for factory
        if (
          step.settings.factory &&
          step.items.n > 0 &&
          !step.settings.ignore
        ) {
          const factory = data.itemEntities[step.settings.factory].factory;
          if (factory.burner) {
            RateUtility.addStepsFor(
              itemId,
              fuel,
              step.factories
                .mul(factory.burner)
                .div(data.itemEntities[fuel].fuel)
                .div(1000),
              steps,
              settings,
              factors,
              fuel,
              oilRecipe,
              data
            );
          }
        }
      }

      // Recurse adding steps for ingredients
      if (recipe.in && step.items.n > 0 && !step.settings.ignore) {
        for (const ingredient of Object.keys(recipe.in)) {
          const ingredientRate = rate.mul(recipe.in[ingredient]).div(out);
          RateUtility.addStepsFor(
            itemId,
            ingredient as ItemId,
            ingredientRate,
            steps,
            settings,
            factors,
            fuel,
            oilRecipe,
            data
          );
        }
      }
    }
  }

  static addNodesFor(
    parent: Node,
    itemId: ItemId,
    rate: Fraction,
    settings: RecipeState,
    factors: Entities<Factors>,
    fuel: ItemId,
    oilRecipe: RecipeId,
    data: DatasetState
  ) {
    let recipe = data.recipeEntities[itemId];
    const categoryId = data.itemEntities[itemId].category;

    if (!recipe) {
      // No recipe for this step, check for simple oil recipes
      recipe = this.findBasicOilRecipe(itemId, oilRecipe, data);
    }

    const item = data.itemEntities[itemId];
    const node: Node = {
      id: `${parent.id}:${itemId}`,
      name: data.itemEntities[itemId].name,
      itemId,
      recipeId: itemId as any,
      items:
        categoryId === CategoryId.Research
          ? rate.mul(factors[recipe.id].prod)
          : rate,
      factories: new Fraction(0),
      settings: recipe
        ? settings[recipe.id]
        : { belt: item.stack ? null : ItemId.Pipe },
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

      const f = factors[recipe.id];

      // Calculate number of outputs from recipe
      const prod =
        data.itemEntities[itemId].category === CategoryId.Research
          ? new Fraction(1)
          : f.prod;
      const out = new Fraction(recipe.out ? recipe.out[itemId] : 1).mul(prod);

      // Calculate factories
      if (itemId === ItemId.SpaceSciencePack) {
        // Factories are for rocket parts, space science packs are a side effect
        node.factories = null;
      } else {
        node.factories = node.items.mul(recipe.time).div(out).div(f.speed);
        if (categoryId === CategoryId.Research) {
          node.factories = node.factories.div(f.prod);
        }
        // Add # of factories to actually launch rockets
        if (itemId === ItemId.RocketPart) {
          node.factories = node.factories.add(
            node.items.div(100).mul(this.LAUNCH_TIME)
          );
        }
        // Add fuel required for factory
        if (
          node.settings.factory &&
          node.items.n > 0 &&
          !node.settings.ignore
        ) {
          const factory = data.itemEntities[node.settings.factory].factory;
          if (factory.burner) {
            RateUtility.addNodesFor(
              node,
              fuel,
              node.factories
                .mul(factory.burner)
                .div(data.itemEntities[fuel].fuel)
                .div(1000),
              settings,
              factors,
              fuel,
              oilRecipe,
              data
            );
          }
        }
      }

      // Recurse adding nodes for ingredients
      if (recipe.in && node.items.n > 0 && !node.settings.ignore) {
        for (const ingredient of Object.keys(recipe.in)) {
          RateUtility.addNodesFor(
            node,
            ingredient as ItemId,
            rate.mul(recipe.in[ingredient]).div(out),
            settings,
            factors,
            fuel,
            oilRecipe,
            data
          );
        }
      }
    }
  }

  static calculateBelts(steps: Step[], beltSpeed: Entities<Fraction>) {
    for (const step of steps) {
      if (step.items && step.settings.belt) {
        step.belts = step.items.div(beltSpeed[step.settings.belt]);
      }
    }
    return steps;
  }

  static calculateNodeBelts(node: Node, beltSpeed: Entities<Fraction>) {
    if (node.items && node.settings.belt) {
      node.belts = node.items.div(beltSpeed[node.settings.belt]);
    }
    if (node.children) {
      for (const child of node.children) {
        this.calculateNodeBelts(child, beltSpeed);
      }
    }
    return node;
  }

  static displayRate(steps: Step[], displayRate: DisplayRate) {
    for (const step of steps) {
      if (step.items) {
        if (step.parents) {
          for (const key of Object.keys(step.parents)) {
            step.parents[key] = step.parents[key].div(step.items);
          }
        }
        step.items = step.items.mul(displayRate);
      }
      if (step.surplus) {
        step.surplus = step.surplus.mul(displayRate);
      }
    }
    return steps;
  }

  static nodeDisplayRate(node: Node, displayRate: DisplayRate) {
    if (node.items) {
      node.items = node.items.mul(displayRate);
    }
    if (node.surplus) {
      node.surplus = node.surplus.mul(displayRate);
    }
    if (node.children) {
      for (const child of node.children) {
        this.nodeDisplayRate(child, displayRate);
      }
    }
    return node;
  }

  static findBasicOilRecipe(
    id: ItemId,
    oilRecipeId: RecipeId,
    data: DatasetState
  ) {
    if (oilRecipeId === RecipeId.BasicOilProcessing) {
      // Using Basic Oil processing, use simple recipes
      if (id === ItemId.PetroleumGas) {
        // To produce petroleum gas, use oil recipe
        return data.recipeEntities[oilRecipeId];
      } else if (id === ItemId.SolidFuel) {
        // To produce solid fuel, use petroleum fuel recipe
        return data.recipeEntities[RecipeId.SolidFuelFromPetroleumGas];
      }
    }
    return null;
  }
}
