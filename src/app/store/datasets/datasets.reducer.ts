import { data } from 'src/data';
import { Entities, ModData, AppData } from '~/models';
import { DatasetsAction, DatasetsActionType } from './datasets.actions';

export interface DatasetsState extends AppData {
  dataEntities: Entities<ModData>;
}

export const initialDatasetsState: DatasetsState = {
  ...data,
  dataEntities: {},
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
          dataEntities: {
            ...state.dataEntities,
            ...{ [action.payload.id]: action.payload.value },
          },
        },
      };
    default:
      return state;
  }
}
