import {
  ColumnsState,
  Entities,
  FlowDiagram,
  Game,
  initialColumnsState,
  Language,
  LinkValue,
  PowerUnit,
  SankeyAlign,
  Theme,
} from '~/models';
import * as App from '../app.actions';
import {
  PreferencesAction,
  PreferencesActionType,
} from './preferences.actions';

export interface PreferencesState {
  states: Record<Game, Entities<string>>;
  columns: ColumnsState;
  language: Language;
  powerUnit: PowerUnit;
  theme: Theme;
  bypassLanding: boolean;
  showTechLabels: boolean;
  hideDuplicateIcons: boolean;
  rows: number;
  disablePaginator: boolean;
  paused: boolean;
  flowDiagram: FlowDiagram;
  linkSize: LinkValue;
  linkText: LinkValue;
  sankeyAlign: SankeyAlign;
  flowHideExcluded: boolean;
}

export const initialPreferencesState: PreferencesState = {
  states: {
    [Game.Factorio]: {},
    [Game.DysonSphereProgram]: {},
    [Game.Satisfactory]: {},
    [Game.CaptainOfIndustry]: {},
    [Game.Techtonica]: {},
    [Game.FinalFactory]: {},
  },
  columns: initialColumnsState,
  language: Language.English,
  powerUnit: PowerUnit.Auto,
  theme: Theme.Dark,
  bypassLanding: false,
  showTechLabels: false,
  hideDuplicateIcons: false,
  rows: 50,
  disablePaginator: false,
  paused: false,
  flowDiagram: FlowDiagram.Sankey,
  linkSize: LinkValue.Items,
  linkText: LinkValue.Items,
  sankeyAlign: SankeyAlign.Justify,
  flowHideExcluded: false,
};

export function preferencesReducer(
  state: PreferencesState = initialPreferencesState,
  action: PreferencesAction | App.AppAction,
): PreferencesState {
  switch (action.type) {
    case App.AppActionType.RESET:
      return initialPreferencesState;
    case PreferencesActionType.SAVE_STATE: {
      const { key, id, value } = action.payload;
      const gameStates = { ...state.states[key], ...{ [id]: value } };
      const states = { ...state.states, ...{ [key]: gameStates } };
      return { ...state, ...{ states } };
    }
    case PreferencesActionType.REMOVE_STATE: {
      const { key, id } = action.payload;
      const gameStates = { ...state.states[key] };
      delete gameStates[id];
      const states = { ...state.states, ...{ [key]: gameStates } };
      return { ...state, ...{ states } };
    }
    case PreferencesActionType.SET_STATES:
      return { ...state, ...{ states: action.payload } };
    case PreferencesActionType.SET_COLUMNS:
      return {
        ...state,
        ...{
          columns: action.payload,
          powerUnit: action.payload.power.show
            ? state.powerUnit
            : PowerUnit.Auto,
        },
      };
    case PreferencesActionType.SET_ROWS:
      return { ...state, ...{ rows: action.payload } };
    case PreferencesActionType.SET_DISABLE_PAGINATOR:
      return { ...state, ...{ disablePaginator: action.payload } };
    case PreferencesActionType.SET_LANGUAGE:
      return { ...state, ...{ language: action.payload } };
    case PreferencesActionType.SET_POWER_UNIT:
      return { ...state, ...{ powerUnit: action.payload } };
    case PreferencesActionType.SET_THEME:
      return { ...state, ...{ theme: action.payload } };
    case PreferencesActionType.SET_BYPASS_LANDING:
      return { ...state, ...{ bypassLanding: action.payload } };
    case PreferencesActionType.SET_SHOW_TECH_LABELS:
      return { ...state, ...{ showTechLabels: action.payload } };
    case PreferencesActionType.SET_HIDE_DUPLICATE_ICONS:
      return { ...state, ...{ hideDuplicateIcons: action.payload } };
    case PreferencesActionType.SET_PAUSED:
      return { ...state, ...{ paused: action.payload } };
    case PreferencesActionType.SET_FLOW_DIAGRAM:
      return { ...state, ...{ flowDiagram: action.payload } };
    case PreferencesActionType.SET_LINK_SIZE:
      return { ...state, ...{ linkSize: action.payload } };
    case PreferencesActionType.SET_LINK_TEXT:
      return { ...state, ...{ linkText: action.payload } };
    case PreferencesActionType.SET_SANKEY_ALIGN:
      return { ...state, ...{ sankeyAlign: action.payload } };
    case PreferencesActionType.SET_FLOW_HIDE_EXCLUDED:
      return { ...state, ...{ flowHideExcluded: action.payload } };
    default:
      return state;
  }
}
