import { data } from 'src/data';
import { AppData, Entities, ModData, ModHash, ModI18n } from '~/models';
import { DatasetsAction, DatasetsActionType } from './datasets.actions';

export interface DatasetsState extends AppData {
  dataEntities: Entities<ModData>;
  i18nEntities: Entities<ModI18n>;
  hashEntities: Entities<ModHash>;
}

export const initialDatasetsState: DatasetsState = {
  ...data,
  dataEntities: {},
  i18nEntities: {},
  hashEntities: {},
};

export function datasetsReducer(
  state: DatasetsState = initialDatasetsState,
  action: DatasetsAction
): DatasetsState {
  switch (action.type) {
    case DatasetsActionType.LOAD_MOD_DATA:
      return {
        ...state,
        ...{
          dataEntities: {
            ...state.dataEntities,
            ...{ [action.payload.id]: action.payload.value },
          },
        },
      };
    case DatasetsActionType.LOAD_MOD_I18N:
      return {
        ...state,
        ...{
          i18nEntities: {
            ...state.i18nEntities,
            ...{ [action.payload.id]: action.payload.value },
          },
        },
      };
    case DatasetsActionType.LOAD_MOD_HASH:
      return {
        ...state,
        ...{
          hashEntities: {
            ...state.hashEntities,
            ...{ [action.payload.id]: action.payload.value },
          },
        },
      };
    default:
      return state;
  }
}
