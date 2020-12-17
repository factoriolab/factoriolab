import { Entities, FactorySettings, FactorySettingsField } from '~/models';
import { StoreUtility } from '~/utilities';
import { AppAction, AppActionType } from '../app.actions';
import { SetBaseAction, SettingsActionType } from '../settings';
import { FactoriesAction, FactoriesActionType } from './factories.actions';

export type FactoriesState = {
  ids: string[];
  entities: Entities<FactorySettings>;
};

export const initialFactoriesState: FactoriesState = {
  ids: null,
  entities: { '': {} },
};

export function factoriesReducer(
  state: FactoriesState = initialFactoriesState,
  action: FactoriesAction | AppAction | SetBaseAction
): FactoriesState {
  switch (action.type) {
    case AppActionType.LOAD:
      return { ...initialFactoriesState, ...action.payload.factoriesState };
    case AppActionType.RESET:
    case SettingsActionType.SET_BASE:
      return initialFactoriesState;
    case FactoriesActionType.ADD: {
      let ids = [
        ...(state.ids || action.payload.default),
        action.payload.value,
      ];
      if (StoreUtility.rankEquals(ids, action.payload.default)) {
        ids = null;
      }
      return { ...state, ...{ ids } };
    }
    case FactoriesActionType.REMOVE: {
      let ids = (state.ids || action.payload.default).filter(
        (i) => i !== action.payload.value
      );
      if (StoreUtility.rankEquals(ids, action.payload.default)) {
        ids = null;
      }
      const newState = { ...state, ...{ ids } };
      delete newState.entities[action.payload.value];
      return newState;
    }
    case FactoriesActionType.RAISE: {
      let ids = [...(state.ids || action.payload.default)];
      const i = ids.indexOf(action.payload.value);
      if (i !== -1 && i > 0) {
        ids.splice(i - 1, 0, ids.splice(i, 1)[0]);
        if (StoreUtility.rankEquals(ids, action.payload.default)) {
          ids = null;
        }
        return { ...state, ...{ ids } };
      }
      return state;
    }
    case FactoriesActionType.LOWER: {
      let ids = [...(state.ids || action.payload.default)];
      const i = ids.indexOf(action.payload.value);
      if (i !== -1 && i < ids.length - 1) {
        ids.splice(i + 1, 0, ids.splice(i, 1)[0]);
        if (StoreUtility.rankEquals(ids, action.payload.default)) {
          ids = null;
        }
        return { ...state, ...{ ids } };
      }
      return state;
    }
    case FactoriesActionType.SET_FACTORY: {
      let ids = [...(state.ids || action.payload.default)];
      const i = ids.indexOf(action.payload.id);
      if (i !== -1) {
        ids[i] = action.payload.value;
        if (StoreUtility.rankEquals(ids, action.payload.default)) {
          ids = null;
        }
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
      const entities = StoreUtility.compareResetDefault(
        state.entities,
        FactorySettingsField.ModuleRank,
        action.payload,
        true
      );
      return { ...state, ...{ entities } };
    }
    case FactoriesActionType.SET_BEACON_COUNT: {
      const entities = StoreUtility.compareResetDefault(
        state.entities,
        FactorySettingsField.BeaconCount,
        action.payload
      );
      return { ...state, ...{ entities } };
    }
    case FactoriesActionType.SET_BEACON: {
      const entities = StoreUtility.compareResetDefault(
        state.entities,
        FactorySettingsField.Beacon,
        action.payload
      );
      return { ...state, ...{ entities } };
    }
    case FactoriesActionType.SET_BEACON_MODULE: {
      const entities = StoreUtility.compareResetDefault(
        state.entities,
        FactorySettingsField.BeaconModule,
        action.payload
      );
      return { ...state, ...{ entities } };
    }
    default:
      return state;
  }
}
