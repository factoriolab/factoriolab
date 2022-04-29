import { ItemId, Mocks } from 'src/tests';
import { StoreUtility } from '~/utilities';
import * as App from '../app.actions';
import * as Actions from './recipes.actions';
import { initialRecipesState, recipesReducer } from './recipes.reducer';

describe('Recipes Reducer', () => {
  describe('LOAD', () => {
    it('should load recipe settings', () => {
      const result = recipesReducer(
        undefined,
        new App.LoadAction({
          recipesState: Mocks.RecipeSettingsEntities,
        } as any)
      );
      expect(result).toEqual(Mocks.RecipeSettingsEntities);
    });
  });

  describe('RESET', () => {
    it('should return the initial state', () => {
      const result = recipesReducer(undefined, new App.ResetAction());
      expect(result).toEqual(initialRecipesState);
    });
  });

  describe('SET_FACTORY', () => {
    it('should set the factory', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetFactoryAction({
          id: Mocks.Recipe1.id,
          value: Mocks.Item1.id,
          def: undefined,
        })
      );
      expect(result[Mocks.Recipe1.id].factoryId).toEqual(Mocks.Item1.id);
    });

    it('should reset all other recipe settings', () => {
      const result = recipesReducer(
        {
          ...initialRecipesState,
          ...{
            [Mocks.Recipe1.id]: {
              factoryModuleIds: ['test'],
              beaconCount: '20',
              beaconId: 'test',
              beaconModuleIds: ['test'],
            },
          },
        },
        new Actions.SetFactoryAction({
          id: Mocks.Recipe1.id,
          value: Mocks.Item1.id,
          def: undefined,
        })
      );
      expect(result[Mocks.Recipe1.id]).toEqual({ factoryId: Mocks.Item1.id });
    });
  });

  describe('SET_FACTORY_MODULES', () => {
    it('should set the modules', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetFactoryModulesAction({
          id: Mocks.Recipe1.id,
          value: [Mocks.Item1.id],
          def: undefined,
        })
      );
      expect(result[Mocks.Recipe1.id].factoryModuleIds).toEqual([
        Mocks.Item1.id,
      ]);
    });
  });

  describe('SET_BEACON_COUNT', () => {
    it('should set the beacon count', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetBeaconCountAction({
          id: Mocks.Recipe1.id,
          value: '2',
          def: undefined,
        })
      );
      expect(result[Mocks.Recipe1.id].beaconCount).toEqual('2');
    });
  });

  describe('SET_BEACON', () => {
    it('should set the beacon', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetBeaconAction({
          id: Mocks.Recipe1.id,
          value: ItemId.Beacon,
          def: undefined,
        })
      );
      expect(result[Mocks.Recipe1.id].beaconId).toEqual(ItemId.Beacon);
    });

    it('should reset the beacon modules', () => {
      const result = recipesReducer(
        {
          ...initialRecipesState,
          ...{ [Mocks.Recipe1.id]: { beaconModuleIds: ['test'] } },
        },
        new Actions.SetBeaconAction({
          id: Mocks.Recipe1.id,
          value: ItemId.Beacon,
          def: undefined,
        })
      );
      expect(result[Mocks.Recipe1.id]).toEqual({ beaconId: ItemId.Beacon });
    });
  });

  describe('SET_BEACON_MODULES', () => {
    it('should set the beacon module', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetBeaconModulesAction({
          id: Mocks.Recipe1.id,
          value: [Mocks.Item1.id],
          def: undefined,
        })
      );
      expect(result[Mocks.Recipe1.id].beaconModuleIds).toEqual([
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
          value: '200',
        })
      );
      expect(result[Mocks.Recipe1.id].beaconTotal).toEqual('200');
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
        })
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
        })
      );
      expect(result[Mocks.Recipe1.id].cost).toEqual('10');
    });
  });

  describe('RESET_RECIPE', () => {
    it('should reset a recipe', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.ResetRecipeAction(Mocks.Recipe1.id)
      );
      expect(result[Mocks.Recipe1.id]).toBeUndefined();
    });
  });

  describe('RESET_RECIPE_MODULES', () => {
    it(`should reset a recipe's modules`, () => {
      spyOn(StoreUtility, 'resetFields');
      recipesReducer(
        undefined,
        new Actions.ResetRecipeModulesAction(Mocks.Recipe1.id)
      );
      expect(StoreUtility.resetFields).toHaveBeenCalledWith(
        {},
        [
          'factoryModuleIds',
          'beaconCount',
          'beaconId',
          'beaconModuleIds',
          'beaconTotal',
        ] as any,
        Mocks.Recipe1.id
      );
    });
  });

  describe('RESET_FACTORY', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetFields');
      recipesReducer(undefined, new Actions.ResetFactoryAction());
      expect(StoreUtility.resetFields).toHaveBeenCalledWith({}, [
        'factoryId',
        'factoryModuleIds',
        'beaconCount',
        'beaconId',
        'beaconModuleIds',
        'beaconTotal',
      ] as any);
    });
  });

  describe('RESET_BEACONS', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetFields');
      recipesReducer(undefined, new Actions.ResetBeaconsAction());
      expect(StoreUtility.resetFields).toHaveBeenCalledWith({}, [
        'beaconCount',
        'beaconId',
        'beaconModuleIds',
        'beaconTotal',
      ] as any);
    });
  });

  describe('RESET_OVERCLOCK', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetFields');
      recipesReducer(undefined, new Actions.ResetOverclockAction());
      expect(StoreUtility.resetFields).toHaveBeenCalledWith({}, [
        'overclock',
      ] as any);
    });
  });

  describe('RESET_COST', () => {
    it('should call resetField', () => {
      spyOn(StoreUtility, 'resetFields');
      recipesReducer(undefined, new Actions.ResetCostAction());
      expect(StoreUtility.resetFields).toHaveBeenCalledWith({}, [
        'cost',
      ] as any);
    });
  });

  it('should return default state', () => {
    expect(recipesReducer(undefined, { type: 'Test' } as any)).toBe(
      initialRecipesState
    );
  });
});
