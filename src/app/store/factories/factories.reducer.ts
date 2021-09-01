import { Entities, FactorySettings, FactorySettingsField } from '~/models';
import { StoreUtility } from '~/utilities';
import { AppAction, AppActionType } from '../app.actions';
import {
  SetBaseAction,
  SetPresetAction,
  SettingsActionType,
} from '../settings';
import { FactoriesAction, FactoriesActionType } from './factories.actions';

export type FactoriesState = {
  ids: string[];
  entities: Entities<FactorySettings>;
};

export const initialFactoriesState: FactoriesState = {
  ids: null,
  entities: {},
};

export function factoriesReducer(
  state: FactoriesState = initialFactoriesState,
  action: FactoriesAction | AppAction | SetBaseAction | SetPresetAction
): FactoriesState {
  switch (action.type) {
    case AppActionType.LOAD:
      return { ...initialFactoriesState, ...action.payload.factoriesState };
    case AppActionType.RESET:
    case SettingsActionType.SET_BASE:
    case SettingsActionType.SET_PRESET:
      return initialFactoriesState;
    case FactoriesActionType.ADD: {
      const value = [
        ...(state.ids || action.payload.def),
        action.payload.value,
      ];
      const ids = StoreUtility.compareRank(value, action.payload.def);
      return { ...state, ...{ ids } };
    }
    case FactoriesActionType.REMOVE: {
      const value = (state.ids || action.payload.def).filter(
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
      const value = [...(state.ids || action.payload.def)];
      const i = value.indexOf(action.payload.value);
      if (i !== -1 && i > 0) {
        value.splice(i - 1, 0, value.splice(i, 1)[0]);
        const ids = StoreUtility.compareRank(value, action.payload.def);
        return { ...state, ...{ ids } };
      }
      return state;
    }
    case FactoriesActionType.SET_FACTORY: {
      const value = [...(state.ids || action.payload.def)];
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
        FactorySettingsField.ModuleRank,
        action.payload,
        true
      );
      return { ...state, ...{ entities } };
    }
    case FactoriesActionType.SET_BEACON_COUNT: {
      const entities = StoreUtility.compareReset(
        state.entities,
        FactorySettingsField.BeaconCount,
        action.payload
      );
      return { ...state, ...{ entities } };
    }
    case FactoriesActionType.SET_BEACON: {
      const entities = StoreUtility.compareReset(
        state.entities,
        FactorySettingsField.Beacon,
        action.payload
      );
      return { ...state, ...{ entities } };
    }
    case FactoriesActionType.SET_BEACON_MODULE: {
      const entities = StoreUtility.compareReset(
        state.entities,
        FactorySettingsField.BeaconModule,
        action.payload
      );
      return { ...state, ...{ entities } };
    }
    case FactoriesActionType.SET_OVERCLOCK: {
      const entities = StoreUtility.compareReset(
        state.entities,
        FactorySettingsField.Overclock,
        action.payload
      );
      return { ...state, ...{ entities } };
    }
    default:
      return state;
  }
}
