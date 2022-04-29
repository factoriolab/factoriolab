import { createSelector } from '@ngrx/store';

import { Entities, ItemId, ItemSettings } from '~/models';
import { LabState } from '../';
import * as Settings from '../settings';
import { ItemsState } from './items.reducer';

/* Base selector functions */
export const itemsState = (state: LabState): ItemsState => state.itemsState;

/* Complex selectors */
export const getItemSettings = createSelector(
  itemsState,
  Settings.getDataset,
  Settings.getSettings,
  (state, data, settings) => {
    const value: Entities<ItemSettings> = {};
    if (data?.itemIds?.length) {
      for (const item of data.itemIds.map((i) => data.itemEntities[i])) {
        const itemSettings: ItemSettings = state[item.id]
          ? { ...state[item.id] }
          : { ignore: false };

        // Belt (or Pipe)
        if (!itemSettings.belt) {
          if (item.stack) {
            itemSettings.belt = settings.belt;
          } else if (settings.pipe) {
            itemSettings.belt = settings.pipe;
          } else {
            itemSettings.belt = ItemId.Pipe;
          }
        }

        if (!itemSettings.wagon) {
          itemSettings.wagon = item.stack
            ? settings.cargoWagon
            : settings.fluidWagon;
        }

        value[item.id] = itemSettings;
      }
    }
    return value;
  }
);

export const getItemsModified = createSelector(itemsState, (state) => ({
  ignore: Object.keys(state).some((id) => state[id].ignore != null),
  belts: Object.keys(state).some((id) => state[id].belt != null),
  wagons: Object.keys(state).some((id) => state[id].wagon != null),
}));
