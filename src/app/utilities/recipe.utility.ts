import {
  Recipe,
  Rational,
  RationalRecipe,
  RationalRecipeSettings,
  Dataset,
} from '~/models';

export class RecipeUtility {
  /** Determines what default factory to use for a given recipe based on settings */
  static defaultFactory(recipe: Recipe, factoryRank: string[]) {
    if (recipe.producers.length === 1) {
      // Only one producer specified for recipe, use it
      return recipe.producers[0];
    } else {
      for (const f of factoryRank) {
        if (recipe.producers.indexOf(f) !== -1) {
          // Return first matching factory in rank list
          return f;
        }
      }
      // No matching factory found in producers, use first possible producer
      return recipe.producers[0];
    }
  }

  /** Determines default array of modules for a given recipe */
  static defaultModules(
    recipe: Recipe,
    moduleRank: string[],
    count: number,
    data: Dataset
  ) {
    let module = 'module';
    // Find matching module in rank list
    for (const m of moduleRank) {
      if (data.recipeModuleIds[recipe.id].indexOf(m) !== -1) {
        module = m;
        break;
      }
    }
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

  /** Resets a passed field of the recipe state */
  static resetField<T>(state: T, field: string): T {
    // Spread into new state
    const newState = { ...state };
    for (const id of Object.keys(newState).filter(
      (i) => newState[i][field] != null
    )) {
      if (Object.keys(newState[id]).length === 1) {
        delete newState[id];
      } else {
        // Spread into new recipe settings state
        newState[id] = { ...newState[id] };
        delete newState[id][field];
      }
    }
    return newState;
  }
}
