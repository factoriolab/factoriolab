import {
  Recipe,
  Item,
  Entities,
  CategoryId,
  RecipeId,
  ItemId,
  Factors,
  Step,
  Node,
  Rational,
  RationalItem,
} from '~/models';
import { DatasetState } from '~/store/dataset';
import { RecipeState } from '~/store/recipe';

const categoryAllowProdModule = [CategoryId.Intermediate, CategoryId.Research];
const order: (ItemId | RecipeId)[] = [
  // Research products
  ItemId.MiningProductivity,
  ItemId.WorkerRobotSpeed,
  ItemId.FollowerRobotCount,
  ItemId.EnergyWeaponsDamage,
  ItemId.PhysicalProjectileDamage,
  ItemId.RefinedFlammables,
  ItemId.ArtilleryShellRange,
  ItemId.ArtilleryShellShootingSpeed,
  ItemId.StrongerExplosives,
  // All other items/recipes
  ItemId.None,
  // Smelting / Furnaces
  ItemId.SteelPlate,
  ItemId.CopperPlate,
  ItemId.IronPlate,
  ItemId.StoneBrick,
  // Mining drills / raw materials
  ItemId.UraniumOre,
  ItemId.CopperOre,
  ItemId.IronOre,
  ItemId.Stone,
  ItemId.Coal,
  ItemId.Wood,
  // Pure oil recipes
  ItemId.RocketFuel,
  RecipeId.SolidFuelFromLightOil,
  RecipeId.SolidFuelFromPetroleumGas,
  ItemId.Lubricant,
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
  static moduleAllowed(
    moduleId: ItemId,
    recipeId: RecipeId,
    data: DatasetState
  ) {
    const module = data.itemEntities[moduleId];
    if (module.module.limitation) {
      return data.limitations[module.module.limitation].some(
        (l) => l === recipeId
      );
    }

    return true;
  }

  /** Determines default array of modules for a given recipe */
  static defaultModules(
    recipe: Recipe,
    prodModule: ItemId,
    speedModule: ItemId,
    count: number,
    data: DatasetState
  ) {
    // Determine whether prod modules are allowed
    const prodModuleAllowed = this.moduleAllowed(
      ItemId.ProductivityModule,
      recipe.id,
      data
    );
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
    factorySpeed: Rational,
    factoryProd: Rational,
    modules: ItemId[],
    beaconModule: ItemId,
    beaconCount: Rational,
    itemEntities: Entities<RationalItem>
  ): Factors {
    let speed = Rational.one;
    let prod = Rational.one;
    if (modules && modules.length) {
      for (const id of modules) {
        if (itemEntities[id]) {
          const module = itemEntities[id].module;
          if (module) {
            if (module.speed) {
              speed = speed.add(module.speed);
            }
            if (module.productivity) {
              prod = prod.add(module.productivity);
            }
          }
        }
      }
    }
    if (
      beaconModule &&
      itemEntities[beaconModule]?.module &&
      beaconCount.nonzero()
    ) {
      const module = itemEntities[beaconModule].module;
      if (module.speed) {
        speed = speed.add(module.speed.div(Rational.two).mul(beaconCount));
      }
    }

    speed = speed.mul(factorySpeed);
    prod = prod.add(factoryProd);

    return { speed, prod };
  }

  /** Sorts steps based on items / recipes */
  static sort(steps: Step[]) {
    return steps.sort((a, b) => this.sortOrder(a) - this.sortOrder(b));
  }

  static sortNode(node: Node) {
    if (node.children) {
      node.children = node.children.sort(
        (a, b) => this.sortOrder(a) - this.sortOrder(b)
      );
      for (const child of node.children) {
        this.sortNode(child);
      }
    }
    return node;
  }

  /** Gets sort order for a specific step */
  static sortOrder(step: Step) {
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

  /** Resets a passed field of the recipe state */
  static resetField(state: RecipeState, field: string) {
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
