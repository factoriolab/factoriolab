import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import { Entities, MachineSettings } from '~/models';
import { StoreUtility } from '~/utilities';

import * as App from '../app.actions';
import * as Settings from '../settings';
import * as Actions from './machines.actions';

export type MachinesState = Entities<MachineSettings>;

export const initialState: MachinesState = {};

export const machinesReducer = createReducer(
  initialState,
  on(App.load, (_, { partial }) =>
    spread(initialState, partial.machinesState ?? {}),
  ),
  on(
    App.reset,
    Settings.setMod,
    Settings.setPreset,
    (): MachinesState => initialState,
  ),
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
  on(Actions.resetMachine, (state, { id }) =>
    StoreUtility.removeEntry(state, id),
  ),
);
