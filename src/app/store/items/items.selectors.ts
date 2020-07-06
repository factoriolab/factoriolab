import { createSelector } from '@ngrx/store';

import { Entities, ItemSettings, PIPE_ID } from '~/models';
import * as Dataset from '../dataset';
import * as Settings from '../settings';
import { State } from '..';

/* Base selector functions */
export const itemsState = (state: State) => state.itemState;

/* Complex selectors */
export const getItemSettings = createSelector(
  itemsState,
  Dataset.getDatasetState,
  Settings.settingsState,
  (state, data, settings) => {
    const value: Entities<ItemSettings> = {};
    if (data?.itemIds?.length) {
      for (const item of data.itemIds.map((i) => data.itemEntities[i])) {
        const itemSettings: ItemSettings = state[item.id]
          ? { ...state[item.id] }
          : { ignore: false };

        // Belt (or Pipe)
        if (!itemSettings.belt) {
          itemSettings.belt = item.stack ? settings.belt : PIPE_ID;
        }

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
