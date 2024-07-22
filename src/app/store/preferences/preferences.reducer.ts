import { spread } from '~/helpers';
import {
  ColumnsState,
  Entities,
  FlowDiagram,
  FlowSettings,
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
  convertObjectiveValues: boolean;
  flowSettings: FlowSettings;
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
  convertObjectiveValues: false,
  flowSettings: {
    diagram: FlowDiagram.Sankey,
    linkSize: LinkValue.Items,
    linkText: LinkValue.Items,
    sankeyAlign: SankeyAlign.Justify,
    hideExcluded: false,
  },
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
      const gameStates = spread(state.states[key], { [id]: value });
      const states = spread(state.states, { [key]: gameStates });
      return spread(state, { states });
    }
    case PreferencesActionType.REMOVE_STATE: {
      const { key, id } = action.payload;
      const gameStates = { ...state.states[key] };
      delete gameStates[id];
      const states = spread(state.states, { [key]: gameStates });
      return spread(state, { states });
    }
    case PreferencesActionType.SET_STATES:
      return spread(state, { states: action.payload });
    case PreferencesActionType.SET_COLUMNS:
      return spread(state, {
        columns: action.payload,
        powerUnit: action.payload.power.show ? state.powerUnit : PowerUnit.Auto,
      });
    case PreferencesActionType.SET_ROWS:
      return spread(state, { rows: action.payload });
    case PreferencesActionType.SET_DISABLE_PAGINATOR:
      return spread(state, { disablePaginator: action.payload });
    case PreferencesActionType.SET_LANGUAGE:
      return spread(state, { language: action.payload });
    case PreferencesActionType.SET_POWER_UNIT:
      return spread(state, { powerUnit: action.payload });
    case PreferencesActionType.SET_THEME:
      return spread(state, { theme: action.payload });
    case PreferencesActionType.SET_BYPASS_LANDING:
      return spread(state, { bypassLanding: action.payload });
    case PreferencesActionType.SET_SHOW_TECH_LABELS:
      return spread(state, { showTechLabels: action.payload });
    case PreferencesActionType.SET_HIDE_DUPLICATE_ICONS:
      return spread(state, { hideDuplicateIcons: action.payload });
    case PreferencesActionType.SET_PAUSED:
      return spread(state, { paused: action.payload });
    case PreferencesActionType.SET_CONVERT_OBJECTIVE_VALUES:
      return spread(state, { convertObjectiveValues: action.payload });
    case PreferencesActionType.SET_FLOW_SETTINGS:
      return spread(state, { flowSettings: action.payload });
    default:
      return state;
  }
}
