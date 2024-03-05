import { data } from 'src/data';
import { AppData, Entities, ModData, ModHash, ModI18n } from '~/models';
import { DatasetsAction, DatasetsActionType } from './datasets.actions';

export interface DatasetsState extends AppData {
  dataRecord: Entities<ModData | undefined>;
  hashRecord: Entities<ModHash | undefined>;
  i18nRecord: Entities<ModI18n | undefined>;
}

export const initialDatasetsState: DatasetsState = {
  ...data,
  dataRecord: {},
  hashRecord: {},
  i18nRecord: {},
};

export function datasetsReducer(
  state: DatasetsState = initialDatasetsState,
  action: DatasetsAction,
): DatasetsState {
  switch (action.type) {
    case DatasetsActionType.LOAD_MOD:
      return {
        ...state,
        ...{
          dataRecord: action.payload.data
            ? {
                ...state.dataRecord,
                ...{ [action.payload.data.id]: action.payload.data.value },
              }
            : state.dataRecord,
          hashRecord: action.payload.hash
            ? {
                ...state.hashRecord,
                ...{ [action.payload.hash.id]: action.payload.hash.value },
              }
            : state.hashRecord,
          i18nRecord: action.payload.i18n
            ? {
                ...state.i18nRecord,
                ...{ [action.payload.i18n.id]: action.payload.i18n.value },
              }
            : state.i18nRecord,
        },
      };
    default:
      return state;
  }
}
