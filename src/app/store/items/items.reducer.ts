import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import { Entities } from '~/models/entities';
import { ItemSettings } from '~/models/settings/item-settings';
import { StoreUtility } from '~/utilities/store.utility';

import { load, reset } from '../app.actions';
import { setMod } from '../settings/settings.actions';
import {
  resetBelts,
  resetItem,
  resetWagons,
  setBelt,
  setWagon,
} from './items.actions';

export type ItemsState = Entities<ItemSettings>;

export const initialItemsState: ItemsState = {};

export const itemsReducer = createReducer(
  initialItemsState,
  on(load, (_, { partial }) =>
    spread(initialItemsState, partial.itemsState ?? {}),
  ),
  on(reset, setMod, (): ItemsState => initialItemsState),
  on(setBelt, (state, { id, value, def }) =>
    StoreUtility.compareReset(state, 'beltId', id, value, def),
  ),
  on(setWagon, (state, { id, value, def }) =>
    StoreUtility.compareReset(state, 'wagonId', id, value, def),
  ),
  on(resetItem, (state, { id }) => StoreUtility.removeEntry(state, id)),
  on(resetBelts, (state) => StoreUtility.resetField(state, 'beltId')),
  on(resetWagons, (state) => StoreUtility.resetField(state, 'wagonId')),
);
