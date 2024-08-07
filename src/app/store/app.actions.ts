import { createAction, props } from '@ngrx/store';

import { DatasetsState } from './datasets';
import { ItemsState } from './items';
import { MachinesState } from './machines';
import { ObjectivesState } from './objectives';
import { RecipesState } from './recipes';
import { PartialSettingsState } from './settings';

export interface PartialState {
  datasetsState?: DatasetsState;
  objectivesState?: ObjectivesState;
  itemsState?: ItemsState;
  recipesState?: RecipesState;
  machinesState?: MachinesState;
  settingsState?: PartialSettingsState;
}

const key = '[App]';
export const load = createAction(
  `${key} Load`,
  props<{ partial: PartialState }>(),
);
export const reset = createAction(`${key} Reset`);
