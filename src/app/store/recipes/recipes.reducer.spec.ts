import { ItemId, Mocks, RecipeId } from 'src/tests';
import { StoreUtility } from '~/utilities';
import { Items } from '../';
import * as App from '../app.actions';
import * as Actions from './recipes.actions';
import { initialRecipesState, recipesReducer } from './recipes.reducer';

describe('Recipes Reducer', () => {
  describe('LOAD', () => {
    it('should load recipe settings', () => {
      const result = recipesReducer(
        undefined,
        new App.LoadAction({
          recipesState: Mocks.RecipesState,
        } as any),
      );
      expect(result).toEqual(Mocks.RecipesState);
    });
  });

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = recipesReducer(undefined, new App.ResetAction());
      expect(result).toEqual(initialRecipesState);
    });
  });

  describe('SET_EXCLUDED', () => {
    it('should set excluded state of an item', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetExcludedAction({
          id: RecipeId.Coal,
          value: true,
          def: false,
        }),
      );
      expect(result[RecipeId.Coal].excluded).toEqual(true);
    });

    it('should delete key if exclude matches default value', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetExcludedAction({
          id: RecipeId.Coal,
          value: true,
          def: true,
        }),
      );
      expect(result[RecipeId.Coal]).toBeUndefined();
    });
  });

  describe('SET_EXCLUDED_BATCH', () => {
    it('should apply multiple changes to excluded state', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetExcludedBatchAction([
          { id: RecipeId.Coal, value: true, def: false },
          { id: RecipeId.IronOre, value: false, def: false },
        ]),
      );
      expect(result[ItemId.Coal].excluded).toBeTrue();
      expect(result[ItemId.IronOre]).toBeUndefined();
    });
  });

  describe('SET_MACHINE', () => {
    it('should set the machine', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetMachineAction({
          id: Mocks.Recipe1.id,
          value: Mocks.Item1.id,
          def: undefined,
        }),
      );
      expect(result[Mocks.Recipe1.id].machineId).toEqual(Mocks.Item1.id);
    });

    it('should reset all other recipe settings', () => {
      const result = recipesReducer(
        {
          ...initialRecipesState,
          ...{
            [Mocks.Recipe1.id]: {
              machineModuleIds: ['test'],
              beacons: [{ count: '20', id: 'test', moduleIds: ['test'] }],
            },
          },
        },
        new Actions.SetMachineAction({
          id: Mocks.Recipe1.id,
          value: Mocks.Item1.id,
          def: undefined,
        }),
      );
      expect(result[Mocks.Recipe1.id]).toEqual({ machineId: Mocks.Item1.id });
    });
  });

  describe('SET_FUEL', () => {
    it('should set the fuel', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetFuelAction({
          id: Mocks.Recipe1.id,
          value: Mocks.Item1.id,
          def: undefined,
        }),
      );
      expect(result[Mocks.Recipe1.id].fuelId).toEqual(Mocks.Item1.id);
    });
  });

  describe('SET_MACHINE_MODULES', () => {
    it('should set the modules', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetMachineModulesAction({
          id: Mocks.Recipe1.id,
          value: [Mocks.Item1.id],
          def: undefined,
        }),
      );
      expect(result[Mocks.Recipe1.id].machineModuleIds).toEqual([
        Mocks.Item1.id,
      ]);
    });
  });

  describe('ADD_BEACON', () => {
    it('should add a beacon to a recipe', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.AddBeaconAction(Mocks.Recipe1.id),
      );
      expect(result[Mocks.Recipe1.id].beacons?.length).toEqual(2);
    });
  });

  describe('REMOVE_BEACON', () => {
    it('should remove a beacon from a recipe', () => {
      const result = recipesReducer(
        {
          ...initialRecipesState,
          ...{ [Mocks.Recipe1.id]: { beacons: undefined } },
        },
        new Actions.RemoveBeaconAction({ id: Mocks.Recipe1.id, value: 0 }),
      );
      expect(result[Mocks.Recipe1.id].beacons?.length).toEqual(0);
    });
  });

  describe('SET_BEACON_COUNT', () => {
    it('should set the beacon count', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetBeaconCountAction({
          id: Mocks.Recipe1.id,
          index: 0,
          value: '2',
          def: undefined,
        }),
      );
      expect(result[Mocks.Recipe1.id].beacons?.[0].count).toEqual('2');
    });
  });

  describe('SET_BEACON', () => {
    it('should set the beacon', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetBeaconAction({
          id: Mocks.Recipe1.id,
          index: 0,
          value: ItemId.Beacon,
          def: undefined,
        }),
      );
      expect(result[Mocks.Recipe1.id].beacons?.[0].id).toEqual(ItemId.Beacon);
    });

    it('should reset the beacon modules', () => {
      const result = recipesReducer(
        {
          ...initialRecipesState,
          ...{ [Mocks.Recipe1.id]: { beacons: [{ moduleIds: ['test'] }] } },
        },
        new Actions.SetBeaconAction({
          id: Mocks.Recipe1.id,
          index: 0,
          value: ItemId.Beacon,
          def: undefined,
        }),
      );
      expect(result[Mocks.Recipe1.id]).toEqual({
        beacons: [{ id: ItemId.Beacon }],
      });
    });
  });

  describe('SET_BEACON_MODULES', () => {
    it('should set the beacon module', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetBeaconModulesAction({
          id: Mocks.Recipe1.id,
          index: 0,
          value: [Mocks.Item1.id],
          def: undefined,
        }),
      );
      expect(result[Mocks.Recipe1.id].beacons?.[0].moduleIds).toEqual([
        Mocks.Item1.id,
      ]);
    });
  });

  describe('SET_BEACON_TOTAL', () => {
    it('should set the beacon total', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetBeaconTotalAction({
          id: Mocks.Recipe1.id,
          index: 0,
          value: '200',
        }),
      );
      expect(result[Mocks.Recipe1.id].beacons?.[0].total).toEqual('200');
    });
  });

  describe('SET_OVERCLOCK', () => {
    it('should set the overclock', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetOverclockAction({
          id: Mocks.Recipe1.id,
          value: 200,
          def: 100,
        }),
      );
      expect(result[Mocks.Recipe1.id].overclock).toEqual(200);
    });
  });

  describe('SET_COST', () => {
    it('should set the cost', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetCostAction({
          id: Mocks.Recipe1.id,
          value: '10',
        }),
      );
      expect(result[Mocks.Recipe1.id].cost).toEqual('10');
    });
  });

  describe('SET_CHECKED', () => {
    it('should set the checked state', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetCheckedAction({
          id: Mocks.Recipe1.id,
          value: true,
        }),
      );
      expect(result[Mocks.Recipe1.id].checked).toBeTrue();
    });
  });

  describe('RESET_RECIPE', () => {
    it('should reset a recipe', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.ResetRecipeAction(Mocks.Recipe1.id),
      );
      expect(result[Mocks.Recipe1.id]).toBeUndefined();
    });
  });

  describe('RESET_EXCLUDED', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      recipesReducer(undefined, new Actions.ResetExcludedAction());
      expect(StoreUtility.resetField).toHaveBeenCalledWith(
        {},
        'excluded' as any,
      );
    });
  });

  describe('RESET_RECIPE_FUEL', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      recipesReducer(
        undefined,
        new Actions.ResetRecipeFuelAction(Mocks.Recipe1.id),
      );
      expect(StoreUtility.resetField).toHaveBeenCalledWith(
        {},
        'fuelId' as any,
        Mocks.Recipe1.id,
      );
    });
  });

  describe('RESET_RECIPE_MODULES', () => {
    it(`should reset a recipe's modules`, () => {
      spyOn(StoreUtility, 'resetFields');
      recipesReducer(
        undefined,
        new Actions.ResetRecipeModulesAction(Mocks.Recipe1.id),
      );
      expect(StoreUtility.resetFields).toHaveBeenCalledWith(
        {},
        ['machineModuleIds', 'beacons'] as any,
        Mocks.Recipe1.id,
      );
    });
  });

  describe('RESET_MACHINE', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetFields');
      recipesReducer(undefined, new Actions.ResetMachinesAction());
      expect(StoreUtility.resetFields).toHaveBeenCalledWith({}, [
        'machineId',
        'fuelId',
        'overclock',
        'machineModuleIds',
        'beacons',
      ] as any);
    });
  });

  describe('RESET_BEACONS', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      recipesReducer(undefined, new Actions.ResetBeaconsAction());
      expect(StoreUtility.resetField).toHaveBeenCalledWith(
        {},
        'beacons' as any,
      );
    });
  });

  describe('RESET_COST', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      recipesReducer(undefined, new Actions.ResetCostAction());
      expect(StoreUtility.resetField).toHaveBeenCalledWith({}, 'cost' as any);
    });
  });

  describe('Items RESET_CHECKED', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetField');
      recipesReducer(undefined, new Items.ResetCheckedAction());
      expect(StoreUtility.resetField).toHaveBeenCalledWith(
        {},
        'checked' as any,
      );
    });
  });

  it('should return default state', () => {
    expect(recipesReducer(undefined, { type: 'Test' } as any)).toBe(
      initialRecipesState,
    );
  });
});
