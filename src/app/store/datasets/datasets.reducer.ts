import { Entities, ModData } from '~/models';
import { DatasetsAction, DatasetsActionType } from './datasets.actions';

export interface DatasetsState {
  app: ModData;
  baseIds: string[];
  baseEntities: Entities<ModData>;
  modIds: string[];
  modEntities: Entities<ModData>;
}

export const initialDatasetsState: DatasetsState = {
  app: null,
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
      return {
        ...state,
        ...{
          app: action.payload.app,
          baseIds: action.payload.base.map((m) => m.id),
          baseEntities: action.payload.base.reduce(
            (e: Entities<ModData>, m) => ({ ...e, ...{ [m.id]: m } }),
            {}
          ),
          modIds: action.payload.mods.map((m) => m.id),
          modEntities: action.payload.mods.reduce(
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
