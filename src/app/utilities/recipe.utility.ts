import {
  Dataset,
  EnergyType,
  Entities,
  FuelType,
  ItemId,
  ItemSettings,
  Product,
  RateType,
  Rational,
  RationalBelt,
  RationalFactory,
  RationalProduct,
  RationalRecipe,
  RationalRecipeSettings,
  Recipe,
} from '~/models';
import * as Factories from '~/store/factories';
import * as Recipes from '~/store/recipes';

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
    allowedModuleIds: string[],
    moduleRankIds: string[],
    count: number
  ): string[] {
    const module = this.bestMatch(
      [ItemId.Module, ...allowedModuleIds],
      moduleRankIds
    );
    return new Array(count).fill(module);
  }

  static adjustRecipe(
    recipeId: string,
    fuelId: string | undefined,
    proliferatorSprayId: string,
    miningBonus: Rational,
    researchFactor: Rational,
    settings: RationalRecipeSettings,
    itemSettings: Entities<ItemSettings>,
    data: Dataset
  ): RationalRecipe {
    const recipe = new RationalRecipe(data.recipeEntities[recipeId]);
    if (settings.factoryId != null) {
      const factory = data.factoryEntities[settings.factoryId];

      if (factory.speed != null) {
        // Adjust for factory speed
        recipe.time = recipe.time.div(factory.speed);
      } else {
        // Calculate based on belt speed
        // Use minimum speed of all inputs/outputs in recipe
        const ids = [
          ...Object.keys(recipe.in).filter((i) => recipe.in[i].nonzero()),
          ...Object.keys(recipe.out).filter((i) => recipe.out[i].nonzero()),
        ];
        const belts = ids
          .map((i) => itemSettings[i].beltId)
          .filter((b): b is string => b != null)
          .map((beltId) => data.beltEntities[beltId]);
        let minSpeed = Rational.zero;
        for (const b of belts.filter((b): b is RationalBelt => b != null)) {
          if (minSpeed.lt(b.speed)) {
            minSpeed = b.speed;
          }
        }
        recipe.time = recipe.time.div(minSpeed);
      }

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

      const proliferatorSprays: Entities<Rational> = {};

      // Modules
      if (settings.factoryModuleIds && settings.factoryModuleIds.length) {
        for (const id of settings.factoryModuleIds) {
          const module = data.moduleEntities[id];
          if (module) {
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
            if (module.sprays) {
              let sprays = module.sprays;
              // If proliferator is applied to proliferator, apply productivity bonus to sprays
              const pModule = data.moduleEntities[proliferatorSprayId];
              if (pModule) {
                sprays = sprays
                  .mul(Rational.one.add(pModule.productivity ?? Rational.zero))
                  .floor(); // DSP rounds down # of sprays
              }
              // Calculate amount of proliferator required for this recipe
              const pId = module.proliferator;
              if (pId) {
                if (!proliferatorSprays[pId]) {
                  proliferatorSprays[pId] = Rational.zero;
                }
                proliferatorSprays[pId] = proliferatorSprays[pId].add(sprays);
              }
            }
          }
        }
      }

      // Beacons
      const beaconModules = settings.beaconModuleIds?.filter(
        (m) => m !== ItemId.Module && data.moduleEntities[m]
      );
      if (
        beaconModules?.length &&
        settings.beaconId &&
        settings.beaconCount?.nonzero()
      ) {
        for (const id of beaconModules) {
          const module = data.moduleEntities[id];
          const beacon = data.beaconEntities[settings.beaconId];
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
      let oc: Rational | undefined;
      if (settings.overclock && !settings.overclock.eq(Rational.hundred)) {
        if (factory.overclockFactor) {
          const ratio = Rational.hundred.div(settings.overclock);
          const factor = Math.pow(
            ratio.toNumber(),
            1 / factory.overclockFactor
          );
          oc = Rational.fromNumber(factor).reciprocal();
        } else {
          oc = settings.overclock.div(Rational.hundred);
        }
        speed = speed.mul(oc);
      }

      // Calculate module/beacon effects
      // Speed
      recipe.time = recipe.time.div(speed);

      // Productivity
      for (const outId of Object.keys(recipe.out)) {
        if (recipe.catalyst?.[outId]) {
          // Catalyst - only multiply prod by extra produced
          const catalyst = recipe.catalyst[outId];
          const affected = recipe.out[outId].sub(catalyst);
          // Only change output if affected amount > 0
          if (affected.gt(Rational.zero)) {
            recipe.out[outId] = catalyst.add(affected.mul(prod));
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
      let usage =
        (recipe.usage ? recipe.usage : factory.usage) || Rational.zero;
      if (oc) {
        const factor = Math.pow(oc.toNumber(), 1.6);
        usage = usage.mul(Rational.fromNumber(factor));
      }
      recipe.consumption =
        factory.type === EnergyType.Electric
          ? usage.mul(consumption)
          : Rational.zero;

      // Pollution
      recipe.pollution =
        factory.pollution && settings.factoryId !== ItemId.Pumpjack
          ? factory.pollution
              .div(this.POLLUTION_FACTOR)
              .mul(pollution)
              .mul(consumption)
          : Rational.zero;

      // Calculate burner fuel inputs
      if (factory.type === EnergyType.Burner && usage.nonzero()) {
        let rFuelId = fuelId;
        if (
          factory.category != null &&
          factory.category !== FuelType.Chemical
        ) {
          // Try to find matching input for burning recipes
          const ins = Object.keys(recipe.in);
          const fuels = data.fuelIds[factory.category];
          rFuelId = ins.find((i) => fuels.indexOf(i) !== -1) || fuels[0];
        }
        if (rFuelId) {
          const fuel = data.fuelEntities[rFuelId];

          if (fuel) {
            const fuelIn = recipe.time
              .mul(usage)
              .div(fuel.value)
              .div(Rational.thousand);

            recipe.in[rFuelId] = (recipe.in[rFuelId] || Rational.zero).add(
              fuelIn
            );

            if (fuel.result) {
              recipe.out[fuel.result] = (
                recipe.out[fuel.result] || Rational.zero
              ).add(fuelIn);
            }
          }
        }
      }

      // Calculate proliferator usage
      if (Object.keys(proliferatorSprays).length > 0) {
        const proliferatorUses: Entities<Rational> = {};

        for (const pId of Object.keys(proliferatorSprays)) {
          proliferatorUses[pId] = Rational.zero;

          for (const id of Object.keys(recipe.in)) {
            const sprays = proliferatorSprays[pId];
            const amount = recipe.in[id].div(sprays);
            proliferatorUses[pId] = proliferatorUses[pId].add(amount);
          }
        }

        // If proliferator spray is applied to proliferator, add its usage to inputs
        const pModule = data.moduleEntities[proliferatorSprayId];
        if (pModule && pModule.sprays) {
          const sprays = pModule.sprays
            .mul(Rational.one.add(pModule.productivity ?? Rational.zero))
            .floor() // DSP rounds down # of sprays
            .sub(Rational.one); // Subtract one spray of self
          let usage = Rational.zero;
          for (const id of Object.keys(proliferatorUses)) {
            const amount = proliferatorUses[id].div(sprays);
            usage = usage.add(amount);
          }
          const pId = pModule.proliferator;
          if (pId) {
            if (!proliferatorUses[pId]) {
              proliferatorUses[pId] = Rational.zero;
            }
            proliferatorUses[pId] = proliferatorUses[pId].add(usage);
          }
        }

        // Add proliferator consumption to recipe inputs
        // Assume recipe already has listed inputs, otherwise it could not be proliferated
        for (const pId of Object.keys(proliferatorUses)) {
          if (!recipe.in[pId]) {
            recipe.in[pId] = proliferatorUses[pId];
          } else {
            recipe.in[pId] = recipe.in[pId].add(proliferatorUses[pId]);
          }
        }
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
      const partFactoryId = settings[partId].factoryId;
      if (partFactoryId) {
        const rocketFactory = data.factoryEntities[partFactoryId];
        const rocketRecipe = recipeR[partId];
        if (rocketFactory?.silo && !rocketRecipe.part) {
          const itemId = Object.keys(rocketRecipe.out)[0];
          const factor = rocketFactory.silo.parts.div(rocketRecipe.out[itemId]);
          for (const launchId of Object.keys(recipeR).filter(
            (i) => recipeR[i].part === partId
          )) {
            if (partFactoryId === settings[launchId].factoryId) {
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
    }

    return recipeR;
  }

  static getProductStepData(
    productSteps: Entities<[string, Rational][]>,
    product: Product | RationalProduct
  ): [string, Rational] | null {
    const steps = productSteps[product.itemId];
    if (steps.length === 0) {
      return null;
    } else if (product.viaId) {
      return steps.find((r) => r[0] === product.viaId) ?? null;
    } else {
      return steps[0];
    }
  }

  static allowsModules(
    recipe: Recipe | RationalRecipe,
    factory: RationalFactory
  ): boolean {
    return (
      (!factory.silo || !recipe.part) &&
      factory.modules != null &&
      factory.modules > 0
    );
  }

  static adjustDataset(
    recipeSettings: Entities<RationalRecipeSettings>,
    itemSettings: Entities<ItemSettings>,
    disabledRecipeIds: string[],
    fuelId: string | undefined,
    proliferatorSprayId: string,
    miningBonus: Rational,
    researchSpeed: Rational,
    costFactor: Rational,
    costFactory: Rational,
    data: Dataset
  ): Dataset {
    const recipeR = this.adjustRecipes(
      recipeSettings,
      itemSettings,
      fuelId,
      proliferatorSprayId,
      miningBonus,
      researchSpeed,
      data
    );
    this.adjustCost(recipeR, recipeSettings, costFactor, costFactory);
    const itemRecipeId = { ...data.itemRecipeId };

    // Check for calculated default recipe ids
    for (const id of data.itemIds.filter((i) => !data.itemRecipeId[i])) {
      const rec = itemSettings[id].recipeId;
      if (rec && disabledRecipeIds.indexOf(rec) === -1) {
        itemRecipeId[id] = rec;
      } else {
        const recipes = data.recipeIds
          .map((r) => recipeR[r])
          .filter(
            (r) => r.produces(id) && disabledRecipeIds.indexOf(r.id) === -1
          );
        if (recipes.length === 1) {
          itemRecipeId[id] = recipes[0].id;
        }
      }
    }

    // Check for loops in default recipes
    for (const id of Object.keys(data.itemRecipeId)) {
      this.cleanCircularRecipes(id, recipeR, itemRecipeId);
    }

    return { ...data, ...{ recipeR, itemRecipeId } };
  }

  static defaultRecipe(
    itemId: string,
    disabledRecipeIds: string[],
    data: Dataset
  ): string | undefined {
    let recipeId: string | undefined;
    const recipes = data.recipeIds
      .map((r) => data.recipeR[r])
      .filter(
        (r) => r.produces(itemId) && disabledRecipeIds.indexOf(r.id) === -1
      );
    if (recipes.length === 1 && Object.keys(recipes[0].out).length === 1) {
      recipeId = recipes[0].id;
    }
    return recipeId;
  }

  static adjustRecipes(
    recipeSettings: Entities<RationalRecipeSettings>,
    itemSettings: Entities<ItemSettings>,
    fuelId: string | undefined,
    proliferatorSprayId: string,
    miningBonus: Rational,
    researchSpeed: Rational,
    data: Dataset
  ): Entities<RationalRecipe> {
    return this.adjustSiloRecipes(
      data.recipeIds.reduce((e: Entities<RationalRecipe>, i) => {
        e[i] = this.adjustRecipe(
          i,
          fuelId,
          proliferatorSprayId,
          miningBonus,
          researchSpeed,
          recipeSettings[i],
          itemSettings,
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
    recipeSettings: Recipes.RecipesState,
    factories: Factories.FactoriesState,
    data: Dataset
  ): Product {
    if (product.rateType === RateType.Factories) {
      product = { ...product };

      if (!product.viaId) {
        const simpleRecipeId = data.itemRecipeId[product.itemId];
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
          product.viaSetting = recipeSettings[product.viaId].factoryId;
        }

        if (product.viaSetting) {
          const recipe = data.recipeEntities[product.viaId];
          const factory = data.factoryEntities[product.viaSetting];
          const def = recipeSettings[recipe.id];
          const fDef = factories.entities[product.viaSetting];
          if (this.allowsModules(recipe, factory)) {
            if (product.viaSetting === def.factoryId) {
              product.viaFactoryModuleIds =
                product.viaFactoryModuleIds || def.factoryModuleIds;
              product.viaBeaconCount =
                product.viaBeaconCount || def.beaconCount;
              product.viaBeaconId = product.viaBeaconId || def.beaconId;
              if (product.viaBeaconId) {
                const beacon = data.beaconEntities[product.viaBeaconId];
                if (product.viaBeaconModuleIds == null) {
                  if (product.viaBeaconId === def.beaconId) {
                    product.viaBeaconModuleIds = def.beaconModuleIds;
                  } else {
                    product.viaBeaconModuleIds = new Array(beacon.modules).fill(
                      fDef.beaconModuleId
                    );
                  }
                }
              }
            } else {
              if (product.viaFactoryModuleIds == null) {
                product.viaFactoryModuleIds = this.defaultModules(
                  data.recipeModuleIds[recipe.id],
                  fDef.moduleRankIds ?? [],
                  factory.modules ?? 0
                );
              }

              product.viaBeaconCount =
                product.viaBeaconCount ?? fDef.beaconCount;
              product.viaBeaconId = product.viaBeaconId ?? fDef.beaconId;

              if (product.viaBeaconId != null) {
                const beacon = data.beaconEntities[product.viaBeaconId];
                if (product.viaBeaconModuleIds == null) {
                  product.viaBeaconModuleIds = new Array(beacon.modules).fill(
                    fDef.beaconModuleId
                  );
                }
              }
            }
          }

          if (product.viaSetting === def.factoryId) {
            product.viaOverclock = product.viaOverclock || def.overclock;
          } else {
            product.viaOverclock = product.viaOverclock || fDef.overclock;
          }
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
    itemRecipeId: Entities,
    itemIds: string[] = []
  ): void {
    const recipeId = itemRecipeId[itemId];
    if (recipeId) {
      if (itemIds.indexOf(itemId) !== -1) {
        // Found a circular loop
        delete itemRecipeId[itemId];
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
              itemRecipeId,
              itemIds
            );
          }
        }
      }
    }
  }
}
