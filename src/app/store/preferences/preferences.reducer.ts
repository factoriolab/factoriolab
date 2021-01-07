import { Entities, LinkValue } from '~/models';
import { AppAction, AppActionType } from '../app.actions';
import {
  PreferencesAction,
  PreferencesActionType,
} from './preferences.actions';

export interface PreferencesState {
  states: Entities<string>;
  linkValue?: LinkValue;
}

export const initialPreferencesState: PreferencesState = {
  states: {},
  linkValue: LinkValue.Items,
};

export function preferencesReducer(
  state: PreferencesState = initialPreferencesState,
  action: PreferencesAction | AppAction
): PreferencesState {
  switch (action.type) {
    case AppActionType.RESET:
      return initialPreferencesState;
    case PreferencesActionType.SAVE_STATE: {
      const states = {
        ...state.states,
        ...{ [action.payload.id]: action.payload.value },
      };
      return { ...state, ...{ states } };
    }
    case PreferencesActionType.DELETE_STATE: {
      const states = { ...state.states };
      delete states[action.payload];
      return { ...state, ...{ states } };
    }
    case PreferencesActionType.SET_LINK_VALUE:
      return { ...state, ...{ linkValue: action.payload } };
    default:
      return state;
  }
}
