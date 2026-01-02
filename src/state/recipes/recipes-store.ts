import { computed, inject, Injectable } from '@angular/core';

import { Rational, rational } from '~/rational/rational';
import { spread } from '~/utils/object';

import { Adjustment } from '../adjustment';
import { ItemsStore } from '../items/items-store';
import { MachinesStore } from '../machines/machines-store';
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

  readonly settings = computed(() => this.computeRecipesSettings(this.state()));

  readonly adjustedDataset = computed(() => {
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

  readonly inserterSpeed = computed(() => {
    const data = this.adjustedDataset();
    const dispRateInfo = this.settingsStore.displayRateInfo();

    return (
      data.inserterIds
        .map<[string, Rational]>((id) => {
          // Calculate items/s for each inserter
          const inserter = data.adjustedInserter[id];
          const rotationsPerSec = inserter.speed.div(rational(360n));
          const speed = rotationsPerSec
            .mul(inserter.stack)
            .mul(dispRateInfo.value);
          return [id, speed];
        })
        // Sort inserter id/speed tuples
        .sort(([_aKey, aSpd], [_bKey, bSpd]) => aSpd.sub(bSpd).toNumber())
        // Map to tuples into record after sorting
        .reduce<Record<string, Rational>>((result, [id, speed]) => {
          result[id] = speed;
          return result;
        }, {})
    );
  });

  computeRecipesSettings(
    state: Record<string, RecipeState>,
  ): Record<string, RecipeSettings> {
    const machines = this.machinesStore.settings();
    const settings = this.settingsStore.settings();
    const data = this.settingsStore.dataset();
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
