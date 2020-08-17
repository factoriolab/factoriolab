import {
  Rational,
  RationalRecipe,
  RationalRecipeSettings,
  Dataset,
  MODULE_ID,
  DisplayRate,
  DisplayRateVal,
} from '~/models';

export class RecipeUtility {
  static MIN_CONSUMPTION = new Rational(BigInt(1), BigInt(5));

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
    const module = this.bestMatch([MODULE_ID, ...allowedModules], moduleRank);

    // Create the appropriate array of default modules
    const modules = [];
    for (let i = 0; i < count; i++) {
      modules.push(module);
    }
    return modules;
  }

  static adjustRecipe(
    recipeId: string,
    fuelId: string,
    displayRate: DisplayRate,
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
    if (settings.modules && settings.modules.length) {
      for (const id of settings.modules) {
        if (data.itemEntities[id]) {
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
    if (
      settings.beaconModule &&
      data.itemR[settings.beaconModule]?.module &&
      settings.beaconCount.nonzero()
    ) {
      const module = data.itemR[settings.beaconModule].module;
      const factor = settings.beaconCount.div(Rational.two);
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
    // Original value is in units per minute
    const pollDrFactor = DisplayRateVal[displayRate].div(
      Rational.fromNumber(60)
    );
    recipe.pollution = factory.pollution
      ? factory.pollution.mul(pollDrFactor).mul(pollution).mul(consumption)
      : Rational.zero;

    // Calculate burner fuel inputs
    if (factory.burner) {
      const fuel = data.itemR[fuelId];

      if (!recipe.in) {
        recipe.in = {};
      }

      if (!recipe.in[fuelId]) {
        recipe.in[fuelId] = Rational.zero;
      }

      recipe.in[fuelId] = recipe.in[fuelId].add(
        recipe.time.mul(factory.burner).div(fuel.fuel).div(Rational.thousand)
      );
    }

    return recipe;
  }
}
