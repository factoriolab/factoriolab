import { computed, inject, Injectable } from '@angular/core';

import { PIPE } from '~/data/schema/belt';
import { Item } from '~/data/schema/item';
import { Rational, rational } from '~/rational/rational';
import { coalesce } from '~/utils/nullish';

import { Settings } from '../settings/settings';
import { SettingsStore } from '../settings/settings-store';
import { RecordStore } from '../store';
import { ItemSettings } from './item-settings';
import { ItemState } from './item-state';

@Injectable({ providedIn: 'root' })
export class ItemsStore extends RecordStore<ItemState> {
  private readonly settingsStore = inject(SettingsStore);

  readonly settings = computed(() => this.computeItemsSettings(this.state()));

  readonly itemsModified = computed(() => {
    const state = this.state();

    return {
      belts: Object.keys(state).some(
        (i) => state[i].beltId != null || state[i].stack != null,
      ),
      wagons: Object.keys(state).some((i) => state[i].wagonId != null),
    };
  });

  computeItemsSettings(
    state: Record<string, ItemState>,
  ): Record<string, ItemSettings> {
    const settings = this.settingsStore.settings();
    const data = this.settingsStore.dataset();
    const value: Record<string, ItemSettings> = {};
    for (const item of data.itemIds.map((i) => data.itemRecord[i])) {
      const s = state[item.id];
      const defaultBeltId = this.defaultBelt(item, settings);
      const defaultStack = this.defaultStack(item, settings);
      const defaultWagonId = this.defaultWagon(item, settings);
      const beltId = coalesce(s?.beltId, defaultBeltId);
      const stack = coalesce(s?.stack, defaultStack);
      const wagonId = coalesce(s?.wagonId, defaultWagonId);

      value[item.id] = {
        beltId,
        defaultBeltId,
        stack,
        defaultStack,
        wagonId,
        defaultWagonId,
      };
    }

    return value;
  }

  defaultBelt(item: Item, settings: Settings): string | undefined {
    if (item.stack) return settings.beltId;
    else if (settings.pipeId) return settings.pipeId;
    else return PIPE;
  }

  defaultStack(item: Item, settings: Settings): Rational {
    if (item.stack == null || settings.stack == null) return rational.one;
    return item.stack.lt(settings.stack) ? item.stack : settings.stack;
  }

  defaultWagon(item: Item, settings: Settings): string | undefined {
    return item.stack ? settings.cargoWagonId : settings.fluidWagonId;
  }
}
