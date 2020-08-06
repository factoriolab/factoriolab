import {
  Rational,
  RationalRecipe,
  RationalRecipeSettings,
  Dataset,
} from '~/models';

export class RecipeUtility {
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
    const module = this.bestMatch([...allowedModules, 'module'], moduleRank);

    // Create the appropriate array of default modules
    const modules = [];
    for (let i = 0; i < count; i++) {
      modules.push(module);
    }
    return modules;
  }

  static adjustRecipe(
    recipeId: string,
    miningBonus: Rational,
    researchFactor: Rational,
    fuelId: string,
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
      if (module.speed) {
        speed = speed.add(
          module.speed.div(Rational.two).mul(settings.beaconCount)
        );
      }
    }

    // Calculate module/beacon effects
    recipe.time = recipe.time.div(speed);
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
