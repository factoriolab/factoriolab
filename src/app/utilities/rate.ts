import {
  Step,
  DisplayRate,
  Entities,
  ItemId,
  RecipeId,
  Factors,
  CategoryId,
  Node,
  Rational,
  DisplayRateVal,
} from '~/models';
import { RationalDataset } from '~/store/dataset';
import { RecipeState } from '~/store/recipe';

export class RateUtility {
  static LAUNCH_TIME = new Rational(BigInt(2420), BigInt(60));
  static ONE_THOUSAND = new Rational(BigInt(1000));

  static addStepsFor(
    parentId: ItemId,
    itemId: ItemId,
    rate: Rational,
    steps: Step[],
    settings: RecipeState,
    factors: Entities<Factors>,
    fuel: ItemId,
    oilRecipe: RecipeId,
    data: RationalDataset
  ) {
    let recipe = data.recipeR[itemId];
    const item = data.itemR[itemId];

    if (!recipe) {
      // No recipe for this step, check for simple oil recipes
      recipe = this.findBasicOilRecipe(itemId, oilRecipe, data);
    }

    // Find existing step for this item
    let step = steps.find((s) => s.itemId === itemId);

    if (!step) {
      // No existing step found, create a new one
      step = {
        itemId,
        recipeId: itemId as any,
        items: Rational.zero,
        factories: Rational.zero,
        settings: recipe
          ? settings[recipe.id]
          : { belt: item.stack ? null : ItemId.Pipe },
      };

      steps.push(step);
    }

    // Add items to the step
    if (item.category === CategoryId.Research) {
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
        item.category === CategoryId.Research ? Rational.one : f.prod;
      const out = (recipe.out ? recipe.out[itemId] : Rational.one).mul(prod);

      // Calculate factories
      if (itemId === ItemId.SpaceSciencePack) {
        // Factories are for rocket parts, space science packs are a side effect
        step.factories = null;
      } else {
        step.factories = step.items.mul(recipe.time).div(out).div(f.speed);
        if (item.category === CategoryId.Research) {
          step.factories = step.factories.div(f.prod);
        }
        // Add # of factories to actually launch rockets
        if (itemId === ItemId.RocketPart) {
          step.factories = step.factories.add(
            step.items.div(Rational.hundred).mul(this.LAUNCH_TIME)
          );
        }
        // Add fuel required for factory
        if (
          step.settings.factory &&
          step.items.nonzero() &&
          !step.settings.ignore
        ) {
          const factory = data.itemR[step.settings.factory].factory;
          if (factory.burner) {
            RateUtility.addStepsFor(
              itemId,
              fuel,
              step.factories
                .mul(factory.burner)
                .div(data.itemR[fuel].fuel)
                .div(this.ONE_THOUSAND),
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
      if (recipe.in && step.items.nonzero() && !step.settings.ignore) {
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
    rate: Rational,
    settings: RecipeState,
    factors: Entities<Factors>,
    fuel: ItemId,
    oilRecipe: RecipeId,
    data: RationalDataset
  ) {
    let recipe = data.recipeR[itemId];
    const item = data.itemR[itemId];

    if (!recipe) {
      // No recipe for this step, check for simple oil recipes
      recipe = this.findBasicOilRecipe(itemId, oilRecipe, data);
    }

    const node: Node = {
      id: `${parent.id}:${itemId}`,
      name: data.itemEntities[itemId].name,
      itemId,
      recipeId: itemId as any,
      items:
        item.category === CategoryId.Research
          ? rate.mul(factors[recipe.id].prod)
          : rate,
      factories: Rational.zero,
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
        item.category === CategoryId.Research ? Rational.one : f.prod;
      const out = (recipe.out ? recipe.out[itemId] : Rational.one).mul(prod);

      // Calculate factories
      if (itemId === ItemId.SpaceSciencePack) {
        // Factories are for rocket parts, space science packs are a side effect
        node.factories = null;
      } else {
        node.factories = node.items.mul(recipe.time).div(out).div(f.speed);
        if (item.category === CategoryId.Research) {
          node.factories = node.factories.div(f.prod);
        }
        // Add # of factories to actually launch rockets
        if (itemId === ItemId.RocketPart) {
          node.factories = node.factories.add(
            node.items.div(Rational.hundred).mul(this.LAUNCH_TIME)
          );
        }
        // Add fuel required for factory
        if (
          node.settings.factory &&
          node.items.nonzero() &&
          !node.settings.ignore
        ) {
          const factory = data.itemR[node.settings.factory].factory;
          if (factory.burner) {
            RateUtility.addNodesFor(
              node,
              fuel,
              node.factories
                .mul(factory.burner)
                .div(data.itemR[fuel].fuel)
                .div(this.ONE_THOUSAND),
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
      if (recipe.in && node.items.nonzero() && !node.settings.ignore) {
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

  static calculateBelts(steps: Step[], beltSpeed: Entities<Rational>) {
    for (const step of steps) {
      if (step.items && step.settings.belt) {
        step.belts = step.items.div(beltSpeed[step.settings.belt]);
      }
    }
    return steps;
  }

  static calculateNodeBelts(node: Node, beltSpeed: Entities<Rational>) {
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

  static findBasicOilRecipe(
    id: ItemId,
    oilRecipeId: RecipeId,
    data: RationalDataset
  ) {
    if (oilRecipeId === RecipeId.BasicOilProcessing) {
      // Using Basic Oil processing, use simple recipes
      if (id === ItemId.PetroleumGas) {
        // To produce petroleum gas, use oil recipe
        return data.recipeR[oilRecipeId];
      } else if (id === ItemId.SolidFuel) {
        // To produce solid fuel, use petroleum fuel recipe
        return data.recipeR[RecipeId.SolidFuelFromPetroleumGas];
      }
    }
    return null;
  }
}
