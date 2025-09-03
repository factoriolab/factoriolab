import { inject, Injectable } from '@angular/core';

import { EnergyType } from '~/data/schema/energy-type';
import { Machine, PUMPJACK } from '~/data/schema/machine';
import {
  effectPrecision,
  effects,
  ModuleEffect,
  SOMERSLOOP,
} from '~/data/schema/module';
import {
  baseId,
  itemHasQuality,
  Quality,
  qualityId,
} from '~/data/schema/quality';
import {
  AdjustedRecipe,
  cloneRecipe,
  finalizeRecipe,
  Recipe,
  RecipeJson,
} from '~/data/schema/recipe';
import { Rational, rational } from '~/rational/rational';
import { coalesce, notNullish } from '~/utils/nullish';
import { spread } from '~/utils/object';

import { Hydration } from './hydration';
import { ItemSettings } from './items/item-settings';
import { ItemState } from './items/item-state';
import { MachineSettings } from './machines/machine-settings';
import {
  isRecipeObjective,
  ObjectiveSettings,
  ObjectiveState,
} from './objectives/objective';
import { Options } from './options';
import { RecipeSettings } from './recipes/recipe-settings';
import { RecipeState } from './recipes/recipe-state';
import { CostSettings } from './settings/cost-settings';
import { AdjustedDataset, Dataset } from './settings/dataset';
import { Settings } from './settings/settings';

@Injectable({ providedIn: 'root' })
export class Adjustment {
  private readonly hydration = inject(Hydration);
  private readonly options = inject(Options);

  private readonly maxFactor = rational(4n);
  private readonly minFactor = rational(1n, 5n);
  private readonly pollutionFactor = rational(60n);
  private readonly minFactorioRecipeTime = rational(1n, 60n);

  adjustRecipe(
    recipeId: string,
    recipeState: RecipeState,
    itemsState: Record<string, ItemState>,
    settings: Settings,
    data: Dataset,
  ): AdjustedRecipe {
    const recipe = spread(
      cloneRecipe(data.recipeRecord[recipeId]) as AdjustedRecipe,
      {
        effects: {
          consumption: rational.one,
          pollution: rational.one,
          productivity: rational.one,
          quality: rational.zero,
          speed: rational.one,
        },
        produces: new Set(),
        output: {},
      },
    );

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

    if (recipeState.machineId != null) {
      const machine = data.machineRecord[recipeState.machineId];

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
        const speeds = ids
          .map((i) => {
            const state = itemsState[i];
            const beltId = state.beltId;
            if (beltId == null) return undefined;
            return data.beltRecord[beltId].speed.mul(
              coalesce(state.stack, rational.one),
            );
          })
          .filter(notNullish);
        let minSpeed = undefined;
        for (const speed of speeds) {
          if (minSpeed == null || minSpeed.lt(speed)) minSpeed = speed;
        }

        if (minSpeed != null && !minSpeed.isZero())
          recipe.time = recipe.time.div(minSpeed);
      }

      if (recipe.flags.has('technology') && data.flags.has('researchSpeed')) {
        // Adjust for research factor
        recipe.time = recipe.time.div(researchFactor);
      }

      // Calculate factors
      const eff = recipe.effects;

      // Adjust for mining bonus
      if (recipe.flags.has('mining'))
        eff.productivity = eff.productivity.add(miningFactor);

      // Adjust for base productivity
      if (machine.baseEffect) {
        const keys = Object.keys(machine.baseEffect) as ModuleEffect[];
        for (const k of keys) {
          if (machine.baseEffect[k]) eff[k] = eff[k].add(machine.baseEffect[k]);
        }
      }

      // Adjust for technology bonus
      if (recipeState.productivity)
        eff.productivity = eff.productivity.add(
          recipeState.productivity.div(rational(100n)),
        );

      const proliferatorSprays: Record<string, Rational> = {};

      // Modules
      if (recipeState.modules) {
        for (const { id, count } of recipeState.modules) {
          if (id == null || count == null) continue;
          const module = data.moduleRecord[id];
          if (module == null) continue;

          // Scale Satisfactory Somersloop bonus based on number of slots
          let scale: Rational | undefined;
          if (
            data.flags.has('somersloop') &&
            id === SOMERSLOOP &&
            machine.modules instanceof Rational
          )
            scale = machine.modules;

          if (module.speed) eff.speed = eff.speed.add(module.speed.mul(count));

          if (module.productivity) {
            let effect = module.productivity.mul(count);

            if (scale) effect = effect.div(scale);

            eff.productivity = eff.productivity.add(effect);
          }

          if (module.consumption) {
            let effect = module.consumption.mul(count);

            if (scale) {
              // Overall effect = (1 + filled slots / total slots) ^ 2
              effect = effect.div(scale).add(rational.one);
              effect = effect.mul(effect).sub(rational.one);
            }

            eff.consumption = eff.consumption.add(effect);
          }

          if (module.pollution)
            eff.pollution = eff.pollution.add(module.pollution.mul(count));

          if (module.quality)
            eff.quality = eff.quality.add(module.quality.mul(count));

          // Note: Count is ignored for proliferator / sprays (assumed to be 1)
          if (module.sprays) {
            let sprays = module.sprays;
            // If proliferator is applied to proliferator, apply productivity bonus to sprays
            const pModule = data.moduleRecord[proliferatorSprayId];
            if (pModule) {
              sprays = sprays
                .mul(
                  rational.one.add(
                    coalesce(pModule.productivity, rational.zero),
                  ),
                )
                .floor(); // DSP rounds down # of sprays
            }
            // Calculate amount of proliferator required for this recipe
            const pId = module.proliferator;
            if (pId) {
              if (!proliferatorSprays[pId]) {
                proliferatorSprays[pId] = rational.zero;
              }
              proliferatorSprays[pId] = proliferatorSprays[pId].add(sprays);
            }
          }
        }
      }

      // Beacons
      if (recipeState.beacons != null) {
        let profileIndex: number | undefined;
        if (data.flags.has('diminishingBeacons')) {
          const total = recipeState.beacons.reduce(
            (t, b) => t.add(coalesce(b.count, rational.zero)),
            rational.zero,
          );
          profileIndex = Math.round(total.toNumber()) - 1;
        }

        for (const beaconSettings of recipeState.beacons) {
          if (
            !beaconSettings.count?.nonzero() ||
            beaconSettings.id == null ||
            beaconSettings.modules == null
          ) {
            continue;
          }

          const beacon = data.beaconRecord[beaconSettings.id];

          let scale = rational.one;
          if (
            beacon.profile &&
            profileIndex &&
            profileIndex >= 0 &&
            profileIndex < beacon.profile.length
          )
            scale = beacon.profile[profileIndex];

          const factor = beaconSettings.count.mul(scale);
          const beaconEffects: Partial<Record<ModuleEffect, Rational>> = {};
          for (const { id, count } of beaconSettings.modules) {
            if (!id || count == null) continue;
            const module = data.moduleRecord[id];

            for (const effect of effects) {
              if (!module[effect]) continue;

              const value = module[effect]
                .mul(count)
                .mul(beacon.effectivity)
                .trunc(effectPrecision[effect]);
              const current = beaconEffects[effect];
              beaconEffects[effect] = current ? current.add(value) : value;
            }
          }

          for (const effect of Object.keys(beaconEffects) as ModuleEffect[]) {
            const value = beaconEffects[effect];
            // istanbul ignore if: Should be impossible to hit
            if (value == null || value.isZero()) continue;

            const result = value // Effect from modules
              .mul(factor)
              .round(effectPrecision[effect]); // Apply count of beacons, scaling

            eff[effect] = eff[effect].add(result);
          }
        }
      }

      // Overclock effects
      let oc: Rational | undefined;
      if (recipeState.overclock && !recipeState.overclock.eq(rational(100n))) {
        oc = recipeState.overclock.div(rational(100n));
        eff.speed = eff.speed.mul(oc);
      }

      if (data.flags.has('minimumFactor')) {
        // Check for speed, consumption, or pollution below minimum value (20%)
        if (eff.speed.lt(this.minFactor)) eff.speed = this.minFactor;
        if (eff.consumption.lt(this.minFactor))
          eff.consumption = this.minFactor;
        if (eff.pollution.lt(this.minFactor)) eff.pollution = this.minFactor;
      }

      if (data.flags.has('maximumFactor') && !recipe.flags.has('mining')) {
        // Check for productivity over maximum value (300%)
        if (eff.productivity.gt(this.maxFactor))
          eff.productivity = this.maxFactor;
      }

      // Calculate module/beacon effects
      // Speed
      recipe.time = recipe.time.div(eff.speed);

      // In Factorio 1.x, minimum recipe time is 1/60s (1 tick)
      if (
        recipe.time.lt(this.minFactorioRecipeTime) &&
        data.flags.has('minimumRecipeTime')
      )
        recipe.time = this.minFactorioRecipeTime;

      // Productivity
      for (const outId of Object.keys(recipe.out)) {
        if (recipe.catalyst?.[outId]) {
          // Catalyst - only multiply prod by extra produced
          const catalyst = recipe.catalyst[outId];
          const affected = recipe.out[outId].sub(catalyst);
          // Only change output if affected amount > 0
          if (affected.gt(rational.zero))
            recipe.out[outId] = catalyst.add(affected.mul(eff.productivity));
        } else recipe.out[outId] = recipe.out[outId].mul(eff.productivity);
      }

      // Power
      recipe.drain = machine.drain;
      let usage = recipe.usage ?? machine.usage ?? rational.zero;
      if (oc) {
        // Polynomial effect only on production buildings, not power generation
        if (usage?.gt(rational.zero)) usage = usage.mul(oc.pow(1.321928));
        else usage = usage.mul(oc);
      }

      usage = usage.mul(eff.consumption);
      recipe.consumption =
        machine.type === EnergyType.Electric ? usage : rational.zero;

      if (
        data.flags.has('consumptionAsDrain') &&
        recipe.consumption?.nonzero()
      ) {
        recipe.drain = recipe.consumption;
        delete recipe.consumption;
      }

      // Pollution
      recipe.pollution =
        machine.pollution && recipeState.machineId !== PUMPJACK
          ? machine.pollution
              .div(this.pollutionFactor)
              .mul(eff.pollution)
              .mul(eff.consumption)
          : rational.zero;

      // Adjust for ingredient usage (Space Age: Biolab)
      if (machine.ingredientUsage) {
        for (const i of Object.keys(recipe.in)) {
          recipe.in[i] = recipe.in[i].mul(machine.ingredientUsage);
        }
      }

      // Adjust for quality
      if (data.flags.has('quality') && eff.quality.gt(rational.zero)) {
        for (const outId of Object.keys(recipe.out)) {
          // Adjust by factor
          const item = data.itemRecord[outId];
          if (!itemHasQuality(item)) continue;
          const original = recipe.out[outId];
          let amount = original;
          const id = baseId(outId);
          let lastId: string | undefined;
          for (
            let i = recipe.quality ?? Quality.Normal;
            i <= settings.quality;
            i++
          ) {
            if (i === (4 as unknown as Quality)) continue;
            const qId = qualityId(id, i);
            if (lastId == null) {
              amount = amount.mul(eff.quality);
              lastId = qId;
            } else {
              recipe.out[lastId] = recipe.out[lastId].sub(amount);
              recipe.out[qId] = amount;
              amount = amount.mul(rational(1n, 10n));
              lastId = qId;
            }
          }
        }
      }

      // Add machine consumption
      if (machine.consumption) {
        const consumption = machine.consumption;
        for (const id of Object.keys(consumption)) {
          const amount = recipe.time.div(rational(60n)).mul(consumption[id]);
          recipe.in[id] = (recipe.in[id] || rational.zero).add(amount);
        }
      }

      // Calculate burner fuel inputs
      if (recipeState.fuelId) {
        const fuel = data.fuelRecord[recipeState.fuelId];

        if (fuel) {
          const fuelIn = recipe.time
            .mul(usage)
            .div(fuel.value)
            .div(rational(1000n));

          recipe.in[recipeState.fuelId] = (
            recipe.in[recipeState.fuelId] || rational.zero
          ).add(fuelIn);

          if (fuel.result) {
            recipe.out[fuel.result] = (
              recipe.out[fuel.result] || rational.zero
            ).add(fuelIn);
          }
        }
      }

      // Calculate proliferator usage
      if (Object.keys(proliferatorSprays).length > 0) {
        const proliferatorUses: Record<string, Rational> = {};

        for (const pId of Object.keys(proliferatorSprays)) {
          proliferatorUses[pId] = rational.zero;

          for (const id of Object.keys(recipe.in)) {
            const sprays = proliferatorSprays[pId];
            const amount = recipe.in[id].div(sprays);
            proliferatorUses[pId] = proliferatorUses[pId].add(amount);
          }
        }

        // If proliferator spray is applied to proliferator, add its usage to inputs
        const pModule = data.moduleRecord[proliferatorSprayId];
        if (pModule?.sprays) {
          const sprays = pModule.sprays
            .mul(
              rational.one.add(coalesce(pModule.productivity, rational.zero)),
            )
            .floor() // DSP rounds down # of sprays
            .sub(rational.one); // Subtract one spray of self
          let usage = rational.zero;
          for (const id of Object.keys(proliferatorUses)) {
            const amount = proliferatorUses[id].div(sprays);
            usage = usage.add(amount);
          }
          const pId = pModule.proliferator;
          if (pId) {
            if (!proliferatorUses[pId]) proliferatorUses[pId] = rational.zero;
            proliferatorUses[pId] = proliferatorUses[pId].add(usage);
          }
        }

        // Add proliferator consumption to recipe inputs
        // Assume recipe already has listed inputs, otherwise it could not be proliferated
        for (const pId of Object.keys(proliferatorUses)) {
          if (!recipe.in[pId]) recipe.in[pId] = proliferatorUses[pId];
          else recipe.in[pId] = recipe.in[pId].add(proliferatorUses[pId]);
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
  adjustLaunchRecipeObjective(
    recipe: Recipe,
    settings: Record<string, RecipeState>,
    data: AdjustedDataset,
  ): void {
    if (!recipe.part) return;
    const partMachineId = settings[recipe.part].machineId;
    if (!partMachineId) return;
    const rocketMachine = data.machineRecord[partMachineId];
    if (!rocketMachine?.silo) return;

    const rocketRecipe = data.adjustedRecipe[recipe.part];
    const itemId = Object.keys(rocketRecipe.out)[0];
    const factor = rocketMachine.silo.parts.div(rocketRecipe.out[itemId]);
    recipe.time = rocketRecipe.time.mul(factor);
  }

  /** Adjust rocket launch and rocket part recipes */
  adjustSiloRecipes(
    adjustedRecipe: Record<string, AdjustedRecipe>,
    settings: Record<string, RecipeState>,
    data: Dataset,
  ): Record<string, AdjustedRecipe> {
    for (const partId of Object.keys(adjustedRecipe)) {
      const partMachineId = settings[partId].machineId;
      if (!partMachineId) continue;

      const rocketMachine = data.machineRecord[partMachineId];
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

  allowsModules(recipe: RecipeJson | Recipe, machine: Machine): boolean {
    return (!machine.silo || !recipe.part) && !!machine.modules;
  }

  adjustDataset(
    recipes: Record<string, RecipeSettings>,
    items: Record<string, ItemSettings>,
    settings: Settings,
    data: Dataset,
  ): AdjustedDataset {
    const recipeIds = Array.from(settings.availableRecipeIds);
    const adjustedRecipe = this.adjustRecipes(
      recipeIds,
      recipes,
      items,
      settings,
      data,
    );
    this.adjustCosts(recipeIds, adjustedRecipe, recipes, settings.costs, data);
    return this.finalizeData(recipeIds, adjustedRecipe, settings, data);
  }

  adjustRecipes(
    availableRecipeIds: string[],
    recipes: Record<string, RecipeSettings>,
    items: Record<string, ItemSettings>,
    settings: Settings,
    data: Dataset,
  ): Record<string, AdjustedRecipe> {
    return this.adjustSiloRecipes(
      availableRecipeIds.reduce((e: Record<string, AdjustedRecipe>, i) => {
        e[i] = this.adjustRecipe(i, recipes[i], items, settings, data);
        return e;
      }, {}),
      recipes,
      data,
    );
  }

  adjustCosts(
    recipeIds: string[],
    adjustedRecipe: Record<string, Recipe>,
    recipes: Record<string, RecipeSettings>,
    costs: CostSettings,
    data: Dataset,
  ): void {
    recipeIds
      .map((i) => adjustedRecipe[i])
      .forEach((recipe) => {
        const settings = recipes[recipe.id];
        if (settings.cost) {
          recipe.cost = settings.cost;
        } else if (recipe.cost) {
          // Recipe has a declared cost, base this on output items not machines
          // Calculate total output, sum, and multiply cost by output
          const output = Object.keys(recipe.out)
            .reduce((v, o) => v.add(recipe.out[o]), rational.zero)
            .div(recipe.time);
          recipe.cost = output.mul(recipe.cost).mul(costs.factor);
        } else {
          recipe.cost = costs.machine;
          if (settings.machineId != null && costs.footprint.nonzero()) {
            // Adjust based on machine size
            const machine = data.machineRecord[settings.machineId];
            if (machine.size != null) {
              recipe.cost = recipe.cost.mul(
                rational(machine.size[0] * machine.size[1]),
              );
            }
          }
        }

        if (recipe.flags.has('recycling'))
          recipe.cost = recipe.cost.mul(costs.recycling);
      });
  }

  finalizeData(
    availableRecipeIds: string[],
    adjustedRecipe: Record<string, AdjustedRecipe>,
    settings: Settings,
    data: Dataset,
  ): AdjustedDataset {
    const itemRecipeIds: Record<string, string[]> = {};
    const itemAvailableRecipeIds: Record<string, string[]> = {};
    const itemAvailableIoRecipeIds: Record<string, string[]> = {};
    data.itemIds.forEach((i) => {
      itemRecipeIds[i] = [];
      itemAvailableRecipeIds[i] = [];
      itemAvailableIoRecipeIds[i] = [];
    });

    availableRecipeIds
      .map((i) => adjustedRecipe[i])
      .forEach((recipe) => {
        finalizeRecipe(recipe);
        Object.keys(recipe.out).forEach((productId) =>
          itemRecipeIds[productId].push(recipe.id),
        );

        if (!settings.excludedRecipeIds.has(recipe.id)) {
          recipe.produces.forEach((productId) =>
            itemAvailableRecipeIds[productId].push(recipe.id),
          );

          Object.keys(recipe.output).forEach((ioId) =>
            itemAvailableIoRecipeIds[ioId].push(recipe.id),
          );
        }
      });

    /**
     * Check whether ingredients are safe (ingredients are net-produceable, or
     * have no recipes in the entire data set based on `noRecipeItemIds`).
     * This only checks one level deep, but continues iterating over the list of
     * itemIds until it no longer finds any inviable recipes to remove. This
     * code is intended only to catch simple recycling loops that are infeasible
     * production solutions.
     */
    const removals: Record<string, [string, string][]> = {};
    let filtered = false;
    do {
      filtered = false;
      data.itemIds.forEach((itemId) => {
        itemAvailableRecipeIds[itemId] = itemAvailableRecipeIds[itemId].filter(
          (recipeId) => {
            const recipe = adjustedRecipe[recipeId];
            const result = Object.keys(recipe.in).every((ingredientId) => {
              if (
                // Ingredient is excluded
                settings.excludedItemIds.has(ingredientId) ||
                // Ingredient is not produceable by any included recipes
                itemAvailableRecipeIds[ingredientId].length === 0 ||
                // Ingredient is net-produced by this recipe
                recipe.produces.has(ingredientId)
              )
                return true;

              // Ingredient is net-produced by another recipe
              const result = itemAvailableRecipeIds[ingredientId]
                .map((r) => adjustedRecipe[r])
                .some(
                  (inputRecipe) =>
                    inputRecipe.output[itemId] == null ||
                    /**
                     * Determine how much of this item is consumed per cycle
                     * of the input recipe, then compare to how much is
                     * produced by the output recipe. If more is consumed than
                     * produced, the input recipe is an infeasible solution.
                     */
                    inputRecipe.output[itemId]
                      .mul(recipe.output[ingredientId])
                      .div(inputRecipe.output[ingredientId])
                      .lte(recipe.output[itemId]),
                );

              if (!result) {
                if (removals[ingredientId] == null)
                  removals[ingredientId] = [[itemId, recipeId]];
                else removals[ingredientId].push([itemId, recipeId]);
              }

              return result;
            });

            if (!result) filtered = true;

            return result;
          },
        );

        /**
         * In the very unlikely case that this algorithm:
         * 1) Removes a recipe because an ingredient cannot be produced
         * 2) Later determines that ingredient has no valid recipes at all
         * Algorithm needs to re-add this recipe as an option for the item.
         */
        if (
          // This ingredient cannot be produced
          itemAvailableRecipeIds[itemId].length === 0 &&
          // Some recipes were removed because of this ingredient
          removals[itemId]?.length
        ) {
          removals[itemId].forEach(([i, r]) =>
            itemAvailableRecipeIds[i].push(r),
          );
          delete removals[itemId];
          filtered = true;
        }
      });
    } while (filtered);

    return spread(data as AdjustedDataset, {
      adjustedRecipe,
      itemRecipeIds,
      itemAvailableRecipeIds,
      itemAvailableIoRecipeIds,
    });
  }

  computeRecipeSettings(
    s: RecipeSettings,
    recipe: Recipe,
    machines: Record<string, MachineSettings>,
    settings: Settings,
    data: Dataset,
  ): void {
    s.machineOptions = this.options.machineOptions(recipe, settings, data);
    s.defaultMachineId = this.options.bestMatch(
      s.machineOptions,
      settings.machineRankIds,
    );
    s.machineId = coalesce(s.machineId, s.defaultMachineId);

    const machine = data.machineRecord[s.machineId];
    const def = machines[s.machineId];

    if (recipe.flags.has('burn')) {
      s.defaultFuelId = Object.keys(recipe.in)[0];
      s.fuelId = s.defaultFuelId;
    } else if (machine.type === EnergyType.Burner) {
      s.defaultFuelId = def?.fuelId;
      s.fuelId = coalesce(s.fuelId, s.defaultFuelId);
      s.fuelOptions = def?.fuelOptions;
    } else {
      // Machine doesn't support fuel, remove any
      delete s.fuelId;
    }

    if (machine != null && this.allowsModules(recipe, machine)) {
      s.moduleOptions = this.options.moduleOptions(
        machine,
        settings,
        data,
        recipe.id,
      );
      s.modules = this.hydration.hydrateModules(
        s.modules,
        s.moduleOptions,
        settings.moduleRankIds,
        machine.modules,
        def.modules,
      );
      s.beacons = this.hydration.hydrateBeacons(s.beacons, def.beacons);
    } else {
      // Machine doesn't support modules, remove any
      delete s.modules;
      delete s.beacons;
    }

    if (s.beacons) {
      for (const beaconSettings of s.beacons) {
        if (
          beaconSettings.total != null &&
          (beaconSettings.count == null || beaconSettings.count.isZero())
        )
          // No actual beacons, ignore the total beacons
          delete beaconSettings.total;
      }
    }

    s.defaultOverclock = def?.overclock;
    s.overclock = coalesce(s.overclock, s.defaultOverclock);
  }

  adjustObjective(
    objective: ObjectiveState,
    items: Record<string, ItemSettings>,
    recipes: Record<string, RecipeSettings>,
    machines: Record<string, MachineSettings>,
    settings: Settings,
    data: AdjustedDataset,
  ): ObjectiveSettings {
    if (!isRecipeObjective(objective)) return objective;

    const result: ObjectiveSettings = spread(objective);
    const recipe = data.recipeRecord[result.targetId];
    // Apply productivity bonus, this cannot be adjusted on individual objectives
    result.productivity = recipes[result.targetId].productivity;
    this.computeRecipeSettings(result, recipe, machines, settings, data);

    result.recipe = this.adjustRecipe(
      result.targetId,
      result,
      items,
      settings,
      data,
    );
    this.adjustLaunchRecipeObjective(result.recipe, recipes, data);
    finalizeRecipe(result.recipe);

    return result;
  }
}
