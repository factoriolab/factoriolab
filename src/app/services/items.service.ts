import { computed, inject, Injectable } from '@angular/core';

import { ItemId } from '~/models/enum/item-id';
import { ItemSettings } from '~/models/settings/item-settings';
import { Store } from '~/models/store';
import { Entities, Optional } from '~/models/utils';

import { SettingsService } from './settings.service';

export type ItemsState = Entities<ItemSettings>;
@Injectable({
  providedIn: 'root',
})
export class ItemsService extends Store<ItemsState> {
  settingsSvc = inject(SettingsService);

  itemsState = computed(() => {
    const state = this.state();
    const settings = this.settingsSvc.settings();
    const data = this.settingsSvc.dataset();

    const value: Entities<ItemSettings> = {};
    if (data?.itemIds?.length) {
      for (const item of data.itemIds.map((i) => data.itemEntities[i])) {
        const itemSettings: ItemSettings = { ...state[item.id] };

        // Belt (or Pipe)
        if (!itemSettings.beltId) {
          if (item.stack) {
            itemSettings.beltId = settings.beltId;
          } else if (settings.pipeId) {
            itemSettings.beltId = settings.pipeId;
          } else {
            itemSettings.beltId = ItemId.Pipe;
          }
        }

        if (!itemSettings.wagonId) {
          itemSettings.wagonId = item.stack
            ? settings.cargoWagonId
            : settings.fluidWagonId;
        }

        value[item.id] = itemSettings;
      }
    }
    return value;
  });

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

  updateEntityField<K extends keyof ItemSettings>(
    id: string,
    field: K,
    value: ItemSettings[K],
    def?: Optional<ItemSettings[K]>,
  ): void {
    this.reduce((state) => this._updateField(state, id, field, value, def));
  }

  resetField(field: keyof ItemSettings): void {
    this.update((state) => this._resetField(state, field));
  }

  resetId(id: string): void {
    this.reduce((state) => this._removeEntry(state, id));
  }
}
