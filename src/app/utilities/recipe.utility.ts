import { SelectItem } from 'primeng/api';

import { areArraysEqual, coalesce, fnPropsNotNullish } from '~/helpers';
import {
  AdjustedDataset,
  AdjustedRecipe,
  areBeaconSettingsEqual,
  areModuleSettingsEqual,
  Beacon,
  BeaconSettings,
  Belt,
  cloneRecipe,
  CostSettings,
  Dataset,
  EnergyType,
  Entities,
  finalizeRecipe,
  Game,
  isRecipeObjective,
  ItemId,
  ItemSettings,
  Machine,
  MachineJson,
  ModuleSettings,
  Objective,
  rational,
  Rational,
  Recipe,
  RecipeJson,
  RecipeSettings,
} from '~/models';
import { Items, Machines, Recipes, Settings } from '~/store';

export class RecipeUtility {
  static MIN_FACTOR = rational(1n, 5n);
  static POLLUTION_FACTOR = rational(60n);
  static MIN_FACTORIO_RECIPE_TIME = rational(1n, 60n);

  /** Determines what option to use based on preferred rank */
  static bestMatch(options: string[], rank: string[]): string {
    if (options.length > 1) {
      for (const r of rank) {
        // Return first matching option in rank list
        if (options.includes(r)) return r;
      }
    }
    return options[0];
  }

  static fuelOptions(
    entity: MachineJson | Machine,
    data: Dataset,
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
    entity: Machine | Beacon,
    data: Dataset,
    recipeId?: string,
  ): SelectItem<string>[] {
    // Get all modules
    let allowed = data.moduleIds
      .map((i) => data.itemEntities[i])
      .filter(fnPropsNotNullish('module'));

    let recipe: Recipe | undefined;
    if (recipeId != null) {
      recipe = data.recipeEntities[recipeId];
      if (
        data.game === Game.Satisfactory ||
        (!recipe.isMining && !recipe.isTechnology)
      ) {
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
    if (
      (data.game !== Game.Satisfactory || !recipe?.isMining) &&
      data.game !== Game.FinalFactory
    ) {
      options.unshift({ label: 'None', value: ItemId.Module });
    }
    return options;
  }

  /** Determines default modules for a recipe/machine */
  static defaultModules(
    options: SelectItem<string>[],
    moduleRankIds: string[] | undefined,
    count: Rational | true | undefined,
    machineValue?: ModuleSettings[] | undefined,
  ): ModuleSettings[] | undefined {
    if (count == null) return undefined;

    if (machineValue) {
      const set = new Set(options.map((o) => o.value));
      if (machineValue.every((m) => m.id && set.has(m.id))) return machineValue;
    }

    const id = this.bestMatch(
      options.map((o) => o.value),
      coalesce(moduleRankIds, []),
    );
    count = count === true ? rational(0n) : count;
    return [{ id, count }];
  }

  static adjustRecipe(
    recipeId: string,
    recipeSettings: RecipeSettings,
    itemsState: Entities<ItemSettings>,
    settings: Settings.SettingsState,
    data: Dataset,
  ): AdjustedRecipe {
    const recipe: AdjustedRecipe = {
      ...cloneRecipe(data.recipeEntities[recipeId]),
      ...{ productivity: rational(1n), produces: new Set(), output: {} },
    };

    const {
      proliferatorSprayId,
      miningBonus,
      researchBonus,
      netProductionOnly,
    } = settings;

    const miningFactor = miningBonus.div(rational(100n));
    const researchFactor = researchBonus
      .add(rational(100n))
      .div(rational(100n));

    if (recipeSettings.machineId != null) {
      const machine = data.machineEntities[recipeSettings.machineId];

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
        let minSpeed = rational(0n);
        for (const b of belts.filter((b): b is Belt => b != null)) {
          if (minSpeed.lt(b.speed)) minSpeed = b.speed;
        }
        recipe.time = recipe.time.div(minSpeed);
      }

      if (recipe.isTechnology && data.game === Game.Factorio) {
        // Adjust for research factor
        recipe.time = recipe.time.div(researchFactor);
      }

      // Calculate factors
      let speed = rational(1n);
      let prod = rational(1n);
      let consumption = rational(1n);
      let pollution = rational(1n);

      if (recipe.isMining) {
        // Adjust for mining bonus
        prod = prod.add(miningFactor);
      }

      const proliferatorSprays: Entities<Rational> = {};

      // Modules
      if (recipeSettings.modules) {
        for (const { id, count } of recipeSettings.modules) {
          if (id == null || count == null) continue;
          const module = data.moduleEntities[id];
          if (module == null) continue;

          // Scale Satisfactory Somersloop bonus based on number of slots
          let scale: Rational | undefined;
          if (
            data.game === Game.Satisfactory &&
            id === ItemId.Somersloop &&
            machine.modules instanceof Rational
          )
            scale = machine.modules;

          if (module.speed) {
            speed = speed.add(module.speed.mul(count));
          }

          if (module.productivity) {
            let effect = module.productivity.mul(count);

            if (scale) effect = effect.div(scale);

            prod = prod.add(effect);
          }

          if (module.consumption) {
            let effect = module.consumption.mul(count);

            if (scale) {
              // Overall effect = (1 + filled slots / total slots) ^ 2
              effect = effect.div(scale).add(rational(1n));
              effect = effect.mul(effect).sub(rational(1n));
            }

            consumption = consumption.add(effect);
          }

          if (module.pollution) {
            pollution = pollution.add(module.pollution.mul(count));
          }

          // Note: Count is ignored for proliferator / sprays (assumed to be 1)
          if (module.sprays) {
            let sprays = module.sprays;
            // If proliferator is applied to proliferator, apply productivity bonus to sprays
            const pModule = data.moduleEntities[proliferatorSprayId];
            if (pModule) {
              sprays = sprays
                .mul(
                  rational(1n).add(
                    coalesce(pModule.productivity, rational(0n)),
                  ),
                )
                .floor(); // DSP rounds down # of sprays
            }
            // Calculate amount of proliferator required for this recipe
            const pId = module.proliferator;
            if (pId) {
              if (!proliferatorSprays[pId]) {
                proliferatorSprays[pId] = rational(0n);
              }
              proliferatorSprays[pId] = proliferatorSprays[pId].add(sprays);
            }
          }
        }
      }

      // Beacons
      if (recipeSettings.beacons != null) {
        for (const beaconSettings of recipeSettings.beacons) {
          if (
            !beaconSettings.count?.nonzero() ||
            beaconSettings.id == null ||
            beaconSettings.modules == null
          ) {
            continue;
          }

          for (const { id, count } of beaconSettings.modules) {
            if (id == null || id === ItemId.Module || count == null) continue;
            const module = data.moduleEntities[id];
            const beacon = data.beaconEntities[beaconSettings.id];
            const factor = beaconSettings.count // Num of beacons
              .mul(beacon.effectivity) // Effectivity of beacons
              .mul(count); // Num of modules/beacon

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
      if (
        recipeSettings.overclock &&
        !recipeSettings.overclock.eq(rational(100n))
      ) {
        oc = recipeSettings.overclock.div(rational(100n));
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
          if (affected.gt(rational(0n))) {
            recipe.out[outId] = catalyst.add(affected.mul(prod));
          }
        } else {
          recipe.out[outId] = recipe.out[outId].mul(prod);
        }
      }

      recipe.productivity = prod;

      // Power
      recipe.drain = machine.drain;
      let usage = (recipe.usage ? recipe.usage : machine.usage) || rational(0n);
      if (oc) {
        if (usage?.gt(rational(0n))) {
          // Polynomial effect only on production buildings, not power generation
          const factor = Math.pow(oc.toNumber(), 1.321928);
          usage = usage.mul(rational(factor));
        } else {
          usage = usage.mul(oc);
        }
      }

      recipe.consumption =
        machine.type === EnergyType.Electric
          ? usage.mul(consumption)
          : rational(0n);

      if (data.game === Game.Satisfactory && recipe.consumption?.nonzero()) {
        recipe.drain = recipe.consumption;
        delete recipe.consumption;
      }

      // Pollution
      recipe.pollution =
        machine.pollution && recipeSettings.machineId !== ItemId.Pumpjack
          ? machine.pollution
              .div(this.POLLUTION_FACTOR)
              .mul(pollution)
              .mul(consumption)
          : rational(0n);

      // Add machine consumption
      if (machine.consumption) {
        const consumption = machine.consumption;
        for (const id of Object.keys(consumption)) {
          const amount = recipe.time.div(rational(60n)).mul(consumption[id]);
          recipe.in[id] = (recipe.in[id] || rational(0n)).add(amount);
        }
      }

      // Calculate burner fuel inputs
      if (recipeSettings.fuelId) {
        const fuel = data.fuelEntities[recipeSettings.fuelId];

        if (fuel) {
          const fuelIn = recipe.time
            .mul(usage)
            .div(fuel.value)
            .div(rational(1000n));

          recipe.in[recipeSettings.fuelId] = (
            recipe.in[recipeSettings.fuelId] || rational(0n)
          ).add(fuelIn);

          if (fuel.result) {
            recipe.out[fuel.result] = (
              recipe.out[fuel.result] || rational(0n)
            ).add(fuelIn);
          }
        }
      }

      // Calculate proliferator usage
      if (Object.keys(proliferatorSprays).length > 0) {
        const proliferatorUses: Entities<Rational> = {};

        for (const pId of Object.keys(proliferatorSprays)) {
          proliferatorUses[pId] = rational(0n);

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
            .mul(rational(1n).add(coalesce(pModule.productivity, rational(0n))))
            .floor() // DSP rounds down # of sprays
            .sub(rational(1n)); // Subtract one spray of self
          let usage = rational(0n);
          for (const id of Object.keys(proliferatorUses)) {
            const amount = proliferatorUses[id].div(sprays);
            usage = usage.add(amount);
          }
          const pId = pModule.proliferator;
          if (pId) {
            if (!proliferatorUses[pId]) {
              proliferatorUses[pId] = rational(0n);
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
    recipe: Recipe,
    settings: Entities<RecipeSettings>,
    data: AdjustedDataset,
  ): void {
    if (!recipe.part) return;
    const partMachineId = settings[recipe.part].machineId;
    if (!partMachineId) return;
    const rocketMachine = data.machineEntities[partMachineId];
    if (!rocketMachine?.silo) return;

    const rocketRecipe = data.adjustedRecipe[recipe.part];
    const itemId = Object.keys(rocketRecipe.out)[0];
    const factor = rocketMachine.silo.parts.div(rocketRecipe.out[itemId]);
    recipe.time = rocketRecipe.time.mul(factor);
  }

  /** Adjust rocket launch and rocket part recipes */
  static adjustSiloRecipes(
    adjustedRecipe: Entities<AdjustedRecipe>,
    settings: Entities<RecipeSettings>,
    data: Dataset,
  ): Entities<AdjustedRecipe> {
    for (const partId of Object.keys(adjustedRecipe)) {
      const partMachineId = settings[partId].machineId;
      if (!partMachineId) continue;

      const rocketMachine = data.machineEntities[partMachineId];
      const rocketRecipe = adjustedRecipe[partId];
      if (!rocketMachine?.silo || rocketRecipe.part) continue;

      const itemId = Object.keys(rocketRecipe.out)[0];
      const factor = rocketMachine.silo.parts.div(rocketRecipe.out[itemId]);
      for (const launchId of Object.keys(adjustedRecipe).filter(
        (i) =>
          adjustedRecipe[i].part === partId &&
          settings[i].machineId === partMachineId,
      )) {
        adjustedRecipe[launchId].time = rocketRecipe.time
          .mul(factor)
          .add(rocketMachine.silo.launch);
      }

      rocketRecipe.time = rocketRecipe.time
        .mul(factor)
        .add(rocketMachine.silo.launch)
        .div(factor);
    }

    return adjustedRecipe;
  }

  static allowsModules(recipe: RecipeJson | Recipe, machine: Machine): boolean {
    return (!machine.silo || !recipe.part) && !!machine.modules;
  }

  static adjustDataset(
    recipeIds: string[],
    excludedRecipeIds: string[],
    recipesState: Entities<RecipeSettings>,
    itemsState: Entities<ItemSettings>,
    settings: Settings.SettingsState,
    data: Dataset,
  ): AdjustedDataset {
    const adjustedRecipe = this.adjustRecipes(
      recipeIds,
      recipesState,
      itemsState,
      settings,
      data,
    );
    this.adjustCosts(
      recipeIds,
      adjustedRecipe,
      recipesState,
      settings.costs,
      data,
    );
    return this.finalizeData(
      recipeIds,
      excludedRecipeIds,
      adjustedRecipe,
      data,
    );
  }

  static adjustRecipes(
    recipeIds: string[],
    recipesState: Entities<RecipeSettings>,
    itemsState: Entities<ItemSettings>,
    settings: Settings.SettingsState,
    data: Dataset,
  ): Entities<AdjustedRecipe> {
    return this.adjustSiloRecipes(
      recipeIds.reduce((e: Entities<AdjustedRecipe>, i) => {
        e[i] = this.adjustRecipe(
          i,
          recipesState[i],
          itemsState,
          settings,
          data,
        );
        return e;
      }, {}),
      recipesState,
      data,
    );
  }

  static adjustCosts(
    recipeIds: string[],
    adjustedRecipe: Entities<Recipe>,
    recipesState: Entities<RecipeSettings>,
    costs: CostSettings,
    data: Dataset,
  ): void {
    recipeIds
      .map((i) => adjustedRecipe[i])
      .forEach((recipe) => {
        const settings = recipesState[recipe.id];
        if (settings.cost) {
          recipe.cost = settings.cost;
        } else if (recipe.cost) {
          // Recipe has a declared cost, base this on output items not machines
          // Calculate total output, sum, and multiply cost by output
          const output = Object.keys(recipe.out)
            .reduce((v, o) => v.add(recipe.out[o]), rational(0n))
            .div(recipe.time);
          recipe.cost = output.mul(recipe.cost).mul(costs.factor);
        } else {
          recipe.cost = costs.machine;
          if (settings.machineId != null && costs.footprint.nonzero()) {
            // Adjust based on machine size
            const machine = data.machineEntities[settings.machineId];
            if (machine.size != null) {
              recipe.cost = recipe.cost.mul(
                rational(machine.size[0] * machine.size[1]),
              );
            }
          }
        }
      });
  }

  static finalizeData(
    recipeIds: string[],
    excludedRecipeIds: string[],
    adjustedRecipe: Entities<AdjustedRecipe>,
    data: Dataset,
  ): AdjustedDataset {
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
      .map((i) => adjustedRecipe[i])
      .forEach((recipe) => {
        finalizeRecipe(recipe);
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
        adjustedRecipe,
        itemRecipeIds,
        itemIncludedRecipeIds,
        itemIncludedIoRecipeIds,
      },
    };
  }

  static adjustObjective(
    objective: Objective,
    itemsState: Items.ItemsState,
    recipesState: Recipes.RecipesState,
    machinesState: Machines.MachinesState,
    settings: Settings.SettingsState,
    data: AdjustedDataset,
  ): Objective {
    if (!isRecipeObjective(objective)) return objective;

    objective = { ...objective };
    const recipe = data.recipeEntities[objective.targetId];

    if (objective.machineId == null) {
      objective.machineId = this.bestMatch(
        recipe.producers,
        coalesce(machinesState.ids, []),
      );
    }

    const machine = data.machineEntities[objective.machineId];
    const def = machinesState.entities[objective.machineId];

    if (recipe.isBurn) {
      objective.fuelId = Object.keys(recipe.in)[0];
    } else {
      objective.fuelId = objective.fuelId ?? def?.fuelId;
    }

    if (machine != null && this.allowsModules(recipe, machine)) {
      objective.moduleOptions = this.moduleOptions(
        machine,
        data,
        objective.targetId,
      );
      objective.modules = this.hydrateModules(
        objective.modules,
        objective.moduleOptions,
        coalesce(machinesState.moduleRankIds, []),
        machine.modules,
        def.modules,
      );
      objective.beacons = this.hydrateBeacons(objective.beacons, def.beacons);
    } else {
      // Machine doesn't support modules, remove any
      delete objective.modules;
      delete objective.beacons;
    }

    objective.overclock = objective.overclock ?? def.overclock;

    objective.recipe = RecipeUtility.adjustRecipe(
      objective.targetId,
      objective,
      itemsState,
      settings,
      data,
    );
    RecipeUtility.adjustLaunchRecipeObjective(
      objective.recipe,
      recipesState,
      data,
    );
    finalizeRecipe(objective.recipe);

    return objective;
  }

  static dehydrateModules(
    value: ModuleSettings[],
    options: SelectItem<string>[],
    moduleRankIds: string[],
    count: Rational | true | undefined,
    machineValue?: ModuleSettings[] | undefined,
  ): ModuleSettings[] | undefined {
    const def = this.defaultModules(
      options,
      moduleRankIds,
      count,
      machineValue,
    );
    if (areArraysEqual(value, def, areModuleSettingsEqual)) return undefined;

    const moduleId = this.bestMatch(
      options.map((o) => o.value),
      moduleRankIds,
    );
    const moduleCount = count === true || count == null ? rational(0n) : count;
    const result = value
      // Exclude empty module entry
      .filter((m) => m.id !== ItemId.Module)
      .map((m) => {
        const r = {} as ModuleSettings;
        if (m.id !== moduleId) r.id = m.id;
        if (m.id == null || !m.count?.eq(moduleCount)) r.count = m.count;
        return r;
      });

    return result;
  }

  static hydrateModules(
    value: ModuleSettings[] | undefined,
    options: SelectItem<string>[],
    moduleRankIds: string[],
    count: Rational | true | undefined,
    machineValue?: ModuleSettings[] | undefined,
  ): ModuleSettings[] | undefined {
    if (value == null)
      return this.defaultModules(options, moduleRankIds, count, machineValue);

    const moduleCount = count === true || count == null ? rational(0n) : count;
    const moduleId = this.bestMatch(
      options.map((o) => o.value),
      moduleRankIds,
    );
    const result = value.map((m) => ({
      count: coalesce(m.count, moduleCount),
      id: coalesce(m.id, moduleId),
    }));

    if (moduleCount.nonzero()) {
      // Restore empty module entry
      const total = result.reduce((a, b) => a.add(b.count), rational(0n));
      const empty = moduleCount.sub(total);
      if (empty.gt(rational(0n)))
        result.push({ count: empty, id: ItemId.Module });
    }

    return result;
  }

  static dehydrateBeacons(
    value: BeaconSettings[],
    def: BeaconSettings[] | undefined,
  ): BeaconSettings[] | undefined {
    if (areArraysEqual(value, def, areBeaconSettingsEqual)) return undefined;

    if (def == null || def.length === 0) return value;

    const beaconSettings = def[0];
    const moduleId = beaconSettings?.modules?.[0].id;
    const moduleCount = coalesce(
      beaconSettings?.modules?.[0].count,
      rational(0n),
    );
    const result = value.map((b) => {
      const r = {} as BeaconSettings;
      if (b.id && b.id !== beaconSettings.id) r.id = b.id;
      if (!b.count?.eq(coalesce(beaconSettings.count, rational(0n))))
        r.count = b.count;
      if (
        !areArraysEqual(
          b.modules,
          beaconSettings.modules,
          areModuleSettingsEqual,
        )
      )
        r.modules = b.modules
          ?.filter((m) => m.id !== ItemId.Module)
          .map((m) => {
            const r = {} as ModuleSettings;
            if (m.id !== moduleId) r.id = m.id;
            if (!m.count?.eq(moduleCount)) r.count = m.count;
            return r;
          });
      if (b.total) r.total = b.total;
      return r;
    });

    if (result.every((r) => Object.keys(r).length === 0)) return [];

    return result;
  }

  static hydrateBeacons(
    value: BeaconSettings[] | undefined,
    def: BeaconSettings[] | undefined,
  ): BeaconSettings[] | undefined {
    if (value == null || def == null || def.length === 0) return def;

    const beaconSettings = def[0];
    const moduleSettings = beaconSettings.modules?.[0];
    const result = value.map((b) => ({
      id: coalesce(b.id, beaconSettings.id),
      count: b.count ?? beaconSettings.count,
      modules: coalesce(
        b.modules?.map((m) => ({
          id: coalesce(m.id, moduleSettings?.id),
          count: coalesce(m.count, moduleSettings?.count),
        })),
        beaconSettings.modules,
      ),
      total: coalesce(b.total, beaconSettings.total),
    }));

    if (moduleSettings?.count == null) return result;

    return result.map((b) => {
      // Restore empty module entry
      // Safe to assert b.modules != null because code would have returned early
      // above; each entry's modules have already been coalesced
      const total = b.modules!.reduce(
        (a, b) => a.add(coalesce(b.count, rational(0n))),
        rational(0n),
      );
      const empty = moduleSettings?.count?.sub(total);
      if (empty?.gt(rational(0n)))
        b.modules!.push({ count: empty, id: ItemId.Module });

      return b;
    });
  }
}
