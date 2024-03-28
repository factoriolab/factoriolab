import { spread } from '~/helpers';
import { BeaconSettings, Entities, MachineSettings, Rational } from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Settings from '../settings';
import { MachinesAction, MachinesActionType } from './machines.actions';

export interface MachinesState {
  ids?: string[];
  fuelRankIds?: string[];
  moduleRankIds?: string[];
  beacons?: BeaconSettings[];
  overclock?: Rational;
  entities: Entities<MachineSettings>;
}

export const initialMachinesState: MachinesState = {
  entities: {},
};

export function machinesReducer(
  state: MachinesState = initialMachinesState,
  action:
    | MachinesAction
    | App.AppAction
    | Settings.SetModAction
    | Settings.SetPresetAction,
): MachinesState {
  switch (action.type) {
    case App.AppActionType.LOAD:
      return { ...initialMachinesState, ...action.payload.machinesState };
    case App.AppActionType.RESET:
    case Settings.SettingsActionType.SET_MOD:
    case Settings.SettingsActionType.SET_PRESET:
      return initialMachinesState;
    case MachinesActionType.SET_FUEL_RANK:
      return spread(state, {
        fuelRankIds: StoreUtility.compareValue(action.payload),
      });
    case MachinesActionType.SET_MODULE_RANK:
      return spread(state, {
        moduleRankIds: StoreUtility.compareValue(action.payload),
      });
    case MachinesActionType.SET_DEFAULT_BEACONS:
      return spread(state, { beacons: action.payload });
    case MachinesActionType.SET_DEFAULT_OVERCLOCK:
      return spread(state, { overclock: action.payload });
    case MachinesActionType.ADD: {
      const value = [
        ...(state.ids ?? action.payload.def ?? []),
        action.payload.value,
      ];
      const ids = StoreUtility.compareRank(value, action.payload.def);
      return { ...state, ...{ ids } };
    }
    case MachinesActionType.REMOVE: {
      const value = (state.ids ?? action.payload.def ?? []).filter(
        (i) => i !== action.payload.value,
      );
      const ids = StoreUtility.compareRank(value, action.payload.def);
      const newState = {
        ...state,
        ...{ ids, entities: { ...state.entities } },
      };
      delete newState.entities[action.payload.value];
      return newState;
    }
    case MachinesActionType.SET_RANK:
      return {
        ...state,
        ...{
          ids: StoreUtility.compareRank(
            action.payload.value,
            action.payload.def,
          ),
        },
      };
    case MachinesActionType.SET_MACHINE: {
      const value = [...(state.ids ?? action.payload.def ?? [])];
      const i = value.indexOf(action.payload.id);
      if (i !== -1) {
        value[i] = action.payload.value;
        const ids = StoreUtility.compareRank(value, action.payload.def);
        const newState = {
          ...state,
          ...{ ids, entities: { ...state.entities } },
        };
        if (newState.entities[action.payload.id])
          delete newState.entities[action.payload.id];

        return newState;
      }
      return state;
    }
    case MachinesActionType.SET_FUEL: {
      const entities = StoreUtility.compareReset(
        state.entities,
        'fuelId',
        action.payload,
      );
      return spread(state, { entities });
    }
    case MachinesActionType.SET_MODULES: {
      const entities = StoreUtility.setValue(
        state.entities,
        'modules',
        action.payload,
      );
      return spread(state, { entities });
    }
    case MachinesActionType.SET_BEACONS: {
      const entities = StoreUtility.setValue(
        state.entities,
        'beacons',
        action.payload,
      );
      return spread(state, { entities });
    }
    case MachinesActionType.SET_OVERCLOCK: {
      const entities = StoreUtility.compareReset(
        state.entities,
        'overclock',
        action.payload,
      );
      return spread(state, { entities });
    }
    case MachinesActionType.RESET_MACHINE: {
      const entities = { ...state.entities };
      delete entities[action.payload];
      return spread(state, { entities });
    }
    default:
      return state;
  }
}
