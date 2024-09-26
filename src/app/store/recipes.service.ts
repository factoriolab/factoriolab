import { computed, inject, Injectable } from '@angular/core';

import { spread } from '~/helpers';
import { Dataset } from '~/models/dataset';
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
    machinesState: MachinesSettings,
    settings: Settings,
    data: Dataset,
  ): RecipesSettings {
    const value: RecipesSettings = {};
    for (const recipe of data.recipeIds.map((i) => data.recipeEntities[i])) {
      const s: RecipeSettings = spread(state[recipe.id]);

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
