import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import { Entities } from '~/models/entities';
import { MachineSettings } from '~/models/settings/machine-settings';
import { StoreUtility } from '~/utilities/store.utility';

import { load, reset } from '../app.actions';
import { setMod, setPreset } from '../settings/settings.actions';
import {
  resetMachine,
  setBeacons,
  setFuel,
  setModules,
  setOverclock,
} from './machines.actions';

export type MachinesState = Entities<MachineSettings>;

export const initialMachinesState: MachinesState = {};

export const machinesReducer = createReducer(
  initialMachinesState,
  on(load, (_, { partial }) =>
    spread(initialMachinesState, partial.machinesState ?? {}),
  ),
  on(reset, setMod, setPreset, (): MachinesState => initialMachinesState),
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
  on(resetMachine, (state, { id }) => StoreUtility.removeEntry(state, id)),
);
