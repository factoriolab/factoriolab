import { Entities, FactorySettings, FactorySettingsField } from '~/models';
import { StoreUtility } from '~/utilities';
import { AppAction, AppActionType } from '../app.actions';
import { SetBaseAction, SettingsActionType } from '../settings';
import { FactoriesAction, FactoriesActionType } from './factories.actions';

export type FactoriesState = Entities<FactorySettings>;

export const initialFactoriesState: FactoriesState = {};

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
    case FactoriesActionType.SET_MODULE_RANK:
      return StoreUtility.compareReset(
        state,
        FactorySettingsField.ModuleRank,
        action.payload,
        true
      );
    case FactoriesActionType.SET_BEACON_COUNT:
      return StoreUtility.compareReset(
        state,
        FactorySettingsField.BeaconCount,
        action.payload
      );
    case FactoriesActionType.SET_BEACON:
      return StoreUtility.compareReset(
        state,
        FactorySettingsField.Beacon,
        action.payload
      );
    case FactoriesActionType.SET_BEACON_MODULE:
      return StoreUtility.compareReset(
        state,
        FactorySettingsField.BeaconModule,
        action.payload
      );
    default:
      return state;
  }
}
