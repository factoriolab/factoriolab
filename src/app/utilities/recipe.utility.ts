import {
  Rational,
  RationalRecipe,
  RationalRecipeSettings,
  Dataset,
  ItemId,
} from '~/models';

export class RecipeUtility {
  static MIN_CONSUMPTION = new Rational(BigInt(1), BigInt(5));
  static POLLUTION_FACTOR = new Rational(BigInt(60));

  /** Determines what option to use based on preferred rank */
  static bestMatch(options: string[], rank: string[]) {
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
  ) {
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
  ) {
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
      (m) => m !== ItemId.Module
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

      // Log prod for research products
      if (factory.research) {
        recipe.adjustProd = prod;
      }
    }

    // Power
    // Minimum value is 20%
    if (consumption.lt(this.MIN_CONSUMPTION)) {
      consumption = this.MIN_CONSUMPTION;
    }
    recipe.consumption = factory.drain ? factory.drain : Rational.zero;
    recipe.consumption = recipe.consumption.add(
      factory.electric ? factory.electric.mul(consumption) : Rational.zero
    );

    // Pollution
    recipe.pollution = factory.pollution
      ? factory.pollution
          .div(this.POLLUTION_FACTOR)
          .mul(pollution)
          .mul(consumption)
      : Rational.zero;

    // Calculate burner fuel inputs
    if (factory.burner) {
      const fuel = data.itemR[fuelId];
      const fuelIn = recipe.time
        .mul(factory.burner)
        .div(fuel.fuel)
        .div(Rational.thousand);

      if (!recipe.in) {
        recipe.in = {};
      }

      if (!recipe.in[fuelId]) {
        recipe.in[fuelId] = Rational.zero;
      }

      // Check whether recipe also outputs the fuel
      if (recipe.out[fuelId]) {
        if (recipe.out[fuelId].gte(fuelIn)) {
          // Recipe outputs more fuel than consumed, subtract input
          recipe.out[fuelId] = recipe.out[fuelId].sub(fuelIn);
          delete recipe.in[fuelId];
        } else {
          // Recipe outputs less fuel than consumed, adjust input and delete output
          recipe.in[fuelId] = recipe.in[fuelId]
            .add(fuelIn)
            .sub(recipe.out[fuelId]);
          delete recipe.out[fuelId];
        }
      } else {
        // Recipe only takes fuel as input
        recipe.in[fuelId] = recipe.in[fuelId].add(fuelIn);
      }
    }

    return recipe;
  }

  static nonCircularRecipe(recipe: RationalRecipe) {
    if (!recipe.in || !recipe.out) {
      return recipe;
    }

    const result = { ...recipe };

    for (const outId of Object.keys(result.out)) {
      if (result.in[outId]) {
        if (result.in[outId].gt(result.out[outId])) {
          result.in[outId] = result.in[outId].sub(result.out[outId]);
          delete result.out[outId];
        } else {
          result.out[outId] = result.out[outId].sub(result.in[outId]);
          delete result.in[outId];
        }
      }
    }

    return result;
  }
}
