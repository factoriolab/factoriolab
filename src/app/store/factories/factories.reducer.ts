import { initial } from 'lodash';
import { Entities, FactorySettings, FactorySettingsField } from '~/models';
import { StoreUtility } from '~/utilities';
import { AppAction, AppActionType } from '../app.actions';
import { FactoriesAction, FactoriesActionType } from './factories.actions';

export type FactoriesState = Entities<FactorySettings>;

export const initialFactoriesState: FactoriesState = {};

export function factoriesReducer(
  state: FactoriesState = initialFactoriesState,
  action: FactoriesAction | AppAction
): FactoriesState {
  switch (action.type) {
    case AppActionType.LOAD:
      return { ...initialFactoriesState, ...action.payload.factoriesState };
    case AppActionType.RESET:
      return initialFactoriesState;
    case FactoriesActionType.ADD:
      return { ...state, ...{ [action.payload]: {} } };
    case FactoriesActionType.REMOVE: {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    case FactoriesActionType.SET_FACTORY_MODULES:
      return StoreUtility.assignValue(
        state,
        FactorySettingsField.FactoryModules,
        action.payload
      );
    case FactoriesActionType.SET_BEACON_COUNT:
      return StoreUtility.assignValue(
        state,
        FactorySettingsField.BeaconCount,
        action.payload
      );
    case FactoriesActionType.SET_BEACON:
      return StoreUtility.assignValue(
        state,
        FactorySettingsField.Beacon,
        action.payload
      );
    case FactoriesActionType.SET_BEACON_MODULES:
      return StoreUtility.assignValue(
        state,
        FactorySettingsField.BeaconModules,
        action.payload
      );
    default:
      return state;
  }
}
