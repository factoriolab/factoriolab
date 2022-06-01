import { Entities, FactorySettings } from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Settings from '../settings';
import { FactoriesAction, FactoriesActionType } from './factories.actions';

export type FactoriesState = {
  ids?: string[];
  entities: Entities<FactorySettings>;
};

export const initialFactoriesState: FactoriesState = {
  entities: {},
};

export function factoriesReducer(
  state: FactoriesState = initialFactoriesState,
  action:
    | FactoriesAction
    | App.AppAction
    | Settings.SetModAction
    | Settings.SetPresetAction
): FactoriesState {
  switch (action.type) {
    case App.AppActionType.LOAD:
      return { ...initialFactoriesState, ...action.payload.factoriesState };
    case App.AppActionType.RESET:
    case Settings.SettingsActionType.SET_MOD:
    case Settings.SettingsActionType.SET_PRESET:
      return initialFactoriesState;
    case FactoriesActionType.ADD: {
      const value = [
        ...(state.ids ?? action.payload.def ?? []),
        action.payload.value,
      ];
      const ids = StoreUtility.compareRank(value, action.payload.def);
      return { ...state, ...{ ids } };
    }
    case FactoriesActionType.REMOVE: {
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
    case FactoriesActionType.RAISE: {
      const value = [...(state.ids ?? action.payload.def ?? [])];
      const i = value.indexOf(action.payload.value);
      if (i !== -1 && i > 0) {
        value.splice(i - 1, 0, value.splice(i, 1)[0]);
        const ids = StoreUtility.compareRank(value, action.payload.def);
        return { ...state, ...{ ids } };
      }
      return state;
    }
    case FactoriesActionType.SET_FACTORY: {
      const value = [...(state.ids ?? action.payload.def ?? [])];
      const i = value.indexOf(action.payload.id);
      if (i !== -1) {
        value[i] = action.payload.value;
        const ids = StoreUtility.compareRank(value, action.payload.def);
        const newState = {
          ...state,
          ...{ ids, entities: { ...state.entities } },
        };
        newState.entities[action.payload.value] =
          newState.entities[action.payload.id];
        delete newState.entities[action.payload.id];
        return newState;
      }
      return state;
    }
    case FactoriesActionType.SET_MODULE_RANK: {
      const entities = StoreUtility.compareReset(
        state.entities,
        'moduleRankIds',
        action.payload,
        true
      );
      return { ...state, ...{ entities } };
    }
    case FactoriesActionType.SET_BEACON_COUNT: {
      const entities = StoreUtility.compareReset(
        state.entities,
        'beaconCount',
        action.payload
      );
      return { ...state, ...{ entities } };
    }
    case FactoriesActionType.SET_BEACON: {
      const entities = StoreUtility.compareReset(
        state.entities,
        'beaconId',
        action.payload
      );
      return { ...state, ...{ entities } };
    }
    case FactoriesActionType.SET_BEACON_MODULE: {
      const entities = StoreUtility.compareReset(
        state.entities,
        'beaconModuleId',
        action.payload
      );
      return { ...state, ...{ entities } };
    }
    case FactoriesActionType.SET_OVERCLOCK: {
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
