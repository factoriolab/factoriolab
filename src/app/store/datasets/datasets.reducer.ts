import { data } from 'src/data';
import { Entities, ModData, AppData, ModHash } from '~/models';
import { DatasetsAction, DatasetsActionType } from './datasets.actions';

export interface DatasetsState extends AppData {
  dataEntities: Entities<ModData>;
  hashEntities: Entities<ModHash>;
}

export const initialDatasetsState: DatasetsState = {
  ...data,
  dataEntities: {},
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
