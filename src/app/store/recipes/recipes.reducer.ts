import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import { Entities } from '~/models/entities';
import { RecipeSettings } from '~/models/settings/recipe-settings';
import { StoreUtility } from '~/utilities/store.utility';

import { load, reset } from '../app.actions';
import { setMod } from '../settings/settings.actions';
import {
  resetBeacons,
  resetCost,
  resetMachines,
  resetRecipe,
  resetRecipeMachines,
  setBeacons,
  setCost,
  setFuel,
  setMachine,
  setModules,
  setOverclock,
} from './recipes.actions';

export type RecipesState = Entities<RecipeSettings>;

export const initialRecipesState: RecipesState = {};

export const recipesReducer = createReducer(
  initialRecipesState,
  on(load, (_, { partial }) =>
    spread(initialRecipesState, partial.recipesState ?? {}),
  ),
  on(reset, setMod, (): RecipesState => initialRecipesState),
  on(setMachine, (state, { id, value, def }) => {
    state = StoreUtility.compareReset(state, 'machineId', id, value, def);
    return StoreUtility.resetFields(
      state,
      ['fuelId', 'modules', 'beacons'],
      id,
    );
  }),
  on(setFuel, (state, { id, value, def }) =>
    StoreUtility.compareReset(state, 'fuelId', id, value, def),
  ),
  on(setModules, (state, { id, value }) =>
    StoreUtility.setValue(state, 'modules', id, value),
  ),
  on(setBeacons, (state, { id, value }) =>
    StoreUtility.setValue(state, 'beacons', id, value),
  ),
  on(setOverclock, (state, { id, value, def }) =>
    StoreUtility.compareReset(state, 'overclock', id, value, def),
  ),
  on(setCost, (state, { id, value }) =>
    StoreUtility.compareReset(state, 'cost', id, value, undefined),
  ),
  on(resetRecipe, (state, { id }) => StoreUtility.removeEntry(state, id)),
  on(resetRecipeMachines, (state, { ids }) => {
    for (const id of ids)
      state = StoreUtility.resetFields(
        state,
        ['fuelId', 'modules', 'beacons'],
        id,
      );
    return state;
  }),
  on(resetMachines, (state) =>
    StoreUtility.resetFields(state, [
      'machineId',
      'fuelId',
      'overclock',
      'modules',
      'beacons',
    ]),
  ),
  on(resetBeacons, (state) => StoreUtility.resetField(state, 'beacons')),
  on(resetCost, (state) => StoreUtility.resetField(state, 'cost')),
);
