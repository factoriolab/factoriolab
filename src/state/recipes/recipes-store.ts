import { computed, inject, Injectable } from '@angular/core';

import { spread } from '~/utils/object';

import { Adjustment } from '../adjustment';
import { ItemsStore } from '../items/items-store';
import { MachineSettings } from '../machines/machine-settings';
import { MachinesStore } from '../machines/machines-store';
import { Dataset } from '../settings/dataset';
import { Settings } from '../settings/settings';
import { SettingsStore } from '../settings/settings-store';
import { RecordStore } from '../store';
import { RecipeSettings } from './recipe-settings';
import { RecipeState } from './recipe-state';

@Injectable({ providedIn: 'root' })
export class RecipesStore extends RecordStore<RecipeState> {
  private readonly adjustment = inject(Adjustment);
  private readonly itemsStore = inject(ItemsStore);
  private readonly machinesStore = inject(MachinesStore);
  private readonly settingsStore = inject(SettingsStore);

  settings = computed(() =>
    this.computeRecipesSettings(
      this.state(),
      this.machinesStore.settings(),
      this.settingsStore.settings(),
      this.settingsStore.dataset(),
    ),
  );

  adjustedDataset = computed(() => {
    const recipesState = this.settings();
    const itemsState = this.itemsStore.settings();
    const settings = this.settingsStore.settings();
    const data = this.settingsStore.dataset();

    return this.adjustment.adjustDataset(
      recipesState,
      itemsState,
      settings,
      data,
    );
  });

  computeRecipesSettings(
    state: Record<string, RecipeState>,
    machines: Record<string, MachineSettings>,
    settings: Settings,
    data: Dataset,
  ): Record<string, RecipeSettings> {
    const value: Record<string, RecipeSettings> = {};
    for (const recipe of data.recipeIds.map((i) => data.recipeRecord[i])) {
      const s: RecipeSettings = spread(state[recipe.id]);
      this.adjustment.computeRecipeSettings(
        s,
        recipe,
        machines,
        settings,
        data,
      );
      value[recipe.id] = s;
    }

    return value;
  }
}
