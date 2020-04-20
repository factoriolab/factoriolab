import Fraction from 'fraction.js';

import {
  Recipe,
  Item,
  Entities,
  CategoryId,
  RecipeId,
  ItemId,
  Factors,
} from '~/models';

const categoryAllowProdModule = [CategoryId.Intermediate, CategoryId.Research];

export class RecipeUtility {
  /** Determines what default factory to use for a given recipe based on settings */
  static defaultFactory(
    recipe: Recipe,
    assembler: ItemId,
    furnace: ItemId,
    drill: ItemId
  ) {
    // No factory specified for step
    if (!recipe.producers) {
      // No producers specified for recipe, assume default assembler
      return assembler;
    } else if (recipe.producers.length === 1) {
      // Only one producer specified for recipe, use it
      return recipe.producers[0];
    } else if (recipe.producers.some((p) => p === assembler)) {
      // Found matching default assembler in producers, use it
      return assembler;
    } else if (recipe.producers.some((p) => p === furnace)) {
      // Found matching default furnace in producers, use it
      return furnace;
    } else if (recipe.producers.some((p) => p === drill)) {
      // Found matching default drill in producers, use it
      return drill;
    } else {
      // No matching default found in producers, use first possible producer
      return recipe.producers[0];
    }
  }

  /** Determines whether prod modules are allowed for a given recipe */
  static prodModuleAllowed(recipe: Recipe, itemEntities: Entities<Item>) {
    if (recipe.id === RecipeId.Satellite) {
      // Breaks the rules, but this is not allowed
      return false;
    }

    if (recipe.out) {
      // Recipe lists individual outputs, iterate them
      for (const out of Object.keys(recipe.out)) {
        const item = itemEntities[out];
        if (categoryAllowProdModule.indexOf(item.category) !== -1) {
          return true;
        }
      }
    } else {
      // Recipe lists no outputs, find item by recipe id
      const item = itemEntities[recipe.id];
      return categoryAllowProdModule.indexOf(item.category) !== -1;
    }

    return false;
  }

  /** Determines default array of modules for a given recipe */
  static defaultModules(
    recipe: Recipe,
    prodModule: ItemId,
    otherModule: ItemId,
    count: number,
    itemEntities: Entities<Item>
  ) {
    // Determine whether prod modules are allowed
    const prodModuleAllowed = this.prodModuleAllowed(recipe, itemEntities);
    // Pick the default module to use
    const module = prodModuleAllowed && prodModule ? prodModule : otherModule;
    // Create the appropriate array of default modules
    const modules = [];
    for (let i = 0; i < count; i++) {
      modules.push(module);
    }
    return modules;
  }

  /** Determines tuple of speed and productivity factors on given recipe */
  static recipeFactors(
    factorySpeed: number,
    modules: ItemId[],
    beaconType: ItemId,
    beaconCount: number,
    itemEntities: Entities<Item>
  ): Factors {
    let speed = new Fraction(1);
    let prod = new Fraction(1);
    if (modules && modules.length) {
      for (const id of modules) {
        if (itemEntities[id]) {
          const module = itemEntities[id].module;
          if (module) {
            speed = speed.add(module.speed);
            prod = prod.add(module.productivity);
          }
        }
      }
    }
    if (beaconType && itemEntities[beaconType]?.module && beaconCount > 0) {
      const module = itemEntities[beaconType].module;
      speed = speed.add(new Fraction(module.speed).div(2).mul(beaconCount));
    }

    speed = speed.mul(factorySpeed);

    return { speed, prod };
  }
}
