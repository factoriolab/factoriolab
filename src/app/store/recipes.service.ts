import { computed, inject, Injectable } from '@angular/core';

import { coalesce, spread } from '~/helpers';
import { Recipe } from '~/models/data/recipe';
import { Dataset } from '~/models/dataset';
import { EnergyType } from '~/models/enum/energy-type';
import { RecipeSettings, RecipeState } from '~/models/settings/recipe-settings';
import { Settings } from '~/models/settings/settings';
import { Entities } from '~/models/utils';
import { RecipeUtility } from '~/utilities/recipe.utility';

import { ItemsService } from './items.service';
import { MachinesService, MachinesSettings } from './machines.service';
import { SettingsService } from './settings.service';
import { EntityStore } from './store';

export type RecipesState = Entities<RecipeState>;
export type RecipesSettings = Entities<RecipeSettings>;

@Injectable({
  providedIn: 'root',
})
export class RecipesService extends EntityStore<RecipeState> {
  itemsSvc = inject(ItemsService);
  machinesSvc = inject(MachinesService);
  settingsSvc = inject(SettingsService);

  settings = computed(() =>
    RecipesService.computeRecipesSettings(
      this.state(),
      this.machinesSvc.settings(),
      this.settingsSvc.settings(),
      this.settingsSvc.dataset(),
    ),
  );

  adjustedDataset = computed(() => {
    const recipesState = this.settings();
    const itemsState = this.itemsSvc.settings();
    const recipeIds = this.settingsSvc.availableRecipeIds();
    const settings = this.settingsSvc.settings();
    const data = this.settingsSvc.dataset();

    return RecipeUtility.adjustDataset(
      recipeIds,
      recipesState,
      itemsState,
      settings,
      data,
    );
  });

  availableItemIds = computed(() => {
    const data = this.adjustedDataset();
    return data.itemIds.filter((i) => data.itemRecipeIds[i].length);
  });

  static computeRecipesSettings(
    state: RecipesState,
    machines: MachinesSettings,
    settings: Settings,
    data: Dataset,
  ): RecipesSettings {
    const value: RecipesSettings = {};
    for (const recipe of data.recipeIds.map((i) => data.recipeEntities[i])) {
      const s: RecipeSettings = spread(state[recipe.id]);
      this.computeRecipeSettings(s, recipe, machines, settings, data);
      value[recipe.id] = s;
    }

    return value;
  }

  static computeRecipeSettings(
    s: RecipeSettings,
    recipe: Recipe,
    machines: MachinesSettings,
    settings: Settings,
    data: Dataset,
  ): void {
    s.defaultMachineId = RecipeUtility.bestMatch(
      recipe.producers,
      settings.machineRankIds,
    );
    s.machineId = coalesce(s.machineId, s.defaultMachineId);

    const machine = data.machineEntities[s.machineId];
    const def = machines[s.machineId];

    if (recipe.isBurn) {
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

    if (machine != null && RecipeUtility.allowsModules(recipe, machine)) {
      s.moduleOptions = RecipeUtility.moduleOptions(machine, data, recipe.id);
      s.modules = RecipeUtility.hydrateModules(
        s.modules,
        s.moduleOptions,
        settings.moduleRankIds,
        machine.modules,
        def.modules,
      );
      s.beacons = RecipeUtility.hydrateBeacons(s.beacons, def.beacons);
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
}
