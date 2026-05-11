import { computed, inject, Injectable } from '@angular/core';

import { PIPE } from '~/data/schema/belt';
import { Item } from '~/data/schema/item';
import { Rational, rational } from '~/rational/rational';
import { coalesce } from '~/utils/nullish';

import { Dataset } from '../settings/dataset';
import { Settings } from '../settings/settings';
import { SettingsStore } from '../settings/settings-store';
import { RecordStore } from '../store';
import { ItemSettings } from './item-settings';
import { ItemState } from './item-state';

@Injectable({ providedIn: 'root' })
export class ItemsStore extends RecordStore<ItemState> {
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

  computeItemsSettings(
    state: Record<string, ItemState>,
    settings: Settings,
    data: Dataset,
  ): Record<string, ItemSettings> {
    const value: Record<string, ItemSettings> = {};
    for (const item of data.itemIds.map((i) => data.itemRecord[i])) {
      const s = state[item.id];
      const defaultBeltId = this.defaultBelt(
        item,
        settings,
        data.pipeIds.length,
      );
      const defaultStack = this.defaultStack(item, settings);
      const defaultWagonId = this.defaultWagon(item, settings);
      const beltId = coalesce(s?.beltId, defaultBeltId);
      const stack = coalesce(s?.stack, defaultStack);
      const wagonId = coalesce(s?.wagonId, defaultWagonId);
      const excludeRockets = s?.excludeRockets;

      value[item.id] = {
        beltId,
        defaultBeltId,
        stack,
        defaultStack,
        wagonId,
        defaultWagonId,
        excludeRockets,
      };
    }

    return value;
  }

  defaultBelt(item: Item, settings: Settings, pipeCount: number): string {
    if (item.stack) return coalesce(settings.beltId, '');
    else if (settings.pipeId != null) return settings.pipeId;
    else if (pipeCount === 0) return PIPE;
    return '';
  }

  defaultStack(item: Item, settings: Settings): Rational {
    if (item.stack == null || settings.stack == null) return rational.one;
    return item.stack.lt(settings.stack) ? item.stack : settings.stack;
  }

  defaultWagon(item: Item, settings: Settings): string {
    return coalesce(
      item.stack ? settings.cargoWagonId : settings.fluidWagonId,
      '',
    );
  }
}
