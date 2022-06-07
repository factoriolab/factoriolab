import { data } from 'src/data';
import { AppData, Entities, ModData, ModHash, ModI18n } from '~/models';
import { DatasetsAction, DatasetsActionType } from './datasets.actions';

export interface DatasetsState extends AppData {
  dataEntities: Entities<ModData>;
  hashEntities: Entities<ModHash>;
  i18nEntities: Entities<ModI18n>;
}

export const initialDatasetsState: DatasetsState = {
  ...data,
  dataEntities: {},
  hashEntities: {},
  i18nEntities: {},
};

export function datasetsReducer(
  state: DatasetsState = initialDatasetsState,
  action: DatasetsAction
): DatasetsState {
  switch (action.type) {
    case DatasetsActionType.LOAD_MOD:
      return {
        ...state,
        ...{
          dataEntities: action.payload.data
            ? {
                ...state.dataEntities,
                ...{ [action.payload.data.id]: action.payload.data.value },
              }
            : state.dataEntities,
          hashEntities: action.payload.hash
            ? {
                ...state.hashEntities,
                ...{ [action.payload.hash.id]: action.payload.hash.value },
              }
            : state.hashEntities,
          i18nEntities: action.payload.i18n
            ? {
                ...state.i18nEntities,
                ...{ [action.payload.i18n.id]: action.payload.i18n.value },
              }
            : state.i18nEntities,
        },
      };
    default:
      return state;
  }
}
