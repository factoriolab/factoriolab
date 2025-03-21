import { computed, inject, Injectable } from '@angular/core';

import { spread } from '~/helpers';
import { Dataset } from '~/models/dataset';
import { RecipeSettings, RecipeState } from '~/models/settings/recipe-settings';
import { Settings } from '~/models/settings/settings';
import { Entities } from '~/models/utils';
import { RecipeService } from '~/services/recipe.service';

import { ItemsStore } from './items.store';
import { MachinesSettings, MachinesStore } from './machines.store';
import { SettingsStore } from './settings.store';
import { EntityStore } from './store';

export type RecipesState = Entities<RecipeState>;
export type RecipesSettings = Entities<RecipeSettings>;

@Injectable({
  providedIn: 'root',
})
export class RecipesStore extends EntityStore<RecipeState> {
  itemsStr = inject(ItemsStore);
  machinesStr = inject(MachinesStore);
  recipeSvc = inject(RecipeService);
  settingsStr = inject(SettingsStore);

  settings = computed(() =>
    this.computeRecipesSettings(
      this.state(),
      this.machinesStr.settings(),
      this.settingsStr.settings(),
      this.settingsStr.dataset(),
    ),
  );

  adjustedDataset = computed(() => {
    const recipesState = this.settings();
    const itemsState = this.itemsStr.settings();
    const settings = this.settingsStr.settings();
    const data = this.settingsStr.dataset();

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
