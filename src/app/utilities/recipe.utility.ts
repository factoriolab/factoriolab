import { SelectItem } from 'primeng/api';

import { fnPropsNotNullish, orZero } from '~/helpers';
import {
  Beacon,
  BeaconRational,
  BeltRational,
  CostRationalSettings,
  Dataset,
  EnergyType,
  Entities,
  Game,
  isRecipeObjective,
  ItemId,
  ItemSettings,
  Machine,
  MachineRational,
  Objective,
  Rational,
  RawDataset,
  Recipe,
  RecipeRational,
  RecipeSettingsRational,
} from '~/models';
import { Machines } from '~/store';

export class RecipeUtility {
  static MIN_FACTOR = new Rational(BigInt(1), BigInt(5));
  static POLLUTION_FACTOR = new Rational(BigInt(60));
  static MIN_FACTORIO_RECIPE_TIME = new Rational(BigInt(1), BigInt(60));

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

  static fuelOptions(
    entity: Machine | MachineRational,
    data: RawDataset,
  ): SelectItem<string>[] {
    if (entity.fuel) {
      const fuel = data.itemEntities[entity.fuel];
      return [{ value: fuel.id, label: fuel.name }];
    }

    if (entity.fuelCategories == null) return [];

    const fuelCategories = entity.fuelCategories;
    const allowed = data.fuelIds
      .map((f) => data.itemEntities[f])
      .filter(fnPropsNotNullish('fuel'))
      .filter((f) => fuelCategories.includes(f.fuel.category));
    return allowed.map(
      (f): SelectItem<string> => ({ value: f.id, label: f.name }),
    );
  }

  static moduleOptions(
    entity: Machine | MachineRational | Beacon | BeaconRational,
    recipeId: string | null,
    data: RawDataset,
  ): SelectItem<string>[] {
    // Get all modules
    let allowed = data.moduleIds
      .map((i) => data.itemEntities[i])
      .filter(fnPropsNotNullish('module'));

    if (recipeId != null) {
      const recipe = data.recipeEntities[recipeId];
      if (!recipe.isMining && !recipe.isTechnology) {
        // Filter for modules allowed on this recipe
        allowed = allowed.filter(
          (m) =>
            !m.module.limitation ||
            data.limitations[m.module.limitation][recipeId],
        );
      }
    }

    // Filter for modules allowed on this entity
    if (entity.disallowedEffects) {
      for (const disallowedEffect of entity.disallowedEffects) {
        allowed = allowed.filter((m) => m.module[disallowedEffect] == null);
      }
    }

    const options = allowed.map(
      (m): SelectItem<string> => ({ value: m.id, label: m.name }),
    );
    if (data.game !== Game.Satisfactory) {
      options.unshift({ label: 'None', value: ItemId.Module });
    }
    return options;
  }

  /** Determines default array of modules for a given recipe */
  static defaultModules(
    options: SelectItem[],
    moduleRankIds: string[],
    count: number,
  ): string[] {
    const module = this.bestMatch(
      options.map((o) => o.value),
      moduleRankIds,
    );
    return new Array(count).fill(module);
  }

  static adjustRecipe(
    recipeId: string,
    proliferatorSprayId: string,
    miningBonus: Rational,
    researchSpeed: Rational,
    netProductionOnly: boolean,
    settings: RecipeSettingsRational,
    itemsState: Entities<ItemSettings>,
    data: RawDataset,
  ): RecipeRational {
    const recipe = new RecipeRational(data.recipeEntities[recipeId]);
    if (settings.machineId != null) {
      const machine = data.machineEntities[settings.machineId];
      
      if (machine.speed != null) {
        // Adjust for machine speed
        recipe.time = recipe.time.div(machine.speed);
      } else {
        // Calculate based on belt speed
        // Use minimum speed of all inputs/outputs in recipe
        const ids = [
          ...Object.keys(recipe.in).filter((i) => recipe.in[i].nonzero()),
          ...Object.keys(recipe.out).filter((i) => recipe.out[i].nonzero()),
        ];
        const belts = ids
          .map((i) => itemsState[i].beltId)
          .filter((b): b is string => b != null)
          .map((beltId) => data.beltEntities[beltId]);
        let minSpeed = Rational.zero;
        for (const b of belts.filter((b): b is BeltRational => b != null)) {
          if (minSpeed.lt(b.speed)) {
            minSpeed = b.speed;
          }
        }
        recipe.time = recipe.time.div(minSpeed);
      }

      if (recipe.isTechnology && data.game === Game.Factorio) {
        // Adjust for research factor
        recipe.time = recipe.time.div(researchSpeed);
      }

      // Calculate factors
      let speed = Rational.one;
      let prod = Rational.one;
      let consumption = Rational.one;
      let pollution = Rational.one;

      if (recipe.isMining) {
        // Adjust for mining bonus
        prod = prod.add(miningBonus);
      }

      const proliferatorSprays: Entities<Rational> = {};

      // Modules
      if (settings.machineModuleIds && settings.machineModuleIds.length) {
        for (const id of settings.machineModuleIds) {
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
      if (settings.beacons != null) {
        for (const beaconSettings of settings.beacons) {
          const beaconModules = beaconSettings.moduleIds?.filter(
            (m) => m !== ItemId.Module && data.moduleEntities[m],
          );
          if (
            beaconModules?.length &&
            beaconSettings.id &&
            beaconSettings.count?.nonzero()
          ) {
            for (const id of beaconModules) {
              const module = data.moduleEntities[id];
              const beacon = data.beaconEntities[beaconSettings.id];
              const factor = beaconSettings.count.mul(beacon.effectivity);
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
        oc = settings.overclock.div(Rational.hundred);
        speed = speed.mul(oc);
      }

      // Calculate module/beacon effects
      // Speed
      recipe.time = recipe.time.div(speed);

      // In Factorio, minimum recipe time is 1/60s (1 tick)
      if (
        recipe.time.lt(this.MIN_FACTORIO_RECIPE_TIME) &&
        data.game === Game.Factorio
      ) {
        recipe.time = this.MIN_FACTORIO_RECIPE_TIME;
      }

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

      // Power
      recipe.drain = machine.drain;
      let usage =
        (recipe.usage ? recipe.usage : machine.usage) || Rational.zero;
      if (oc) {
        if (machine.usage?.gt(Rational.zero)) {
          // Polynomial effect only on production buildings, not power generation
          const factor = Math.pow(oc.toNumber(), 1.321928);
          usage = usage.mul(Rational.fromNumber(factor));
        } else {
          usage = usage.mul(oc);
        }
      }
      recipe.consumption =
        machine.type === EnergyType.Electric
          ? usage.mul(consumption)
          : Rational.zero;

      // Pollution
      recipe.pollution =
        machine.pollution && settings.machineId !== ItemId.Pumpjack
          ? machine.pollution
              .div(this.POLLUTION_FACTOR)
              .mul(pollution)
              .mul(consumption)
          : Rational.zero;

      // Add machine consumption
      if (machine.consumption) {
        const consumption = machine.consumption;
        for (const id of Object.keys(consumption)) {
          const amount = recipe.time.div(Rational.sixty).mul(consumption[id]);
          recipe.in[id] = (recipe.in[id] || Rational.zero).add(amount);
        }
      }

      // Calculate burner fuel inputs
      if (settings.fuelId) {
        const fuel = data.fuelEntities[settings.fuelId];

        if (fuel) {
          const fuelIn = recipe.time
            .mul(usage)
            .div(fuel.value)
            .div(Rational.thousand);

          recipe.in[settings.fuelId] = (
            recipe.in[settings.fuelId] || Rational.zero
          ).add(fuelIn);

          if (fuel.result) {
            recipe.out[fuel.result] = (
              recipe.out[fuel.result] || Rational.zero
            ).add(fuelIn);
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

    if (netProductionOnly) {
      for (const outId of Object.keys(recipe.out)) {
        const output = recipe.out[outId];
        if (recipe.in[outId] != null) {
          // Recipe contains loop; reduce to net production
          const input = recipe.in[outId];

          if (input.gt(output)) {
            // More input, delete the output
            recipe.in[outId] = input.sub(output);
            delete recipe.out[outId];
          } else if (input.lt(output)) {
            // More output, delete the input
            recipe.out[outId] = output.sub(input);
            delete recipe.in[outId];
          } else {
            // Equal amounts, remove both
            delete recipe.in[outId];
            delete recipe.out[outId];
          }
        }
      }
    }

    return recipe;
  }

  /** Adjust rocket launch objective recipes */
  static adjustLaunchRecipeObjective(
    recipe: RecipeRational,
    settings: Entities<RecipeSettingsRational>,
    data: Dataset,
  ): void {
    if (!recipe.part) return;
    const partMachineId = settings[recipe.part].machineId;
    if (!partMachineId) return;
    const rocketMachine = data.machineEntities[partMachineId];
    if (!rocketMachine?.silo) return;

    const rocketRecipe = data.recipeR[recipe.part];
    const itemId = Object.keys(rocketRecipe.out)[0];
    const factor = rocketMachine.silo.parts.div(rocketRecipe.out[itemId]);
    recipe.time = rocketRecipe.time.mul(factor);
  }

  /** Adjust rocket launch and rocket part recipes */
  static adjustSiloRecipes(
    recipeR: Entities<RecipeRational>,
    settings: Entities<RecipeSettingsRational>,
    data: RawDataset,
  ): Entities<RecipeRational> {
    for (const partId of Object.keys(recipeR)) {
      const partMachineId = settings[partId].machineId;
      if (!partMachineId) continue;

      const rocketMachine = data.machineEntities[partMachineId];
      const rocketRecipe = recipeR[partId];
      if (!rocketMachine?.silo || rocketRecipe.part) continue;

      const itemId = Object.keys(rocketRecipe.out)[0];
      const factor = rocketMachine.silo.parts.div(rocketRecipe.out[itemId]);
      for (const launchId of Object.keys(recipeR).filter(
        (i) =>
          recipeR[i].part === partId && settings[i].machineId === partMachineId,
      )) {
        recipeR[launchId].time = rocketRecipe.time
          .mul(factor)
          .add(rocketMachine.silo.launch);
      }

      rocketRecipe.time = rocketRecipe.time
        .mul(factor)
        .add(rocketMachine.silo.launch)
        .div(factor);
    }

    return recipeR;
  }

  static allowsModules(
    recipe: Recipe | RecipeRational,
    machine: MachineRational,
  ): boolean {
    return (
      (!machine.silo || !recipe.part) &&
      machine.modules != null &&
      machine.modules > 0
    );
  }

  static adjustDataset(
    recipeIds: string[],
    excludedRecipeIds: string[],
    recipesState: Entities<RecipeSettingsRational>,
    itemsState: Entities<ItemSettings>,
    proliferatorSprayId: string,
    miningBonus: Rational,
    researchSpeed: Rational,
    netProductionOnly: boolean,
    cost: CostRationalSettings,
    data: RawDataset,
  ): Dataset {
    const recipeR = this.adjustRecipes(
      recipeIds,
      recipesState,
      itemsState,
      proliferatorSprayId,
      miningBonus,
      researchSpeed,
      netProductionOnly,
      data,
    );
    this.adjustCost(recipeIds, recipeR, recipesState, cost, data);
    return this.finalizeData(recipeIds, excludedRecipeIds, recipeR, data);
  }

  static adjustRecipes(
    recipeIds: string[],
    recipesState: Entities<RecipeSettingsRational>,
    itemsState: Entities<ItemSettings>,
    proliferatorSprayId: string,
    miningBonus: Rational,
    researchSpeed: Rational,
    netProductionOnly: boolean,
    data: RawDataset,
  ): Entities<RecipeRational> {
    return this.adjustSiloRecipes(
      recipeIds.reduce((e: Entities<RecipeRational>, i) => {
        e[i] = this.adjustRecipe(
          i,
          proliferatorSprayId,
          miningBonus,
          researchSpeed,
          netProductionOnly,
          recipesState[i],
          itemsState,
          data,
        );
        return e;
      }, {}),
      recipesState,
      data,
    );
  }

  static adjustCost(
    recipeIds: string[],
    recipeR: Entities<RecipeRational>,
    recipesState: Entities<RecipeSettingsRational>,
    cost: CostRationalSettings,
    data: RawDataset,
  ): void {
    recipeIds
      .map((i) => recipeR[i])
      .forEach((recipe) => {
        const settings = recipesState[recipe.id];
        if (settings.cost) {
          recipe.cost = settings.cost;
        } else if (recipe.cost) {
          // Recipe has a declared cost, base this on output items not machines
          // Calculate total output, sum, and multiply cost by output
          const output = Object.keys(recipe.out)
            .reduce((v, o) => v.add(recipe.out[o]), Rational.zero)
            .div(recipe.time);
          recipe.cost = output.mul(recipe.cost).mul(cost.factor);
        } else {
          recipe.cost = cost.machine;
          if (settings.machineId != null && cost.footprint.nonzero()) {
            // Adjust based on machine size
            const machine = data.machineEntities[settings.machineId];
            if (machine.size != null) {
              recipe.cost = recipe.cost.mul(
                Rational.fromNumber(machine.size[0] * machine.size[1]),
              );
            }
          }
        }
      });
  }

  static finalizeData(
    recipeIds: string[],
    excludedRecipeIds: string[],
    recipeR: Entities<RecipeRational>,
    data: RawDataset,
  ): Dataset {
    const excludedSet = new Set(excludedRecipeIds);
    const itemRecipeIds: Entities<string[]> = {};
    const itemIncludedRecipeIds: Entities<string[]> = {};
    const itemIncludedIoRecipeIds: Entities<string[]> = {};
    data.itemIds.forEach((i) => {
      itemRecipeIds[i] = [];
      itemIncludedRecipeIds[i] = [];
      itemIncludedIoRecipeIds[i] = [];
    });

    recipeIds
      .map((i) => recipeR[i])
      .forEach((recipe) => {
        recipe.finalize();
        recipe.produces.forEach((productId) =>
          itemRecipeIds[productId].push(recipe.id),
        );

        if (!excludedSet.has(recipe.id)) {
          recipe.produces.forEach((productId) =>
            itemIncludedRecipeIds[productId].push(recipe.id),
          );

          Object.keys(recipe.output).forEach((ioId) =>
            itemIncludedIoRecipeIds[ioId].push(recipe.id),
          );
        }
      });

    return {
      ...data,
      ...{
        recipeR,
        itemRecipeIds,
        itemIncludedRecipeIds,
        itemIncludedIoRecipeIds,
      },
    };
  }

  static adjustObjective(
    objective: Objective,
    machinesState: Machines.MachinesState,
    data: RawDataset,
  ): Objective {
    if (!isRecipeObjective(objective)) return objective;

    objective = { ...objective };
    const recipe = data.recipeEntities[objective.targetId];

    if (objective.machineId == null) {
      objective.machineId = this.bestMatch(
        recipe.producers,
        machinesState.ids ?? [],
      );
    }

    const machine = data.machineEntities[objective.machineId];
    const def = machinesState.entities[objective.machineId];

    if (recipe.isBurn) {
      objective.fuelId = Object.keys(recipe.in)[0];
    } else {
      objective.fuelId = objective.fuelId ?? def?.fuelId;
    }

    objective.fuelId = objective.fuelId ?? def?.fuelId;
    objective.fuelOptions = def?.fuelOptions;

    if (machine != null && this.allowsModules(recipe, machine)) {
      objective.machineModuleOptions = this.moduleOptions(
        machine,
        objective.targetId,
        data,
      );

      if (objective.machineModuleIds == null) {
        objective.machineModuleIds = this.defaultModules(
          objective.machineModuleOptions,
          def.moduleRankIds ?? [],
          orZero(machine.modules),
        );
      }

      if (objective.beacons == null) {
        objective.beacons = [{}];
      } else {
        objective.beacons = objective.beacons.map((b) => ({
          ...b,
        }));
      }

      for (const beaconSettings of objective.beacons) {
        beaconSettings.count = beaconSettings.count ?? def.beaconCount;
        beaconSettings.id = beaconSettings.id ?? def.beaconId;

        if (beaconSettings.id != null) {
          const beacon = data.beaconEntities[beaconSettings.id];
          beaconSettings.moduleOptions = this.moduleOptions(
            beacon,
            objective.targetId,
            data,
          );

          if (beaconSettings.moduleIds == null) {
            beaconSettings.moduleIds = RecipeUtility.defaultModules(
              beaconSettings.moduleOptions,
              def.beaconModuleRankIds ?? [],
              beacon.modules,
            );
          }
        }
      }
    } else {
      // Machine doesn't support modules, remove any
      delete objective.machineModuleIds;
      delete objective.beacons;
    }

    objective.overclock = objective.overclock ?? def.overclock;

    return objective;
  }
}
