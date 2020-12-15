import {
  ColumnSettings,
  ColumnSettingsField,
  DefaultColumnSettings,
  Entities,
} from '~/models';
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
      return StoreUtility.compareReset(state, ColumnSettingsField.Ignore, {
        id: action.payload,
        value: !state[action.payload]?.ignore,
        default: DefaultColumnSettings.ignore,
      });
    case ColumnsActionType.SET_PRECISION:
      return StoreUtility.compareReset(state, ColumnSettingsField.Precision, {
        id: action.payload.id,
        value: action.payload.value,
        default: DefaultColumnSettings.precision,
      });
    default:
      return state;
  }
}
