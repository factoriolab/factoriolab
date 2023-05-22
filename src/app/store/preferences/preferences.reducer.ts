import {
  allColumns,
  Column,
  ColumnSettings,
  Entities,
  initialColumns,
  Language,
  PowerUnit,
  SimplexType,
  Theme,
} from '~/models';
import * as App from '../app.actions';
import {
  PreferencesAction,
  PreferencesActionType,
} from './preferences.actions';

export type ColumnsState = Entities<ColumnSettings>;

export interface PreferencesState {
  states: Entities<string>;
  columns: ColumnsState;
  simplexType: SimplexType;
  language: Language;
  powerUnit: PowerUnit;
  theme: Theme;
  bypassLanding: boolean;
}

export const initialColumnsState: ColumnsState = allColumns.reduce(
  (e: ColumnsState, c) => {
    e[c] = { show: initialColumns.indexOf(c) !== -1, precision: 1 };
    return e;
  },
  {}
);

export const initialPreferencesState: PreferencesState = {
  states: {},
  columns: initialColumnsState,
  simplexType: SimplexType.WasmFloat64,
  language: Language.English,
  powerUnit: PowerUnit.Auto,
  theme: Theme.Dark,
  bypassLanding: false,
};

export function preferencesReducer(
  state: PreferencesState = initialPreferencesState,
  action: PreferencesAction | App.AppAction
): PreferencesState {
  switch (action.type) {
    case App.AppActionType.RESET:
      return initialPreferencesState;
    case PreferencesActionType.SAVE_STATE: {
      const states = {
        ...state.states,
        ...{ [action.payload.id]: action.payload.value },
      };
      return { ...state, ...{ states } };
    }
    case PreferencesActionType.REMOVE_STATE: {
      const states = { ...state.states };
      delete states[action.payload];
      return { ...state, ...{ states } };
    }
    case PreferencesActionType.SET_COLUMNS:
      return {
        ...state,
        ...{
          columns: action.payload,
          powerUnit: action.payload[Column.Power].show
            ? state.powerUnit
            : PowerUnit.Auto,
        },
      };
    case PreferencesActionType.SET_SIMPLEX_TYPE:
      return { ...state, ...{ simplexType: action.payload } };
    case PreferencesActionType.SET_LANGUAGE:
      return { ...state, ...{ language: action.payload } };
    case PreferencesActionType.SET_POWER_UNIT:
      return { ...state, ...{ powerUnit: action.payload } };
    case PreferencesActionType.SET_THEME:
      return { ...state, ...{ theme: action.payload } };
    case PreferencesActionType.SET_BYPASS_LANDING:
      return { ...state, ...{ bypassLanding: action.payload } };
    default:
      return state;
  }
}
