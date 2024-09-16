import { createReducer, on } from '@ngrx/store';

import { spread } from '~/helpers';
import { Entities } from '~/models/entities';
import { FlowDiagram } from '~/models/enum/flow-diagram';
import { Game } from '~/models/enum/game';
import { Language } from '~/models/enum/language';
import { LinkValue } from '~/models/enum/link-value';
import { PowerUnit } from '~/models/enum/power-unit';
import { SankeyAlign } from '~/models/enum/sankey-align';
import { Theme } from '~/models/enum/theme';
import {
  ColumnsState,
  initialColumnsState,
} from '~/models/settings/column-settings';
import { FlowSettings } from '~/models/settings/flow-settings';
import { StoreUtility } from '~/utilities/store.utility';

import { reset } from '../app.actions';
import {
  removeState,
  saveState,
  setBypassLanding,
  setColumns,
  setConvertObjectiveValues,
  setDisablePaginator,
  setFlowSettings,
  setHideDuplicateIcons,
  setLanguage,
  setPaused,
  setPowerUnit,
  setRows,
  setShowTechLabels,
  setStates,
  setTheme,
} from './preferences.actions';

export interface PreferencesState {
  states: Record<Game, Entities>;
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

export const preferencesReducer = createReducer(
  initialPreferencesState,
  on(reset, (): PreferencesState => initialPreferencesState),
  on(saveState, (state, { key, id, value }) => {
    const gameStates = spread(state.states[key], { [id]: value });
    const states = spread(state.states, { [key]: gameStates });
    return spread(state, { states });
  }),
  on(removeState, (state, { key, id }) => {
    const gameStates = StoreUtility.removeEntry(state.states[key], id);
    const states = spread(state.states, { [key]: gameStates });
    return spread(state, { states });
  }),
  on(
    setStates,
    setColumns,
    setRows,
    setDisablePaginator,
    setLanguage,
    setPowerUnit,
    setTheme,
    setBypassLanding,
    setShowTechLabels,
    setHideDuplicateIcons,
    setPaused,
    setConvertObjectiveValues,
    setFlowSettings,
    (state, payload) => spread(state, payload),
  ),
);
