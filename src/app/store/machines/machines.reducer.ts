import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import { BeaconSettings, Entities, MachineSettings, Rational } from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Settings from '../settings';
import * as Actions from './machines.actions';

export interface MachinesState {
  ids?: string[];
  fuelRankIds?: string[];
  moduleRankIds?: string[];
  beacons?: BeaconSettings[];
  overclock?: Rational;
  entities: Entities<MachineSettings>;
}

export const initialState: MachinesState = {
  entities: {},
};

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
  on(Actions.setFuelRank, (state, { value, def }) =>
    spread(state, { fuelRankIds: StoreUtility.compareRank(value, def) }),
  ),
  on(Actions.setModuleRank, (state, { value, def }) =>
    spread(state, { moduleRankIds: StoreUtility.compareRank(value, def) }),
  ),
  on(Actions.setDefaultBeacons, (state, payload) => spread(state, payload)),
  on(Actions.setDefaultOverclock, (state, payload) => spread(state, payload)),
  on(Actions.add, (state, { id, def }) => {
    const values = [...(state.ids ?? def ?? []), id];
    const ids = StoreUtility.compareRank(values, def);
    return spread(state, { ids });
  }),
  on(Actions.remove, (state, { id, def }) => {
    const values = (state.ids ?? def ?? []).filter((i) => i !== id);
    const ids = StoreUtility.compareRank(values, def);
    const entities = StoreUtility.removeEntry(state.entities, id);
    return spread(state, { ids, entities });
  }),
  on(Actions.setRank, (state, { value, def }) =>
    spread(state, { ids: StoreUtility.compareRank(value, def) }),
  ),
  on(Actions.setMachine, (state, { id, value, def }) => {
    const values = [...(state.ids ?? def ?? [])];
    const i = values.indexOf(id);
    if (i === -1) return state;
    values[i] = value;
    const ids = StoreUtility.compareRank(values, def);
    const entities = StoreUtility.removeEntry(state.entities, id);
    return spread(state, { ids, entities });
  }),
  on(Actions.setFuel, (state, { id, value, def }) =>
    spread(state, {
      entities: StoreUtility.compareReset(
        state.entities,
        'fuelId',
        id,
        value,
        def,
      ),
    }),
  ),
  on(Actions.setModules, (state, { id, value }) =>
    spread(state, {
      entities: StoreUtility.setValue(state.entities, 'modules', id, value),
    }),
  ),
  on(Actions.setBeacons, (state, { id, value }) =>
    spread(state, {
      entities: StoreUtility.setValue(state.entities, 'beacons', id, value),
    }),
  ),
  on(Actions.setOverclock, (state, { id, value, def }) =>
    spread(state, {
      entities: StoreUtility.compareReset(
        state.entities,
        'overclock',
        id,
        value,
        def,
      ),
    }),
  ),
  on(Actions.resetMachine, (state, { id }) =>
    spread(state, { entities: StoreUtility.removeEntry(state.entities, id) }),
  ),
);
