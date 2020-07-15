import { Entities, ModData } from '~/models';
import { DatasetsAction, DatasetsActionType } from './datasets.actions';

export interface DatasetsState {
  baseIds: string[];
  baseEntities: Entities<ModData>;
  modIds: string[];
  modEntities: Entities<ModData>;
}

export const initialDatasetsState: DatasetsState = {
  baseIds: [],
  baseEntities: {},
  modIds: [],
  modEntities: {},
};

export function datasetsReducer(
  state: DatasetsState = initialDatasetsState,
  action: DatasetsAction
): DatasetsState {
  switch (action.type) {
    case DatasetsActionType.LOAD: {
      const base = action.payload.filter((m) => m.base);
      const mods = action.payload.filter((m) => !m.base);
      return {
        ...state,
        ...{
          baseIds: base.map((m) => m.id),
          baseEntities: base.reduce(
            (e: Entities<ModData>, m) => ({ ...e, ...{ [m.id]: m } }),
            {}
          ),
          modIds: mods.map((m) => m.id),
          modEntities: mods.reduce(
            (e: Entities<ModData>, m) => ({ ...e, ...{ [m.id]: m } }),
            {}
          ),
        },
      };
    }
    default:
      return state;
  }
}
