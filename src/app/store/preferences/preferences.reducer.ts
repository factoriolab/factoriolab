import { Entities, LinkValue, Sort, Theme } from '~/models';
import { AppAction, AppActionType } from '../app.actions';
import {
  PreferencesAction,
  PreferencesActionType,
} from './preferences.actions';

export interface PreferencesState {
  states: Entities<string>;
  sort?: Sort;
  linkValue?: LinkValue;
  theme?: Theme;
  showHeader?: boolean;
}

export const initialPreferencesState: PreferencesState = {
  states: {},
  sort: Sort.DepthFirst,
  linkValue: LinkValue.Items,
  theme: Theme.DarkMode,
  showHeader: true,
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
    case PreferencesActionType.SET_SORT:
      return { ...state, ...{ sort: action.payload } };
    case PreferencesActionType.SET_LINK_VALUE:
      return { ...state, ...{ linkValue: action.payload } };
    case PreferencesActionType.SET_THEME:
      return { ...state, ...{ theme: action.payload } };
    case PreferencesActionType.SHOW_HEADER:
      return { ...state, ...{ showHeader: true } };
    case PreferencesActionType.HIDE_HEADER:
      return { ...state, ...{ showHeader: false } };
    default:
      return state;
  }
}
