import { ItemId, Mocks, RecipeId } from 'src/tests';
import { RecipeObjective } from '~/models';
import { Items } from '../';
import * as App from '../app.actions';
import * as Recipes from '../recipes';
import * as Actions from './recipe-objectives.actions';
import {
  initialProducersState,
  producersReducer,
  ProducersState,
} from './recipe-objectives.reducer';

describe('Recipe Objectives Reducer', () => {
  const state = producersReducer(
    undefined,
    new Actions.AddAction(RecipeId.WoodenChest)
  );

  describe('LOAD', () => {
    it('should load a list of producers', () => {
      const producersState: ProducersState = {
        ids: ['0'],
        entities: { id: Mocks.Producer },
        index: 1,
      };
      const result = producersReducer(
        undefined,
        new App.LoadAction({ producersState })
      );
      expect(result).toEqual(producersState);
    });

    it('should skip loading producers state if null', () => {
      const result = producersReducer(undefined, new App.LoadAction({}));
      expect(result).toEqual(initialProducersState);
    });
  });

  describe('App RESET', () => {
    it('should reset the reducer', () => {
      const result = producersReducer(undefined, new App.ResetAction());
      expect(result).toEqual(initialProducersState);
    });
  });

  describe('ADD', () => {
    it('should add a new producer', () => {
      expect(state.ids.length).toEqual(1);
    });

    it('should use count from the last added producer', () => {
      const state: ProducersState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            recipeId: RecipeId.WoodenChest,
            count: '30',
          },
        },
        index: 1,
      };
      const result = producersReducer(
        state,
        new Actions.AddAction(RecipeId.Coal)
      );
      expect(result.entities['1']).toEqual({
        id: '1',
        recipeId: RecipeId.Coal,
        count: '30',
      });
    });
  });

  describe('CREATE', () => {
    it('should create a new producer', () => {
      const product: RecipeObjective = {
        id: '1',
        recipeId: RecipeId.IronPlate,
        count: '2',
      };
      const result = producersReducer(state, new Actions.CreateAction(product));
      expect(result.entities['0']).toEqual({
        id: '0',
        recipeId: RecipeId.IronPlate,
        count: '2',
      });
      expect(result.index).toEqual(1);
    });
  });

  describe('REMOVE', () => {
    it('should remove a producer', () => {
      const result = producersReducer(state, new Actions.RemoveAction('0'));
      expect(result.ids.length).toEqual(0);
    });
  });

  describe('SET_RECIPE', () => {
    it('should set recipe on a producer', () => {
      const result = producersReducer(
        state,
        new Actions.SetRecipeAction({ id: '0', value: RecipeId.Coal })
      );
      expect(result.entities['0'].recipeId).toEqual(RecipeId.Coal);
    });
  });

  describe('SET_COUNT', () => {
    it('should set count of a producer', () => {
      const result = producersReducer(
        state,
        new Actions.SetCountAction({ id: '0', value: '30' })
      );
      expect(result.entities['0'].count).toEqual('30');
    });
  });

  describe('SET_MACHINE', () => {
    it('should set machine on a producer', () => {
      const result = producersReducer(
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
    it('should set machine modules on a producers', () => {
      const result = producersReducer(
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
    it('should add a beacon to a producer', () => {
      const result = producersReducer(state, new Actions.AddBeaconAction('0'));
      expect(result.entities['0'].beacons?.length).toEqual(2);
    });
  });

  describe('REMOVE_BEACON', () => {
    it('should remove a beacon from a producer', () => {
      const result = producersReducer(
        state,
        new Actions.RemoveBeaconAction({ id: '0', value: 0 })
      );
      expect(result.entities['0'].beacons?.length).toEqual(0);
    });
  });

  describe('SET_BEACON_COUNT', () => {
    it('should set beacon count on a producer', () => {
      const result = producersReducer(
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
    it('should set beacon on a producer', () => {
      const result = producersReducer(
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
    it('should set beacon modules on a producers', () => {
      const result = producersReducer(
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
      const result = producersReducer(
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
    it('should set overclock on a producer', () => {
      const result = producersReducer(
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
    it('should set checked state on a producer', () => {
      const result = producersReducer(
        state,
        new Actions.SetCheckedAction({
          id: '0',
          value: true,
        })
      );
      expect(result.entities['0'].checked).toBeTrue();
    });
  });

  describe('RESET_PRODUCER', () => {
    it('should reset a producer', () => {
      const state: ProducersState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            recipeId: RecipeId.WoodenChest,
            count: '30',
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
      const result = producersReducer(
        state,
        new Actions.ResetObjectiveAction('0')
      );
      expect(result.entities['0']).toEqual({
        id: '0',
        recipeId: RecipeId.WoodenChest,
        count: '30',
      });
    });
  });

  describe('Recipes RESET_MACHINES', () => {
    it('should reset all producers', () => {
      const state: ProducersState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            recipeId: RecipeId.WoodenChest,
            count: '30',
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
      const result = producersReducer(state, new Recipes.ResetMachinesAction());
      expect(result.entities['0']).toEqual({
        id: '0',
        recipeId: RecipeId.WoodenChest,
        count: '30',
      });
    });
  });

  describe('Recipes RESET_BEACONS', () => {
    it('should reset beacons on all producers', () => {
      const state: ProducersState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            recipeId: RecipeId.WoodenChest,
            count: '30',
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
      const result = producersReducer(state, new Recipes.ResetBeaconsAction());
      expect(result.entities['0']).toEqual({
        id: '0',
        recipeId: RecipeId.WoodenChest,
        count: '30',
        machineId: 'machineId',
        overclock: 100,
      });
    });
  });

  describe('Items RESET_CHECKED', () => {
    it('should reset checked on all producers', () => {
      const state: ProducersState = {
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            recipeId: RecipeId.WoodenChest,
            count: '30',
            checked: true,
          },
        },
        index: 1,
      };
      const result = producersReducer(state, new Items.ResetCheckedAction());
      expect(result.entities['0']).toEqual({
        id: '0',
        recipeId: RecipeId.WoodenChest,
        count: '30',
      });
    });
  });

  it('should return default state', () => {
    expect(producersReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});
