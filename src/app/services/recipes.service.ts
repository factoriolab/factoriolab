import { computed, inject, Injectable } from '@angular/core';

import { Dataset } from '~/models/dataset';
import { RecipeSettings } from '~/models/settings/recipe-settings';
import { SettingsComplete } from '~/models/settings/settings-complete';
import { EntityStore } from '~/models/store';
import { Entities } from '~/models/utils';
import { RecipeUtility } from '~/utilities/recipe.utility';

import { ItemsService } from './items.service';
import { MachinesService, MachinesState } from './machines.service';
import { SettingsService } from './settings.service';

export type RecipesState = Entities<RecipeSettings>;

@Injectable({
  providedIn: 'root',
})
export class RecipesService extends EntityStore<RecipeSettings> {
  itemsSvc = inject(ItemsService);
  machinesSvc = inject(MachinesService);
  settingsSvc = inject(SettingsService);

  recipesState = computed(() =>
    RecipesService.computeRecipesState(
      this.state(),
      this.machinesSvc.machinesState(),
      this.settingsSvc.settings(),
      this.settingsSvc.dataset(),
    ),
  );

  adjustedDataset = computed(() => {
    const recipesState = this.recipesState();
    const itemsState = this.itemsSvc.itemsState();
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

  constructor() {
    super({});
  }

  static computeRecipesState(
    state: RecipesState,
    machinesState: MachinesState,
    settings: SettingsComplete,
    data: Dataset,
  ): RecipesState {
    const value: Entities<RecipeSettings> = {};
    for (const recipe of data.recipeIds.map((i) => data.recipeEntities[i])) {
      const s: RecipeSettings = { ...state[recipe.id] };

      if (s.machineId == null)
        s.machineId = RecipeUtility.bestMatch(
          recipe.producers,
          settings.machineRankIds,
        );

      const machine = data.machineEntities[s.machineId];
      const def = machinesState[s.machineId];

      if (recipe.isBurn) s.fuelId = Object.keys(recipe.in)[0];
      else s.fuelId = s.fuelId ?? def?.fuelId;

      s.fuelOptions = def?.fuelOptions;

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

      s.overclock = s.overclock ?? def?.overclock;

      value[recipe.id] = s;
    }

    return value;
  }
}
