import { ItemId, Mocks, RecipeId } from 'src/tests';
import { ObjectiveType, RecipeObjective } from '~/models';
import { Items } from '../';
import * as App from '../app.actions';
import * as Recipes from '../recipes';
import * as Actions from './recipe-objectives.actions';
import {
  initialRecipeObjectivesState,
  recipeObjectivesReducer,
  RecipeObjectivesState,
} from './recipe-objectives.reducer';

describe('Recipe Objectives Reducer', () => {
  const state = recipeObjectivesReducer(
    undefined,
    new Actions.AddAction(RecipeId.WoodenChest)
  );

  describe('LOAD', () => {
    it('should load a list of objectives', () => {
      const recipeObjectivesState: RecipeObjectivesState = {
        ids: ['0'],
        entities: { id: Mocks.RecipeObjective },
        index: 1,
      };
      const result = recipeObjectivesReducer(
        undefined,
        new App.LoadAction({ recipeObjectivesState })
      );
      expect(result).toEqual(recipeObjectivesState);
    });

    it('should skip loading objectives state if null', () => {
      const result = recipeObjectivesReducer(undefined, new App.LoadAction({}));
      expect(result).toEqual(initialRecipeObjectivesState);
    });
  });

  describe('App RESET', () => {
    it('should reset the reducer', () => {
      const result = recipeObjectivesReducer(undefined, new App.ResetAction());
      expect(result).toEqual(initialRecipeObjectivesState);
    });
  });

  describe('ADD', () => {
    it('should add a new objective', () => {
      expect(state.ids.length).toEqual(1);
    });

    it('should use count from the last added objective', () => {
      const state: RecipeObjectivesState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            recipeId: RecipeId.WoodenChest,
            count: '30',
            type: ObjectiveType.Output,
          },
        },
        index: 1,
      };
      const result = recipeObjectivesReducer(
        state,
        new Actions.AddAction(RecipeId.Coal)
      );
      expect(result.entities['1']).toEqual({
        id: '1',
        recipeId: RecipeId.Coal,
        count: '30',
        type: ObjectiveType.Output,
      });
    });
  });

  describe('CREATE', () => {
    it('should create a new objective', () => {
      const objective: RecipeObjective = {
        id: '1',
        recipeId: RecipeId.IronPlate,
        count: '2',
        type: ObjectiveType.Output,
      };
      const result = recipeObjectivesReducer(
        state,
        new Actions.CreateAction(objective)
      );
      expect(result.entities['0']).toEqual({
        id: '0',
        recipeId: RecipeId.IronPlate,
        count: '2',
        type: ObjectiveType.Output,
      });
      expect(result.index).toEqual(1);
    });
  });

  describe('REMOVE', () => {
    it('should remove a objective', () => {
      const result = recipeObjectivesReducer(
        state,
        new Actions.RemoveAction('0')
      );
      expect(result.ids.length).toEqual(0);
    });
  });

  describe('SET_RECIPE', () => {
    it('should set recipe on a objective', () => {
      const result = recipeObjectivesReducer(
        state,
        new Actions.SetRecipeAction({ id: '0', value: RecipeId.Coal })
      );
      expect(result.entities['0'].recipeId).toEqual(RecipeId.Coal);
    });
  });

  describe('SET_COUNT', () => {
    it('should set count of a objective', () => {
      const result = recipeObjectivesReducer(
        state,
        new Actions.SetCountAction({ id: '0', value: '30' })
      );
      expect(result.entities['0'].count).toEqual('30');
    });
  });

  describe('SET_MACHINE', () => {
    it('should set machine on a objective', () => {
      const result = recipeObjectivesReducer(
        state,
        new Actions.SetMachineAction({
          id: '0',
          value: ItemId.AssemblingMachine2,
          def: ItemId.AssemblingMachine1,
        })
      );
      expect(result.entities['0'].machineId).toEqual(ItemId.AssemblingMachine2);
    });
  });

  describe('SET_MACHINE_MODULES', () => {
    it('should set machine modules on a objective', () => {
      const result = recipeObjectivesReducer(
        state,
        new Actions.SetMachineModulesAction({
          id: '0',
          value: [ItemId.SpeedModule],
          def: [ItemId.Module],
        })
      );
      expect(result.entities['0'].machineModuleIds).toEqual([
        ItemId.SpeedModule,
      ]);
    });
  });

  describe('ADD_BEACON', () => {
    it('should add a beacon to a objective', () => {
      const result = recipeObjectivesReducer(
        state,
        new Actions.AddBeaconAction('0')
      );
      expect(result.entities['0'].beacons?.length).toEqual(2);
    });
  });

  describe('REMOVE_BEACON', () => {
    it('should remove a beacon from a objective', () => {
      const result = recipeObjectivesReducer(
        state,
        new Actions.RemoveBeaconAction({ id: '0', value: 0 })
      );
      expect(result.entities['0'].beacons?.length).toEqual(0);
    });
  });

  describe('SET_BEACON_COUNT', () => {
    it('should set beacon count on a objective', () => {
      const result = recipeObjectivesReducer(
        state,
        new Actions.SetBeaconCountAction({
          id: '0',
          index: 0,
          value: '8',
          def: '0',
        })
      );
      expect(result.entities['0'].beacons?.[0].count).toEqual('8');
    });
  });

  describe('SET_BEACON', () => {
    it('should set beacon on a objective', () => {
      const result = recipeObjectivesReducer(
        state,
        new Actions.SetBeaconAction({
          id: '0',
          index: 0,
          value: ItemId.Beacon,
          def: ItemId.AssemblingMachine1,
        })
      );
      expect(result.entities['0'].beacons?.[0].id).toEqual(ItemId.Beacon);
    });
  });

  describe('SET_BEACON_MODULES', () => {
    it('should set beacon modules on a objective', () => {
      const result = recipeObjectivesReducer(
        state,
        new Actions.SetBeaconModulesAction({
          id: '0',
          index: 0,
          value: [ItemId.SpeedModule],
          def: [ItemId.Module],
        })
      );
      expect(result.entities['0'].beacons?.[0].moduleIds).toEqual([
        ItemId.SpeedModule,
      ]);
    });
  });

  describe('SET_BEACON_TOTAL', () => {
    it('should set the beacon total', () => {
      const result = recipeObjectivesReducer(
        state,
        new Actions.SetBeaconTotalAction({
          id: '0',
          index: 0,
          value: '200',
        })
      );
      expect(result.entities['0'].beacons?.[0].total).toEqual('200');
    });
  });

  describe('SET_OVERCLOCK', () => {
    it('should set overclock on a objective', () => {
      const result = recipeObjectivesReducer(
        state,
        new Actions.SetOverclockAction({
          id: '0',
          value: 200,
          def: 100,
        })
      );
      expect(result.entities['0'].overclock).toEqual(200);
    });
  });

  describe('SET_CHECKED', () => {
    it('should set checked state on a objective', () => {
      const result = recipeObjectivesReducer(
        state,
        new Actions.SetCheckedAction({
          id: '0',
          value: true,
        })
      );
      expect(result.entities['0'].checked).toBeTrue();
    });
  });

  describe('RESET_OBJECTIVE', () => {
    it('should reset a objective', () => {
      const state: RecipeObjectivesState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            recipeId: RecipeId.WoodenChest,
            count: '30',
            type: ObjectiveType.Output,
            machineId: 'machineId',
            overclock: 100,
            beacons: [
              {
                count: 'beaconCount',
                id: 'beaconId',
                moduleIds: ['beaconModuleIds'],
              },
            ],
          },
        },
        index: 1,
      };
      const result = recipeObjectivesReducer(
        state,
        new Actions.ResetObjectiveAction('0')
      );
      expect(result.entities['0']).toEqual({
        id: '0',
        recipeId: RecipeId.WoodenChest,
        count: '30',
        type: ObjectiveType.Output,
      });
    });
  });

  describe('Recipes RESET_MACHINES', () => {
    it('should reset all objectives', () => {
      const state: RecipeObjectivesState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            recipeId: RecipeId.WoodenChest,
            count: '30',
            type: ObjectiveType.Output,
            machineId: 'machineId',
            overclock: 100,
            beacons: [
              {
                count: 'beaconCount',
                id: 'beaconId',
                moduleIds: ['beaconModuleIds'],
              },
            ],
          },
        },
        index: 1,
      };
      const result = recipeObjectivesReducer(
        state,
        new Recipes.ResetMachinesAction()
      );
      expect(result.entities['0']).toEqual({
        id: '0',
        recipeId: RecipeId.WoodenChest,
        count: '30',
        type: ObjectiveType.Output,
      });
    });
  });

  describe('Recipes RESET_BEACONS', () => {
    it('should reset beacons on all objectives', () => {
      const state: RecipeObjectivesState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            recipeId: RecipeId.WoodenChest,
            count: '30',
            type: ObjectiveType.Output,
            machineId: 'machineId',
            overclock: 100,
            beacons: [
              {
                count: 'beaconCount',
                id: 'beaconId',
                moduleIds: ['beaconModuleIds'],
              },
            ],
          },
        },
        index: 1,
      };
      const result = recipeObjectivesReducer(
        state,
        new Recipes.ResetBeaconsAction()
      );
      expect(result.entities['0']).toEqual({
        id: '0',
        recipeId: RecipeId.WoodenChest,
        count: '30',
        type: ObjectiveType.Output,
        machineId: 'machineId',
        overclock: 100,
      });
    });
  });

  describe('Items RESET_CHECKED', () => {
    it('should reset checked on all objectives', () => {
      const state: RecipeObjectivesState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            recipeId: RecipeId.WoodenChest,
            count: '30',
            type: ObjectiveType.Output,
            checked: true,
          },
        },
        index: 1,
      };
      const result = recipeObjectivesReducer(
        state,
        new Items.ResetCheckedAction()
      );
      expect(result.entities['0']).toEqual({
        id: '0',
        recipeId: RecipeId.WoodenChest,
        count: '30',
        type: ObjectiveType.Output,
      });
    });
  });

  it('should return default state', () => {
    expect(recipeObjectivesReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});
