import {
  Entities,
  IdValueDefaultPayload,
  Rational,
  RecipeSettings,
} from '~/models';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Items from '../items';
import * as Settings from '../settings';
import { RecipesAction, RecipesActionType } from './recipes.actions';

export type RecipesState = Entities<RecipeSettings>;

export const initialRecipesState: RecipesState = {};

export function recipesReducer(
  state: RecipesState = initialRecipesState,
  action:
    | RecipesAction
    | App.AppAction
    | Settings.SetModAction
    | Items.ResetCheckedAction,
): RecipesState {
  switch (action.type) {
    case App.AppActionType.LOAD:
      return { ...initialRecipesState, ...action.payload.recipesState };
    case App.AppActionType.RESET:
    case Settings.SettingsActionType.SET_MOD:
      return initialRecipesState;
    case RecipesActionType.SET_EXCLUDED:
      return StoreUtility.compareReset(state, 'excluded', action.payload);
    case RecipesActionType.SET_EXCLUDED_BATCH: {
      state = { ...state };
      for (const entry of action.payload) {
        state = StoreUtility.compareReset(state, 'excluded', entry);
      }

      return state;
    }
    case RecipesActionType.SET_CHECKED:
      return StoreUtility.compareReset(state, 'checked', {
        id: action.payload.id,
        value: action.payload.value,
        def: false,
      });
    case RecipesActionType.SET_MACHINE:
      return StoreUtility.resetFields(
        StoreUtility.compareReset(state, 'machineId', action.payload),
        ['fuelId', 'modules', 'beacons'],
        action.payload.id,
      );
    case RecipesActionType.SET_FUEL:
      return StoreUtility.compareReset(state, 'fuelId', action.payload);
    case RecipesActionType.SET_MODULES:
      return StoreUtility.setValue(state, 'modules', action.payload);
    case RecipesActionType.SET_BEACONS:
      return StoreUtility.setValue(state, 'beacons', action.payload);
    case RecipesActionType.SET_OVERCLOCK:
      return StoreUtility.compareReset(state, 'overclock', action.payload);
    case RecipesActionType.SET_COST:
      return StoreUtility.compareReset(
        state,
        'cost',
        action.payload as IdValueDefaultPayload<Rational>,
      );
    case RecipesActionType.RESET_RECIPE: {
      const newState = { ...state };
      delete newState[action.payload];
      return newState;
    }
    case RecipesActionType.RESET_EXCLUDED:
      return StoreUtility.resetField(state, 'excluded');
    case RecipesActionType.RESET_RECIPE_MACHINE:
      return StoreUtility.resetFields(
        state,
        ['fuelId', 'modules', 'beacons'],
        action.payload,
      );
    case RecipesActionType.RESET_MACHINES:
      return StoreUtility.resetFields(state, [
        'machineId',
        'fuelId',
        'overclock',
        'modules',
        'beacons',
      ]);
    case Items.ItemsActionType.RESET_CHECKED:
      return StoreUtility.resetField(state, 'checked');
    case RecipesActionType.RESET_BEACONS:
      return StoreUtility.resetField(state, 'beacons');
    case RecipesActionType.RESET_COST:
      return StoreUtility.resetField(state, 'cost');
    default:
      return state;
  }
}
