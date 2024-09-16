import { createAction, props } from '@ngrx/store';

import { ItemsState } from './items/items.reducer';
import { MachinesState } from './machines/machines.reducer';
import { ObjectivesState } from './objectives/objectives.reducer';
import { RecipesState } from './recipes/recipes.reducer';
import { PartialSettingsState } from './settings/settings.reducer';

export interface PartialState {
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
