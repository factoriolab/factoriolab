import { computed, inject, Injectable } from '@angular/core';

import { coalesce } from '~/helpers';
import { Item } from '~/models/data/item';
import { Dataset } from '~/models/dataset';
import { ItemId } from '~/models/enum/item-id';
import { ItemSettings, ItemState } from '~/models/settings/item-settings';
import { Settings } from '~/models/settings/settings';
import { Entities, Optional } from '~/models/utils';

import { SettingsService } from './settings.service';
import { EntityStore } from './store';

export type ItemsState = Entities<ItemState>;
export type ItemsSettings = Entities<ItemSettings>;

@Injectable({
  providedIn: 'root',
})
export class ItemsService extends EntityStore<ItemState> {
  settingsSvc = inject(SettingsService);

  settings = computed(() =>
    this.computeItemsSettings(
      this.state(),
      this.settingsSvc.settings(),
      this.settingsSvc.dataset(),
    ),
  );

  itemsModified = computed(() => {
    const state = this.state();

    return {
      belts: Object.keys(state).some((i) => state[i].beltId != null),
      wagons: Object.keys(state).some((i) => state[i].wagonId != null),
    };
  });

  computeItemsSettings(
    state: ItemsState,
    settings: Settings,
    data: Dataset,
  ): ItemsSettings {
    const value: ItemsSettings = {};
    for (const item of data.itemIds.map((i) => data.itemEntities[i])) {
      const s = state[item.id];
      const defaultBeltId = this.defaultBelt(item, settings);
      const defaultWagonId = this.defaultWagon(item, settings);
      const beltId = coalesce(s?.beltId, defaultBeltId);
      const wagonId = coalesce(s?.wagonId, defaultWagonId);
      let stack = s?.stack;
      if (stack == null && item.stack && settings.stack)
        stack = item.stack.lt(settings.stack) ? item.stack : settings.stack;

      value[item.id] = {
        beltId,
        defaultBeltId,
        wagonId,
        defaultWagonId,
        stack,
      };
    }

    return value;
  }

  defaultBelt(item: Item, settings: Settings): Optional<string> {
    if (item.stack) return settings.beltId;
    else if (settings.pipeId) return settings.pipeId;
    else return ItemId.Pipe;
  }

  defaultWagon(item: Item, settings: Settings): Optional<string> {
    return item.stack ? settings.cargoWagonId : settings.fluidWagonId;
  }
}
