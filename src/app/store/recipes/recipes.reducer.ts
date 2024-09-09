import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import { Entities, RecipeSettings } from '~/models';
import { StoreUtility } from '~/utilities';

import * as App from '../app.actions';
import * as Settings from '../settings';
import * as Actions from './recipes.actions';

export type RecipesState = Entities<RecipeSettings>;

export const initialState: RecipesState = {};

export const recipesReducer = createReducer(
  initialState,
  on(App.load, (_, { partial }) =>
    spread(initialState, partial.recipesState ?? {}),
  ),
  on(App.reset, Settings.setMod, (): RecipesState => initialState),
  on(Actions.setMachine, (state, { id, value, def }) => {
    state = StoreUtility.compareReset(state, 'machineId', id, value, def);
    return StoreUtility.resetFields(
      state,
      ['fuelId', 'modules', 'beacons'],
      id,
    );
  }),
  on(Actions.setFuel, (state, { id, value, def }) =>
    StoreUtility.compareReset(state, 'fuelId', id, value, def),
  ),
  on(Actions.setModules, (state, { id, value }) =>
    StoreUtility.setValue(state, 'modules', id, value),
  ),
  on(Actions.setBeacons, (state, { id, value }) =>
    StoreUtility.setValue(state, 'beacons', id, value),
  ),
  on(Actions.setOverclock, (state, { id, value, def }) =>
    StoreUtility.compareReset(state, 'overclock', id, value, def),
  ),
  on(Actions.setCost, (state, { id, value }) =>
    StoreUtility.compareReset(state, 'cost', id, value, undefined),
  ),
  on(Actions.resetRecipe, (state, { id }) =>
    StoreUtility.removeEntry(state, id),
  ),
  on(Actions.resetRecipeMachines, (state, { ids }) => {
    for (const id of ids)
      state = StoreUtility.resetFields(
        state,
        ['fuelId', 'modules', 'beacons'],
        id,
      );
    return state;
  }),
  on(Actions.resetMachines, (state) =>
    StoreUtility.resetFields(state, [
      'machineId',
      'fuelId',
      'overclock',
      'modules',
      'beacons',
    ]),
  ),
  on(Actions.resetBeacons, (state) =>
    StoreUtility.resetField(state, 'beacons'),
  ),
  on(Actions.resetCost, (state) => StoreUtility.resetField(state, 'cost')),
);
