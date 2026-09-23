import { computed, inject, Service } from '@angular/core';

import { Rational, rational } from '~/rational/rational';

import { Adjustment } from '../adjustment';
import { ItemsStore } from '../items/items-store';
import { MachineState } from '../machines/machine-state';
import { MachinesStore } from '../machines/machines-store';
import { Dataset } from '../settings/dataset';
import { Settings } from '../settings/settings';
import { SettingsStore } from '../settings/settings-store';
import { RecordStore } from '../store';
import { RecipeSettings } from './recipe-settings';
import { RecipeState } from './recipe-state';

@Service()
export class RecipesStore extends RecordStore<RecipeState> {
  private readonly adjustment = inject(Adjustment);
  private readonly itemsStore = inject(ItemsStore);
  private readonly machinesStore = inject(MachinesStore);
  private readonly settingsStore = inject(SettingsStore);

  readonly settings = computed(() =>
    this.computeRecipesSettings(
      this.state(),
      this.machinesStore.settings(),
      this.settingsStore.settings(),
      this.settingsStore.dataset(),
    ),
  );

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
    const options = this.settingsStore.options();
    const dispRateInfo = this.settingsStore.displayRateInfo();

    return (
      options.inserters
        .map((opt) => opt.value)
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

  private computeRecipesSettings(
    state: Partial<Record<string, RecipeState>>,
    machines: Record<string, MachineState>,
    settings: Settings,
    data: Dataset,
  ): Record<string, RecipeSettings> {
    return data.recipeIds
      .map((i) => data.recipeRecord[i])
      .reduce<Record<string, RecipeSettings>>((rec, recipe) => {
        rec[recipe.id] = this.adjustment.computeRecipeSettings(
          state[recipe.id],
          recipe,
          machines,
          settings,
          data,
        );

        return rec;
      }, {});
  }
}
