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
  ItemSettings,
} from '~/models';
import { FactoriesState } from '~/store/factories';
import { RecipesState } from '~/store/recipes';

export class RecipeUtility {
  static MIN_FACTOR = new Rational(BigInt(1), BigInt(5));
  static POLLUTION_FACTOR = new Rational(BigInt(60));

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

    // Overclock effects
    let oc: Rational;
    if (settings.overclock && !settings.overclock.eq(Rational.hundred)) {
      oc = settings.overclock.div(Rational.hundred);
      speed = speed.mul(oc);
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
    recipe.drain = factory.drain;
    let usage = recipe.usage ? recipe.usage : factory.usage;
    if (oc) {
      const factor = Math.pow(oc.toNumber(), 1.6);
      usage = usage.mul(Rational.fromNumber(factor));
    }
    recipe.consumption =
      factory.type === EnergyType.Electric
        ? usage.mul(consumption)
        : Rational.zero;

    // Pollution
    recipe.pollution = factory.pollution
      ? factory.pollution
          .div(this.POLLUTION_FACTOR)
          .mul(pollution)
          .mul(consumption)
      : Rational.zero;

    // Calculate burner fuel inputs
    if (factory.type === EnergyType.Burner && usage.nonzero()) {
      let rFuelId = fuelId;
      if (factory.category !== FuelType.Chemical) {
        // Try to find matching input for burning recipes
        const ins = Object.keys(recipe.in || {});
        const fuels = data.fuelIds[factory.category];
        rFuelId = ins.find((i) => fuels.indexOf(i) !== -1) || fuels[0];
      }
      const fuel = data.itemR[rFuelId].fuel;

      const fuelIn = recipe.time
        .mul(usage)
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

  /** Adjust rocket launch and rocket part recipes */
  static adjustSiloRecipes(
    recipeR: Entities<RationalRecipe>,
    settings: Entities<RationalRecipeSettings>,
    data: Dataset
  ): Entities<RationalRecipe> {
    for (const partId of Object.keys(recipeR)) {
      const rocketFactory = data.itemR[settings[partId].factory]?.factory;
      const rocketRecipe = recipeR[partId];
      if (rocketFactory?.silo && !rocketRecipe.part) {
        const itemId = Object.keys(rocketRecipe.out)[0];
        const factor = rocketFactory.silo.parts.div(rocketRecipe.out[itemId]);
        for (const launchId of Object.keys(recipeR).filter(
          (i) => recipeR[i].part === partId
        )) {
          if (settings[partId].factory === settings[launchId].factory) {
            recipeR[launchId].time = rocketRecipe.time
              .mul(factor)
              .add(rocketFactory.silo.launch);
          }
        }
        rocketRecipe.time = rocketRecipe.time
          .mul(factor)
          .add(rocketFactory.silo.launch)
          .div(factor);
      }
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
      return steps.find((r) => r[0] === product.viaId);
    } else {
      return steps[0];
    }
  }

  static allowsModules(
    recipe: Recipe | RationalRecipe,
    factory: Factory
  ): boolean {
    return (!factory?.silo || !recipe.part) && factory?.modules > 0;
  }

  static adjustDataset(
    recipeSettings: Entities<RationalRecipeSettings>,
    itemSettings: Entities<ItemSettings>,
    disabledRecipes: string[],
    fuel: string,
    miningBonus: Rational,
    researchSpeed: Rational,
    costFactor: Rational,
    costFactory: Rational,
    data: Dataset
  ): Dataset {
    const recipeR = this.adjustRecipes(
      recipeSettings,
      fuel,
      miningBonus,
      researchSpeed,
      data
    );
    this.adjustCost(recipeR, recipeSettings, costFactor, costFactory);
    const itemRecipeIds = { ...data.itemRecipeIds };

    // Check for calculated default recipe ids
    for (const id of data.itemIds.filter((i) => !data.itemRecipeIds[i])) {
      const rec = itemSettings[id].recipe;
      if (rec && disabledRecipes.indexOf(rec) === -1) {
        itemRecipeIds[id] = rec;
      } else {
        const recipes = data.recipeIds
          .map((r) => recipeR[r])
          .filter(
            (r) => r.produces(id) && disabledRecipes.indexOf(r.id) === -1
          );
        if (recipes.length === 1 && Object.keys(recipes[0].out).length === 1) {
          itemRecipeIds[id] = recipes[0].id;
        }
      }
    }

    // Check for loops in default recipes
    for (const id of Object.keys(data.itemRecipeIds)) {
      this.cleanCircularRecipes(id, data.recipeR, itemRecipeIds);
    }

    return { ...data, ...{ recipeR, itemRecipeIds } };
  }

  static defaultRecipe(
    itemId: string,
    disabledRecipes: string[],
    data: Dataset
  ): string {
    const recipes = data.recipeIds
      .map((r) => data.recipeR[r])
      .filter(
        (r) => r.produces(itemId) && disabledRecipes.indexOf(r.id) === -1
      );
    if (recipes.length === 1 && Object.keys(recipes[0].out).length === 1) {
      return recipes[0].id;
    }
    return null;
  }

  static adjustRecipes(
    recipeSettings: Entities<RationalRecipeSettings>,
    fuel: string,
    miningBonus: Rational,
    researchSpeed: Rational,
    data: Dataset
  ): Entities<RationalRecipe> {
    return this.adjustSiloRecipes(
      data.recipeIds.reduce((e: Entities<RationalRecipe>, i) => {
        e[i] = this.adjustRecipe(
          i,
          fuel,
          miningBonus,
          researchSpeed,
          recipeSettings[i],
          data
        );
        return e;
      }, {}),
      recipeSettings,
      data
    );
  }

  static adjustCost(
    recipeR: Entities<RationalRecipe>,
    recipeSettings: Entities<RationalRecipeSettings>,
    costFactor: Rational,
    costFactory: Rational
  ): void {
    for (const id of Object.keys(recipeR)) {
      const recipe = recipeR[id];
      if (recipeSettings[id].cost) {
        recipe.cost = recipeSettings[id].cost;
      } else if (recipe.cost) {
        // Recipe has a declared cost, base this on output items not factories
        // Calculate total output, sum, and multiply cost by output
        const output = Object.keys(recipe.out)
          .reduce((v, o) => v.add(recipe.out[o]), Rational.zero)
          .div(recipe.time);
        recipe.cost = output.mul(recipe.cost).mul(costFactor);
      } else {
        // Adjust based on recipe time so that this is based on # factories
        recipe.cost = costFactory;
      }
    }
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
        const simpleRecipeId = data.itemRecipeIds[product.itemId];
        if (simpleRecipeId) {
          product.viaId = simpleRecipeId;
        } else {
          const via = this.getProductStepData(productSteps, product);
          if (via) {
            product.viaId = via[0];
          }
        }
      }

      if (product.viaId) {
        if (!product.viaSetting) {
          product.viaSetting = recipeSettings[product.viaId].factory;
        }

        const recipe = data.recipeEntities[product.viaId];
        const factory = data.itemEntities[product.viaSetting].factory;
        const def = recipeSettings[recipe.id];
        const fDef = factories.entities[product.viaSetting];
        if (this.allowsModules(recipe, factory)) {
          if (product.viaSetting === def.factory) {
            product.viaFactoryModules =
              product.viaFactoryModules || def.factoryModules;
            product.viaBeaconCount = product.viaBeaconCount || def.beaconCount;
            product.viaBeacon = product.viaBeacon || def.beacon;
            const beacon = data.itemEntities[product.viaBeacon]?.beacon;
            if (beacon && !product.viaBeaconModules) {
              if (product.viaBeacon === def.beacon) {
                product.viaBeaconModules = def.beaconModules;
              } else {
                product.viaBeaconModules = new Array(beacon.modules).fill(
                  fDef.beaconModule
                );
              }
            }
          } else {
            if (!product.viaFactoryModules) {
              product.viaFactoryModules = this.defaultModules(
                data.recipeModuleIds[recipe.id],
                fDef.moduleRank,
                factory.modules
              );
            }

            product.viaBeaconCount = product.viaBeaconCount || fDef.beaconCount;
            product.viaBeacon = product.viaBeacon || fDef.beacon;

            const beacon = data.itemEntities[product.viaBeacon]?.beacon;
            if (beacon && !product.viaBeaconModules) {
              product.viaBeaconModules = new Array(beacon.modules).fill(
                fDef.beaconModule
              );
            }
          }
        }

        if (product.viaSetting === def.factory) {
          product.viaOverclock = product.viaOverclock || def.overclock;
        } else {
          product.viaOverclock = product.viaOverclock || fDef.overclock;
        }
      }
    } else if (!product.viaId) {
      product = { ...product, ...{ viaId: product.itemId } };
    }

    return product;
  }

  static cleanCircularRecipes(
    itemId: string,
    recipeR: Entities<RationalRecipe>,
    itemRecipeIds: Entities,
    itemIds: string[] = []
  ): void {
    const recipeId = itemRecipeIds[itemId];
    if (recipeId) {
      if (itemIds.indexOf(itemId) !== -1) {
        // Found a circular loop
        itemRecipeIds[itemId] = null;
      } else {
        const recipe = recipeR[recipeId];
        if (recipe.produces(itemId) && recipe.in) {
          // Need to check recipe inputs for circular loops
          itemIds = [...itemIds, itemId];
          for (const ingredient of Object.keys(recipe.in).filter(
            (i) => i !== itemId
          )) {
            this.cleanCircularRecipes(
              ingredient,
              recipeR,
              itemRecipeIds,
              itemIds
            );
          }
        }
      }
    }
  }
}
