import {
  Rational,
  RationalRecipe,
  RationalRecipeSettings,
  Dataset,
  ItemId,
  Entities,
  RationalProduct,
  Product,
  EnergyType,
  FuelType,
  Recipe,
  Factory,
  RateType,
} from '~/models';
import { FactoriesState } from '~/store/factories';
import { RecipesState } from '~/store/recipes';

export class RecipeUtility {
  static MIN_FACTOR = new Rational(BigInt(1), BigInt(5));
  static POLLUTION_FACTOR = new Rational(BigInt(60));
  static LAUNCH_TIME = new Rational(BigInt(2420), BigInt(60));

  /** Determines what option to use based on preferred rank */
  static bestMatch(options: string[], rank: string[]): string {
    if (options.length > 1) {
      for (const r of rank) {
        if (options.indexOf(r) !== -1) {
          // Return first matching option in rank list
          return r;
        }
      }
    }
    return options[0];
  }

  /** Determines default array of modules for a given recipe */
  static defaultModules(
    allowedModules: string[],
    moduleRank: string[],
    count: number
  ): string[] {
    const module = this.bestMatch(
      [ItemId.Module, ...allowedModules],
      moduleRank
    );
    return new Array(count).fill(module);
  }

  static adjustRecipe(
    recipeId: string,
    fuelId: string,
    miningBonus: Rational,
    researchFactor: Rational,
    settings: RationalRecipeSettings,
    data: Dataset
  ): RationalRecipe {
    const recipe = new RationalRecipe(data.recipeEntities[recipeId]);
    const factory = data.itemR[settings.factory].factory;

    if (!recipe.out) {
      // Add implied outputs
      recipe.out = { [recipeId]: Rational.one };
    }

    // Adjust for factory speed
    recipe.time = recipe.time.div(factory.speed);

    if (factory.research) {
      // Adjust for research factor
      recipe.time = recipe.time.div(researchFactor);
    }

    // Calculate factors
    let speed = Rational.one;
    let prod = Rational.one;
    let consumption = Rational.one;
    let pollution = Rational.one;

    if (factory.mining) {
      // Adjust for mining bonus
      prod = prod.add(miningBonus);
    }

    // Modules
    if (settings.factoryModules && settings.factoryModules.length) {
      for (const id of settings.factoryModules) {
        if (data.itemR[id]) {
          const module = data.itemR[id].module;
          if (module.speed) {
            speed = speed.add(module.speed);
          }
          if (module.productivity) {
            prod = prod.add(module.productivity);
          }
          if (module.consumption) {
            consumption = consumption.add(module.consumption);
          }
          if (module.pollution) {
            pollution = pollution.add(module.pollution);
          }
        }
      }
    }

    // Beacons
    const beaconModules = settings.beaconModules?.filter(
      (m) => m !== ItemId.Module && data.itemR[m]
    );
    if (beaconModules?.length && settings.beaconCount.nonzero()) {
      for (const id of beaconModules) {
        const module = data.itemR[id].module;
        const beacon = data.itemR[settings.beacon].beacon;
        const factor = settings.beaconCount.mul(beacon.effectivity);
        if (module.speed) {
          speed = speed.add(module.speed.mul(factor));
        }
        if (module.productivity) {
          prod = prod.add(module.productivity.mul(factor));
        }
        if (module.consumption) {
          consumption = consumption.add(module.consumption.mul(factor));
        }
        if (module.pollution) {
          pollution = pollution.add(module.pollution.mul(factor));
        }
      }
    }

    // Check for speed, consumption, or pollution below minimum value (20%)
    if (speed.lt(this.MIN_FACTOR)) {
      speed = this.MIN_FACTOR;
    }
    if (consumption.lt(this.MIN_FACTOR)) {
      consumption = this.MIN_FACTOR;
    }
    if (pollution.lt(this.MIN_FACTOR)) {
      pollution = this.MIN_FACTOR;
    }

    // Calculate module/beacon effects
    // Speed
    recipe.time = recipe.time.div(speed);

    // Productivity
    for (const outId of Object.keys(recipe.out)) {
      if (recipe.in && recipe.in[outId]) {
        // Recipe takes output as input, prod only applies to difference
        if (recipe.in[outId].lt(recipe.out[outId])) {
          // Only matters when output > input
          // (Does not apply to U-238 in Kovarex)
          recipe.out[outId] = recipe.in[outId].add(
            recipe.out[outId].sub(recipe.in[outId]).mul(prod)
          );
        }
      } else {
        recipe.out[outId] = recipe.out[outId].mul(prod);
      }
    }

    recipe.productivity = prod;
    // Log to adjust prod for research products
    if (factory.research) {
      recipe.adjustProd = true;
    }

    // Power
    recipe.consumption = factory.drain ? factory.drain : Rational.zero;
    recipe.consumption = recipe.consumption.add(
      factory.type === EnergyType.Electric
        ? factory.usage.mul(consumption)
        : Rational.zero
    );

    // Pollution
    recipe.pollution = factory.pollution
      ? factory.pollution
          .div(this.POLLUTION_FACTOR)
          .mul(pollution)
          .mul(consumption)
      : Rational.zero;

    // Calculate burner fuel inputs
    if (factory.type === EnergyType.Burner && factory.usage.nonzero()) {
      let rFuelId = fuelId;
      if (factory.category !== FuelType.Chemical) {
        // Try to find matching input for burning recipes
        const ins = Object.keys(recipe.in || {});
        const fuels = data.fuelIds[factory.category];
        rFuelId = ins.find((i) => fuels.indexOf(i) !== -1) || fuels[0];
      }
      const fuel = data.itemR[rFuelId].fuel;

      const fuelIn = recipe.time
        .mul(factory.usage)
        .div(fuel.value)
        .div(Rational.thousand);

      if (!recipe.in) {
        recipe.in = {};
      }

      recipe.in[rFuelId] = (recipe.in[rFuelId] || Rational.zero).add(fuelIn);

      if (fuel.result) {
        recipe.out[fuel.result] = (
          recipe.out[fuel.result] || Rational.zero
        ).add(fuelIn);
      }
    }

    return recipe;
  }

  static adjustSiloRecipes(
    recipeR: Entities<RationalRecipe>,
    settings: Entities<RationalRecipeSettings>
  ): Entities<RationalRecipe> {
    // Adjust rocket launch recipes
    const rocketRecipe = recipeR[ItemId.RocketPart];
    if (rocketRecipe) {
      const factor = Rational.hundred.div(rocketRecipe.out[ItemId.RocketPart]);

      for (const id of Object.keys(recipeR).filter(
        (i) =>
          i !== ItemId.RocketPart && settings[i].factory === ItemId.RocketSilo
      )) {
        recipeR[id].time = rocketRecipe.time.mul(factor).add(this.LAUNCH_TIME);
      }

      rocketRecipe.time = rocketRecipe.time
        .mul(factor)
        .add(this.LAUNCH_TIME)
        .div(factor);
    }

    return recipeR;
  }

  static getProductStepData(
    productSteps: Entities<[string, Rational][]>,
    product: Product | RationalProduct
  ): [string, Rational] {
    const steps = productSteps[product.itemId];
    if (steps.length === 0) {
      return null;
    } else if (product.viaId) {
      const tuple = steps.find((r) => r[0] === product.viaId);
      if (tuple) {
        return tuple;
      }
    }
    return steps[0];
  }

  static allowsModules(recipe: Recipe, factory: Factory): boolean {
    return !!(
      (recipe.producers[0] !== ItemId.RocketSilo ||
        recipe.id === ItemId.RocketPart) &&
      factory?.modules
    );
  }

  static adjustDataset(
    recipeSettings: Entities<RationalRecipeSettings>,
    fuel: string,
    miningBonus: Rational,
    researchSpeed: Rational,
    data: Dataset
  ): Dataset {
    return {
      ...data,
      ...{
        recipeR: this.adjustSiloRecipes(
          data.recipeIds.reduce((e: Entities<RationalRecipe>, i) => {
            e[i] = RecipeUtility.adjustRecipe(
              i,
              fuel,
              miningBonus,
              researchSpeed,
              recipeSettings[i],
              data
            );
            return e;
          }, {}),
          recipeSettings
        ),
      },
    };
  }

  static adjustProduct(
    product: Product,
    productSteps: Entities<[string, Rational][]>,
    recipeSettings: RecipesState,
    factories: FactoriesState,
    data: Dataset
  ): Product {
    if (product.rateType === RateType.Factories) {
      product = { ...product };

      if (!product.viaId) {
        let simpleRecipeId = data.itemRecipeIds[product.itemId];
        if (simpleRecipeId) {
          product.viaId = simpleRecipeId;
        } else {
          const via = this.getProductStepData(productSteps, product);
          if (via) {
            product.viaId = via[0];
          }
        }
      }

      if (!product.viaSetting) {
        product.viaSetting = recipeSettings[product.viaId].factory;
      }

      const recipe = data.recipeEntities[product.viaId];
      const factory = data.itemEntities[product.viaSetting].factory;
      if (this.allowsModules(recipe, factory)) {
        const def = recipeSettings[recipe.id];
        if (!product.viaFactoryModules) {
          if (product.viaSetting === def.factory) {
            product.viaFactoryModules = def.factoryModules;
          } else {
            const factoryDefaults = factories.entities[product.viaSetting];
            product.viaFactoryModules = RecipeUtility.defaultModules(
              data.recipeModuleIds[recipe.id],
              factoryDefaults.moduleRank,
              factory.modules
            );
          }
        }

        product.viaBeaconCount =
          product.viaBeaconCount != null
            ? product.viaBeaconCount
            : def.beaconCount;
        product.viaBeacon = product.viaBeacon || def.beacon;

        const beacon = data.itemEntities[product.viaBeacon]?.beacon;
        if (beacon && !product.viaBeaconModules) {
          product.viaBeaconModules = def.beaconModules;
        }
      }
    } else if (!product.viaId) {
      product = { ...product, ...{ viaId: product.itemId } };
    }

    return product;
  }
}
