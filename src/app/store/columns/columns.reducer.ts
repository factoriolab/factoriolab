import { AllColumns, Entities } from '~/models';
import { AppAction, AppActionType } from '../app.actions';
import { ColumnsAction, ColumnsActionType } from './columns.actions';

export type ColumnsState = {
  ids: string[];
  precision: Entities<number>;
};

export const initialColumnsState: ColumnsState = {
  ids: AllColumns,
  precision: {},
};

export function columnsReducer(
  state: ColumnsState = initialColumnsState,
  action: ColumnsAction | AppAction
): ColumnsState {
  switch (action.type) {
    case AppActionType.RESET:
      return initialColumnsState;
    case ColumnsActionType.SET_COLUMNS:
      return { ...state, ...{ ids: action.payload } };
    case ColumnsActionType.SET_PRECISION:
      return {
        ...state,
        ...{
          precision: {
            ...state.precision,
            ...{ [action.payload.id]: action.payload.value },
          },
        },
      };
    default:
      return state;
  }
}
