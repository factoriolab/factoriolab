import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import { Entities, ItemSettings } from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Settings from '../settings';
import * as Actions from './items.actions';

export type ItemsState = Entities<ItemSettings>;

export const initialState: ItemsState = {};

export const itemsReducer = createReducer(
  initialState,
  on(App.load, (_, { partial }) =>
    spread(initialState, partial.itemsState ?? {}),
  ),
  on(App.reset, Settings.setMod, (): ItemsState => initialState),
  on(Actions.setExcluded, (state, { id, value }) =>
    StoreUtility.compareReset(state, 'excluded', id, value, false),
  ),
  on(Actions.setExcludedBatch, (state, { values }) => {
    for (const { id, value } of values) {
      state = StoreUtility.compareReset(state, 'excluded', id, value, false);
    }

    return state;
  }),
  on(Actions.setChecked, (state, { id, value }) =>
    StoreUtility.compareReset(state, 'checked', id, value, false),
  ),
  on(Actions.setBelt, (state, { id, value, def }) =>
    StoreUtility.compareReset(state, 'beltId', id, value, def),
  ),
  on(Actions.setWagon, (state, { id, value, def }) =>
    StoreUtility.compareReset(state, 'wagonId', id, value, def),
  ),
  on(Actions.resetItem, (state, { id }) => StoreUtility.removeEntry(state, id)),
  on(Actions.resetExcluded, (state) =>
    StoreUtility.resetField(state, 'excluded'),
  ),
  on(Actions.resetChecked, (state) =>
    StoreUtility.resetField(state, 'checked'),
  ),
  on(Actions.resetBelts, (state) => StoreUtility.resetField(state, 'beltId')),
  on(Actions.resetWagons, (state) => StoreUtility.resetField(state, 'wagonId')),
);
