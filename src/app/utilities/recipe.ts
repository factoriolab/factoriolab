import Fraction from 'fraction.js';

import {
  Recipe,
  Item,
  Entities,
  CategoryId,
  RecipeId,
  ItemId,
  Factors,
  Step,
} from '~/models';

const categoryAllowProdModule = [CategoryId.Intermediate, CategoryId.Research];
const order: (ItemId | RecipeId)[] = [
  ItemId.MiningProductivity,
  ItemId.WorkerRobotSpeed,
  ItemId.FollowerRobotCount,
  ItemId.EnergyWeaponsDamage,
  ItemId.PhysicalProjectileDamage,
  ItemId.RefinedFlammables,
  ItemId.ArtilleryShellRange,
  ItemId.ArtilleryShellShootingSpeed,
  ItemId.StrongerExplosives,
  ItemId.None,
  ItemId.SteelPlate,
  ItemId.CopperPlate,
  ItemId.IronPlate,
  ItemId.StoneBrick,
  ItemId.UraniumOre,
  ItemId.CopperOre,
  ItemId.IronOre,
  ItemId.Stone,
  ItemId.Coal,
  ItemId.Wood,
  ItemId.RocketFuel,
  RecipeId.SolidFuelFromLightOil,
  RecipeId.SolidFuelFromPetroleumGas,
  ItemId.PetroleumGas,
  ItemId.LightOil,
  ItemId.HeavyOil,
  ItemId.CrudeOil,
  ItemId.Water,
];

export class RecipeUtility {
  /** Determines what default factory to use for a given recipe based on settings */
  static defaultFactory(recipe: Recipe, assembler: ItemId, furnace: ItemId) {
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
    speedModule: ItemId,
    count: number,
    itemEntities: Entities<Item>
  ) {
    // Determine whether prod modules are allowed
    const prodModuleAllowed = this.prodModuleAllowed(recipe, itemEntities);
    // Pick the default module to use
    const module =
      prodModuleAllowed && prodModule !== ItemId.Module
        ? prodModule
        : speedModule;
    // Create the appropriate array of default modules
    const modules = [];
    for (let i = 0; i < count; i++) {
      modules.push(module);
    }
    return modules;
  }

  /** Determines tuple of speed and productivity factors on given recipe */
  static recipeFactors(
    factorySpeed: Fraction,
    factoryProd: Fraction,
    modules: ItemId[],
    beaconModule: ItemId,
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
    if (beaconModule && itemEntities[beaconModule]?.module && beaconCount > 0) {
      const module = itemEntities[beaconModule].module;
      speed = speed.add(new Fraction(module.speed).div(2).mul(beaconCount));
    }

    speed = speed.mul(factorySpeed);
    prod = prod.add(factoryProd);

    return { speed, prod };
  }

  static sort(steps: Step[]) {
    return steps.sort((a, b) => this.getOrder(a) - this.getOrder(b));
  }

  static getOrder(step: Step) {
    const itemIndex = order.indexOf(step.itemId);
    if (itemIndex !== -1) {
      return itemIndex;
    } else {
      const recipeIndex = order.indexOf(step.recipeId);
      if (recipeIndex !== -1) {
        return recipeIndex;
      }
    }
    return order.indexOf(ItemId.None);
  }
}
