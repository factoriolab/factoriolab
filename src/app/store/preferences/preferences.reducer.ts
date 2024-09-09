import { createReducer, on } from '@ngrx/store';

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
import { StoreUtility } from '~/utilities';

import * as App from '../app.actions';
import * as Actions from './preferences.actions';

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

export const initialState: PreferencesState = {
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

export const preferencesReducer = createReducer(
  initialState,
  on(App.reset, (): PreferencesState => initialState),
  on(Actions.saveState, (state, { key, id, value }) => {
    const gameStates = spread(state.states[key], { [id]: value });
    const states = spread(state.states, { [key]: gameStates });
    return spread(state, { states });
  }),
  on(Actions.removeState, (state, { key, id }) => {
    const gameStates = StoreUtility.removeEntry(state.states[key], id);
    const states = spread(state.states, { [key]: gameStates });
    return spread(state, { states });
  }),
  on(
    Actions.setStates,
    Actions.setColumns,
    Actions.setRows,
    Actions.setDisablePaginator,
    Actions.setLanguage,
    Actions.setPowerUnit,
    Actions.setTheme,
    Actions.setBypassLanding,
    Actions.setShowTechLabels,
    Actions.setHideDuplicateIcons,
    Actions.setPaused,
    Actions.setConvertObjectiveValues,
    Actions.setFlowSettings,
    (state, payload) => spread(state, payload),
  ),
);
