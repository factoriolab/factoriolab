import { createSelector } from '@ngrx/store';

import { Entities, ItemSettings, ItemId } from '~/models';
import * as Settings from '../settings';
import { State } from '..';
import { ItemsState } from './items.reducer';

/* Base selector functions */
export const itemsState = (state: State): ItemsState => state.itemsState;

/* Complex selectors */
export const getItemSettings = createSelector(
  itemsState,
  Settings.getDataset,
  Settings.getBelt,
  (state, data, belt) => {
    const value: Entities<ItemSettings> = {};
    if (data?.itemIds?.length) {
      for (const item of data.itemIds.map((i) => data.itemEntities[i])) {
        const itemSettings: ItemSettings = state[item.id]
          ? { ...state[item.id] }
          : { ignore: false };

        // Belt (or Pipe)
        if (!itemSettings.belt) {
          itemSettings.belt = item.stack ? belt : ItemId.Pipe;
        }

        itemSettings.wagon = item.stack ? ItemId.CargoWagon : ItemId.FluidWagon;

        value[item.id] = itemSettings;
      }
    }
    return value;
  }
);

export const getContainsIgnore = createSelector(itemsState, (state) =>
  Object.keys(state).some((id) => state[id].ignore != null)
);

export const getContainsBelt = createSelector(itemsState, (state) =>
  Object.keys(state).some((id) => state[id].belt)
);
