import { ColumnSettings, ColumnSettingsField, Entities } from '~/models';
import { StoreUtility } from '~/utilities';
import { AppAction, AppActionType } from '../app.actions';
import { ColumnsAction, ColumnsActionType } from './columns.actions';

export type ColumnsState = Entities<ColumnSettings>;

export const initialColumnsState: ColumnsState = {};

export function columnsReducer(
  state: ColumnsState = initialColumnsState,
  action: ColumnsAction | AppAction
): ColumnsState {
  switch (action.type) {
    case AppActionType.RESET:
      return initialColumnsState;
    case ColumnsActionType.IGNORE:
      return StoreUtility.assignValue(state, ColumnSettingsField.Ignore, {
        id: action.payload,
        value: !state[action.payload]?.ignore,
      });
    case ColumnsActionType.SET_PRECISION:
      return StoreUtility.assignValue(state, ColumnSettingsField.Precision, {
        id: action.payload.id,
        value: action.payload.value,
      });
    default:
      return state;
  }
}
