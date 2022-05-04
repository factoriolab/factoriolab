import {
  AllColumns,
  Column,
  ColumnSettings,
  Entities,
  LinkValue,
  PowerUnit,
  SankeyAlign,
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
  linkSize: LinkValue;
  linkText: LinkValue;
  sankeyAlign: SankeyAlign;
  simplex: boolean;
  language: string;
  powerUnit: PowerUnit;
}

export const initialColumnsState: ColumnsState = AllColumns.reduce(
  (e: ColumnsState, c) => {
    e[c] = { show: true, precision: 1 };
    return e;
  },
  {}
);

export const initialPreferencesState: PreferencesState = {
  states: {},
  columns: initialColumnsState,
  linkSize: LinkValue.Items,
  linkText: LinkValue.Items,
  sankeyAlign: SankeyAlign.Justify,
  simplex: true,
  language: 'en',
  powerUnit: PowerUnit.Auto,
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
    case PreferencesActionType.SET_LINK_SIZE:
      return { ...state, ...{ linkSize: action.payload } };
    case PreferencesActionType.SET_LINK_TEXT:
      return { ...state, ...{ linkText: action.payload } };
    case PreferencesActionType.SET_SANKEY_ALIGN:
      return { ...state, ...{ sankeyAlign: action.payload } };
    case PreferencesActionType.SET_SIMPLEX:
      return { ...state, ...{ simplex: action.payload } };
    case PreferencesActionType.SET_LANGUAGE:
      return { ...state, ...{ language: action.payload } };
    case PreferencesActionType.SET_POWER_UNIT:
      return { ...state, ...{ powerUnit: action.payload } };
    default:
      return state;
  }
}
