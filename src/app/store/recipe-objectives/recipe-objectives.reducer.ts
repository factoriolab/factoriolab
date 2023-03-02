import { Entities, RecipeObjective } from '~/models';
import { StoreUtility } from '~/utilities';
import { Items } from '../';
import * as App from '../app.actions';
import * as Recipes from '../recipes';
import * as Settings from '../settings';
import {
  RecipeObjectivesAction,
  RecipeObjectivesActionType,
} from './recipe-objectives.actions';

export interface RecipeObjectivesState {
  ids: string[];
  entities: Entities<RecipeObjective>;
  index: number;
}

export const initialRecipeObjectivesState: RecipeObjectivesState = {
  ids: [],
  entities: {},
  index: 0,
};

export function recipeObjectivesReducer(
  state: RecipeObjectivesState = initialRecipeObjectivesState,
  action:
    | RecipeObjectivesAction
    | App.AppAction
    | Settings.SetModAction
    | Recipes.ResetMachinesAction
    | Recipes.ResetBeaconsAction
    | Items.ResetCheckedAction
): RecipeObjectivesState {
  switch (action.type) {
    case App.AppActionType.LOAD:
      return action.payload.recipeObjectivesState
        ? action.payload.recipeObjectivesState
        : initialRecipeObjectivesState;
    case App.AppActionType.RESET:
    case Settings.SettingsActionType.SET_MOD:
      return initialRecipeObjectivesState;
    case RecipeObjectivesActionType.ADD: {
      let count = '1';
      if (state.ids.length > 0) {
        // Use count from last objective in list
        const id = state.ids[state.ids.length - 1];
        count = state.entities[id].count;
      }
      return {
        ...state,
        ...{
          ids: [...state.ids, state.index.toString()],
          entities: {
            ...state.entities,
            ...{
              [state.index]: {
                id: state.index.toString(),
                recipeId: action.payload,
                count,
              },
            },
          },
          index: state.index + 1,
        },
      };
    }
    case RecipeObjectivesActionType.CREATE: {
      // Use full objective, but enforce id: '0'
      const recipeObjective = { ...action.payload, ...{ id: '0' } };
      return {
        ...state,
        ...{
          ids: [recipeObjective.id],
          entities: { [recipeObjective.id]: recipeObjective },
          index: 1,
        },
      };
    }
    case RecipeObjectivesActionType.REMOVE: {
      const newEntities = { ...state.entities };
      delete newEntities[action.payload];
      return {
        ...state,
        ...{
          ids: state.ids.filter((i) => i !== action.payload),
          entities: newEntities,
        },
      };
    }
    case RecipeObjectivesActionType.SET_RECIPE: {
      const entities = StoreUtility.assignValue(
        state.entities,
        'recipeId',
        action.payload
      );
      return {
        ...state,
        ...{
          entities: StoreUtility.resetFields(
            entities,
            ['machineId', 'machineModuleIds', 'beacons', 'overclock'],
            action.payload.id
          ),
        },
      };
    }
    case RecipeObjectivesActionType.SET_COUNT:
      return {
        ...state,
        ...{
          entities: StoreUtility.assignValue(
            state.entities,
            'count',
            action.payload
          ),
        },
      };
    case RecipeObjectivesActionType.SET_MACHINE:
      return {
        ...state,
        ...{
          entities: StoreUtility.resetFields(
            StoreUtility.compareReset(
              state.entities,
              'machineId',
              action.payload
            ),
            ['machineModuleIds', 'beacons'],
            action.payload.id
          ),
        },
      };
    case RecipeObjectivesActionType.SET_MACHINE_MODULES:
      return {
        ...state,
        ...{
          entities: StoreUtility.compareReset(
            state.entities,
            'machineModuleIds',
            action.payload
          ),
        },
      };
    case RecipeObjectivesActionType.ADD_BEACON:
      return {
        ...state,
        ...{
          entities: {
            ...state.entities,
            ...{
              [action.payload]: {
                ...state.entities[action.payload],
                ...{
                  beacons: [
                    ...(state.entities[action.payload]?.beacons ?? [{}]),
                    {},
                  ],
                },
              },
            },
          },
        },
      };
    case RecipeObjectivesActionType.REMOVE_BEACON:
      return {
        ...state,
        ...{
          entities: {
            ...state.entities,
            ...{
              [action.payload.id]: {
                ...state.entities[action.payload.id],
                ...{
                  beacons: (
                    state.entities[action.payload.id].beacons ?? [{}]
                  ).filter((v, i) => i !== action.payload.value),
                },
              },
            },
          },
        },
      };
    case RecipeObjectivesActionType.SET_BEACON_COUNT:
      return {
        ...state,
        ...{
          entities: StoreUtility.compareResetIndex(
            state.entities,
            'beacons',
            'count',
            action.payload
          ),
        },
      };
    case RecipeObjectivesActionType.SET_BEACON:
      return {
        ...state,
        ...{
          entities: StoreUtility.resetFieldIndex(
            StoreUtility.compareResetIndex(
              state.entities,
              'beacons',
              'id',
              action.payload
            ),
            'beacons',
            'moduleIds',
            action.payload.index,
            action.payload.id
          ),
        },
      };
    case RecipeObjectivesActionType.SET_BEACON_MODULES:
      return {
        ...state,
        ...{
          entities: StoreUtility.compareResetIndex(
            state.entities,
            'beacons',
            'moduleIds',
            action.payload,
            true
          ),
        },
      };
    case RecipeObjectivesActionType.SET_BEACON_TOTAL:
      return {
        ...state,
        ...{
          entities: StoreUtility.assignIndexValue(
            state.entities,
            'beacons',
            'total',
            action.payload
          ),
        },
      };
    case RecipeObjectivesActionType.SET_OVERCLOCK:
      return {
        ...state,
        ...{
          entities: StoreUtility.compareReset(
            state.entities,
            'overclock',
            action.payload
          ),
        },
      };
    case RecipeObjectivesActionType.SET_CHECKED:
      return {
        ...state,
        ...{
          entities: StoreUtility.compareReset(state.entities, 'checked', {
            id: action.payload.id,
            value: action.payload.value,
            def: false,
          }),
        },
      };
    case RecipeObjectivesActionType.RESET_OBJECTIVE:
      return {
        ...state,
        ...{
          entities: StoreUtility.resetFields(
            state.entities,
            ['machineId', 'overclock', 'machineModuleIds', 'beacons'],
            action.payload
          ),
        },
      };
    case Recipes.RecipesActionType.RESET_MACHINES:
      return {
        ...state,
        ...{
          entities: StoreUtility.resetFields(state.entities, [
            'machineId',
            'overclock',
            'machineModuleIds',
            'beacons',
          ]),
        },
      };
    case Recipes.RecipesActionType.RESET_BEACONS:
      return {
        ...state,
        ...{
          entities: StoreUtility.resetField(state.entities, 'beacons'),
        },
      };
    case Items.ItemsActionType.RESET_CHECKED:
      return {
        ...state,
        ...{
          entities: StoreUtility.resetField(state.entities, 'checked'),
        },
      };
    default:
      return state;
  }
}
