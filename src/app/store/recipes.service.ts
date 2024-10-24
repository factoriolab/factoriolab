import { computed, inject, Injectable } from '@angular/core';

import { spread } from '~/helpers';
import { Dataset } from '~/models/dataset';
import { RecipeSettings, RecipeState } from '~/models/settings/recipe-settings';
import { Settings } from '~/models/settings/settings';
import { Entities } from '~/models/utils';
import { RecipeService } from '~/services/recipe.service';

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
  recipeSvc = inject(RecipeService);
  settingsSvc = inject(SettingsService);

  settings = computed(() =>
    this.computeRecipesSettings(
      this.state(),
      this.machinesSvc.settings(),
      this.settingsSvc.settings(),
      this.settingsSvc.dataset(),
    ),
  );

  adjustedDataset = computed(() => {
    const recipesState = this.settings();
    const itemsState = this.itemsSvc.settings();
    const settings = this.settingsSvc.settings();
    const data = this.settingsSvc.dataset();

    return this.recipeSvc.adjustDataset(
      recipesState,
      itemsState,
      settings,
      data,
    );
  });

  computeRecipesSettings(
    state: RecipesState,
    machines: MachinesSettings,
    settings: Settings,
    data: Dataset,
  ): RecipesSettings {
    const value: RecipesSettings = {};
    for (const recipe of data.recipeIds.map((i) => data.recipeEntities[i])) {
      const s: RecipeSettings = spread(state[recipe.id]);
      this.recipeSvc.computeRecipeSettings(s, recipe, machines, settings, data);
      value[recipe.id] = s;
    }

    return value;
  }
}
