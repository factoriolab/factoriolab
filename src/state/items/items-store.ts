import { computed, inject, Service } from '@angular/core';

import { Item } from '~/data/schema/item';
import { Rational, rational } from '~/rational/rational';
import { coalesce } from '~/utils/nullish';

import { Options } from '../options';
import { Dataset } from '../settings/dataset';
import { Settings } from '../settings/settings';
import { SettingsStore } from '../settings/settings-store';
import { RecordStore } from '../store';
import { ItemSettings } from './item-settings';
import { ItemState } from './item-state';

@Service()
export class ItemsStore extends RecordStore<ItemState> {
  private readonly options = inject(Options);
  private readonly settingsStore = inject(SettingsStore);

  readonly settings = computed(() =>
    this.computeItemsSettings(
      this.state(),
      this.settingsStore.settings(),
      this.settingsStore.dataset(),
    ),
  );

  readonly itemsModified = computed(() => {
    const state = this.state();

    return {
      belts: Object.keys(state).some(
        (i) => state[i].beltId != null || state[i].stack != null,
      ),
      wagons: Object.keys(state).some((i) => state[i].wagonId != null),
      rockets: Object.keys(state).some((i) => state[i].excludeRockets != null),
    };
  });

  private computeItemsSettings(
    state: Record<string, ItemState>,
    settings: Settings,
    data: Dataset,
  ): Record<string, ItemSettings> {
    const value: Record<string, ItemSettings> = {};
    for (const item of data.itemIds.map((i) => data.itemRecord[i])) {
      const s = state[item.id];
      const beltOptions = this.options.logisticsOptions(
        item,
        settings,
        data,
        'belt',
      );
      const defaultBeltId = this.options.bestMatch(
        beltOptions,
        settings.beltRankIds,
      );
      const beltId = coalesce(s?.beltId, defaultBeltId);
      const defaultStack = this.defaultStack(item, settings);
      const wagonOptions = this.options.logisticsOptions(
        item,
        settings,
        data,
        'wagon',
      );
      const defaultWagonId = this.options.bestMatch(
        wagonOptions,
        settings.wagonRankIds,
      );
      const wagonId = coalesce(s?.wagonId, defaultWagonId);
      const stack = coalesce(s?.stack, defaultStack);
      const excludeRockets = s?.excludeRockets;

      value[item.id] = {
        beltOptions,
        beltId,
        defaultBeltId,
        stack,
        defaultStack,
        wagonOptions,
        wagonId,
        defaultWagonId,
        excludeRockets,
      };
    }

    return value;
  }

  private defaultStack(item: Item, settings: Settings): Rational {
    if (item.stack == null || settings.stack == null) return rational.one;
    return item.stack.lt(settings.stack) ? item.stack : settings.stack;
  }
}
