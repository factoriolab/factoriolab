import { computed, inject, Injectable } from '@angular/core';

import { spread } from '~/helpers';
import { Dataset } from '~/models/dataset';
import { ItemId } from '~/models/enum/item-id';
import { ItemSettings } from '~/models/settings/item-settings';
import { SettingsComplete } from '~/models/settings/settings-complete';
import { EntityStore } from '~/models/store';
import { Entities } from '~/models/utils';

import { SettingsService } from './settings.service';

export type ItemsState = Entities<ItemSettings>;
@Injectable({
  providedIn: 'root',
})
export class ItemsService extends EntityStore<ItemSettings> {
  settingsSvc = inject(SettingsService);

  itemsState = computed(() =>
    ItemsService.computeItemsState(
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

  constructor() {
    super({});
  }

  static computeItemsState(
    state: ItemsState,
    settings: SettingsComplete,
    data: Dataset,
  ): ItemsState {
    const value: Entities<ItemSettings> = {};
    for (const item of data.itemIds.map((i) => data.itemEntities[i])) {
      const itemSettings = spread(state[item.id]);

      // Belt (or Pipe)
      if (!itemSettings.beltId) {
        if (item.stack) itemSettings.beltId = settings.beltId;
        else if (settings.pipeId) itemSettings.beltId = settings.pipeId;
        else itemSettings.beltId = ItemId.Pipe;
      }

      if (!itemSettings.wagonId) {
        itemSettings.wagonId = item.stack
          ? settings.cargoWagonId
          : settings.fluidWagonId;
      }

      value[item.id] = itemSettings;
    }

    return value;
  }
}
