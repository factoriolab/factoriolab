import { Entities, MachineSettings } from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Settings from '../settings';
import { MachinesAction, MachinesActionType } from './machines.actions';

export type MachinesState = {
  ids?: string[];
  entities: Entities<MachineSettings>;
};

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
      return { ...state, ...{ entities } };
    }
    case MachinesActionType.SET_MODULE_RANK: {
      const entities = StoreUtility.compareReset(
        state.entities,
        'moduleRankIds',
        action.payload,
        true,
      );
      return { ...state, ...{ entities } };
    }
    case MachinesActionType.SET_BEACON_COUNT: {
      const entities = StoreUtility.compareReset(
        state.entities,
        'beaconCount',
        action.payload,
      );
      return { ...state, ...{ entities } };
    }
    case MachinesActionType.SET_BEACON: {
      const entities = StoreUtility.resetFields(
        StoreUtility.compareReset(state.entities, 'beaconId', action.payload),
        ['beaconModuleRankIds'],
        action.payload.id,
      );
      return { ...state, ...{ entities } };
    }
    case MachinesActionType.SET_BEACON_MODULE_RANK: {
      const entities = StoreUtility.compareReset(
        state.entities,
        'beaconModuleRankIds',
        action.payload,
      );
      return { ...state, ...{ entities } };
    }
    case MachinesActionType.SET_OVERCLOCK: {
      const entities = StoreUtility.compareReset(
        state.entities,
        'overclock',
        action.payload,
      );
      return { ...state, ...{ entities } };
    }
    case MachinesActionType.RESET_MACHINE: {
      const entities = { ...state.entities };
      delete entities[action.payload];
      return { ...state, ...{ entities } };
    }
    default:
      return state;
  }
}
