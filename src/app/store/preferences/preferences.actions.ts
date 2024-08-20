import { createAction, props } from '@ngrx/store';

import {
  ColumnsState,
  Entities,
  FlowSettings,
  Game,
  Language,
  PowerUnit,
  Theme,
} from '~/models';

const key = '[Preferences]';
export const saveState = createAction(
  `${key} Save State`,
  props<{ key: Game; id: string; value: string }>(),
);
export const removeState = createAction(
  `${key} Remove State`,
  props<{ key: Game; id: string }>(),
);
export const setStates = createAction(
  `${key} Set States`,
  props<{ states: Record<Game, Entities<string>> }>(),
);
export const setColumns = createAction(
  `${key} Set Columns`,
  props<{ columns: ColumnsState }>(),
);
export const setRows = createAction(
  `${key} Set Rows`,
  props<{ rows: number }>(),
);
export const setDisablePaginator = createAction(
  `${key} Set Disable Paginator`,
  props<{ disablePaginator: boolean }>(),
);
export const setLanguage = createAction(
  `${key} Set Language`,
  props<{ language: Language }>(),
);
export const setPowerUnit = createAction(
  `${key} Set Power Unit`,
  props<{ powerUnit: PowerUnit }>(),
);
export const setTheme = createAction(
  `${key} Set Theme`,
  props<{ theme: Theme }>(),
);
export const setBypassLanding = createAction(
  `${key} Set Bypass Landing`,
  props<{ bypassLanding: boolean }>(),
);
export const setShowTechLabels = createAction(
  `${key} Set Show Tech Labels`,
  props<{ showTechLabels: boolean }>(),
);
export const setHideDuplicateIcons = createAction(
  `${key} Set Hide Duplicate Icons`,
  props<{ hideDuplicateIcons: boolean }>(),
);
export const setPaused = createAction(
  `${key} Set Paused`,
  props<{ paused: boolean }>(),
);
export const setConvertObjectiveValues = createAction(
  `${key} Set Convert Objective Values`,
  props<{ convertObjectiveValues: boolean }>(),
);
export const setFlowSettings = createAction(
  `${key} Set Flow Settings`,
  props<{ flowSettings: FlowSettings }>(),
);
