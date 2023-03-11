import { Entities, MachineCfg } from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Settings from '../settings';
import {
  MachinesCfgAction,
  MachinesCfgActionType,
} from './machine-configs.actions';

export type MachinesCfgState = {
  ids?: string[];
  entities: Entities<MachineCfg>;
};

export const initialMachinesCfgState: MachinesCfgState = {
  entities: {},
};

export function machinesCfgReducer(
  state: MachinesCfgState = initialMachinesCfgState,
  action:
    | MachinesCfgAction
    | App.AppAction
    | Settings.SetModAction
    | Settings.SetPresetAction
): MachinesCfgState {
  switch (action.type) {
    case App.AppActionType.LOAD:
      return { ...initialMachinesCfgState, ...action.payload.machinesCfgState };
    case App.AppActionType.RESET:
    case Settings.SettingsActionType.SET_MOD:
    case Settings.SettingsActionType.SET_PRESET:
      return initialMachinesCfgState;
    case MachinesCfgActionType.ADD: {
      const value = [
        ...(state.ids ?? action.payload.def ?? []),
        action.payload.value,
      ];
      const ids = StoreUtility.compareRank(value, action.payload.def);
      return { ...state, ...{ ids } };
    }
    case MachinesCfgActionType.REMOVE: {
      const value = (state.ids ?? action.payload.def ?? []).filter(
        (i) => i !== action.payload.value
      );
      const ids = StoreUtility.compareRank(value, action.payload.def);
      const newState = {
        ...state,
        ...{ ids, entities: { ...state.entities } },
      };
      delete newState.entities[action.payload.value];
      return newState;
    }
    case MachinesCfgActionType.RAISE: {
      const value = [...(state.ids ?? action.payload.def ?? [])];
      const i = value.indexOf(action.payload.value);
      if (i !== -1 && i > 0) {
        value.splice(i - 1, 0, value.splice(i, 1)[0]);
        const ids = StoreUtility.compareRank(value, action.payload.def);
        return { ...state, ...{ ids } };
      }
      return state;
    }
    case MachinesCfgActionType.LOWER: {
      const value = [...(state.ids ?? action.payload.def ?? [])];
      const i = value.indexOf(action.payload.value);
      if (i !== -1 && i < value.length - 1) {
        value.splice(i + 1, 0, value.splice(i, 1)[0]);
        const ids = StoreUtility.compareRank(value, action.payload.def);
        return { ...state, ...{ ids } };
      }
      return state;
    }
    case MachinesCfgActionType.SET_MACHINE: {
      const value = [...(state.ids ?? action.payload.def ?? [])];
      const i = value.indexOf(action.payload.id);
      if (i !== -1) {
        value[i] = action.payload.value;
        const ids = StoreUtility.compareRank(value, action.payload.def);
        const newState = {
          ...state,
          ...{ ids, entities: { ...state.entities } },
        };
        if (newState.entities[action.payload.id]) {
          newState.entities[action.payload.value] =
            newState.entities[action.payload.id];
          delete newState.entities[action.payload.id];
        }
        return newState;
      }
      return state;
    }
    case MachinesCfgActionType.SET_MODULE_RANK: {
      const entities = StoreUtility.compareReset(
        state.entities,
        'moduleRankIds',
        action.payload,
        true
      );
      return { ...state, ...{ entities } };
    }
    case MachinesCfgActionType.SET_BEACON_COUNT: {
      const entities = StoreUtility.compareReset(
        state.entities,
        'beaconCount',
        action.payload
      );
      return { ...state, ...{ entities } };
    }
    case MachinesCfgActionType.SET_BEACON: {
      const entities = StoreUtility.resetFields(
        StoreUtility.compareReset(state.entities, 'beaconId', action.payload),
        ['beaconModuleRankIds'],
        action.payload.id
      );
      return { ...state, ...{ entities } };
    }
    case MachinesCfgActionType.SET_BEACON_MODULE_RANK: {
      const entities = StoreUtility.compareReset(
        state.entities,
        'beaconModuleRankIds',
        action.payload
      );
      return { ...state, ...{ entities } };
    }
    case MachinesCfgActionType.SET_OVERCLOCK: {
      const entities = StoreUtility.compareReset(
        state.entities,
        'overclock',
        action.payload
      );
      return { ...state, ...{ entities } };
    }
    default:
      return state;
  }
}
