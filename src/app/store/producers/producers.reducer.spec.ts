import { ItemId, Mocks, RecipeId } from 'src/tests';
import * as App from '../app.actions';
import * as Recipes from '../recipes';
import * as Actions from './producers.actions';
import {
  initialProducersState,
  producersReducer,
  ProducersState,
} from './producers.reducer';

describe('Producers Reducer', () => {
  const state = producersReducer(
    undefined,
    new Actions.AddAction(RecipeId.WoodenChest)
  );

  describe('LOAD', () => {
    it('should load a list of producers', () => {
      const producersState: ProducersState = {
        ids: ['1'],
        entities: { id: Mocks.Producer },
        index: 2,
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
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            recipeId: RecipeId.WoodenChest,
            count: '30',
          },
        },
        index: 2,
      };
      const result = producersReducer(
        state,
        new Actions.AddAction(RecipeId.Coal)
      );
      expect(result.entities['2']).toEqual({
        id: '2',
        recipeId: RecipeId.Coal,
        count: '30',
      });
    });
  });

  describe('REMOVE', () => {
    it('should remove a producer', () => {
      const result = producersReducer(state, new Actions.RemoveAction('1'));
      expect(result.ids.length).toEqual(0);
    });
  });

  describe('SET_RECIPE', () => {
    it('should set recipe on a producer', () => {
      const result = producersReducer(
        state,
        new Actions.SetRecipeAction({ id: '1', value: RecipeId.Coal })
      );
      expect(result.entities['1'].recipeId).toEqual(RecipeId.Coal);
    });
  });

  describe('SET_COUNT', () => {
    it('should set count of a producer', () => {
      const result = producersReducer(
        state,
        new Actions.SetCountAction({ id: '1', value: '30' })
      );
      expect(result.entities['1'].count).toEqual('30');
    });
  });

  describe('SET_FACTORY', () => {
    it('should set factory on a producer', () => {
      const result = producersReducer(
        state,
        new Actions.SetFactoryAction({
          id: '1',
          value: ItemId.AssemblingMachine2,
          def: ItemId.AssemblingMachine1,
        })
      );
      expect(result.entities['1'].factoryId).toEqual(ItemId.AssemblingMachine2);
    });
  });

  describe('SET_FACTORY_MODULES', () => {
    it('should set factory modules on a producers', () => {
      const result = producersReducer(
        state,
        new Actions.SetFactoryModulesAction({
          id: '1',
          value: [ItemId.SpeedModule],
          def: [ItemId.Module],
        })
      );
      expect(result.entities['1'].factoryModuleIds).toEqual([
        ItemId.SpeedModule,
      ]);
    });
  });

  describe('SET_BEACON_COUNT', () => {
    it('should set beacon count on a producer', () => {
      const result = producersReducer(
        state,
        new Actions.SetBeaconCountAction({
          id: '1',
          value: '8',
          def: '0',
        })
      );
      expect(result.entities['1'].beaconCount).toEqual('8');
    });
  });

  describe('SET_BEACON', () => {
    it('should set beacon on a producer', () => {
      const result = producersReducer(
        state,
        new Actions.SetBeaconAction({
          id: '1',
          value: ItemId.Beacon,
          def: ItemId.AssemblingMachine1,
        })
      );
      expect(result.entities['1'].beaconId).toEqual(ItemId.Beacon);
    });
  });

  describe('SET_BEACON_MODULES', () => {
    it('should set beacon modules on a producers', () => {
      const result = producersReducer(
        state,
        new Actions.SetBeaconModulesAction({
          id: '1',
          value: [ItemId.SpeedModule],
          def: [ItemId.Module],
        })
      );
      expect(result.entities['1'].beaconModuleIds).toEqual([
        ItemId.SpeedModule,
      ]);
    });
  });

  describe('SET_OVERCLOCK', () => {
    it('should set overclock on a producer', () => {
      const result = producersReducer(
        state,
        new Actions.SetOverclockAction({
          id: '1',
          value: 200,
          def: 100,
        })
      );
      expect(result.entities['1'].overclock).toEqual(200);
    });
  });

  describe('RESET_PRODUCER', () => {
    it('should reset a producer', () => {
      const state: ProducersState = {
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            recipeId: RecipeId.WoodenChest,
            count: '30',
            factoryId: 'factoryId',
            overclock: 100,
            beaconCount: 'beaconCount',
            beaconId: 'beaconId',
            beaconModuleIds: ['beaconModuleIds'],
          },
        },
        index: 2,
      };
      const result = producersReducer(
        state,
        new Actions.ResetProducerAction('1')
      );
      expect(result.entities['1']).toEqual({
        id: '1',
        recipeId: RecipeId.WoodenChest,
        count: '30',
      });
    });
  });

  describe('Recipes RESET_FACTORIES', () => {
    it('should reset all producers', () => {
      const state: ProducersState = {
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            recipeId: RecipeId.WoodenChest,
            count: '30',
            factoryId: 'factoryId',
            overclock: 100,
            beaconCount: 'beaconCount',
            beaconId: 'beaconId',
            beaconModuleIds: ['beaconModuleIds'],
          },
        },
        index: 2,
      };
      const result = producersReducer(
        state,
        new Recipes.ResetFactoriesAction()
      );
      expect(result.entities['1']).toEqual({
        id: '1',
        recipeId: RecipeId.WoodenChest,
        count: '30',
      });
    });
  });

  describe('Recipes RESET_BEACONS', () => {
    it('should reset beacons on all producers', () => {
      const state: ProducersState = {
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            recipeId: RecipeId.WoodenChest,
            count: '30',
            factoryId: 'factoryId',
            overclock: 100,
            beaconCount: 'beaconCount',
            beaconId: 'beaconId',
            beaconModuleIds: ['beaconModuleIds'],
          },
        },
        index: 2,
      };
      const result = producersReducer(state, new Recipes.ResetBeaconsAction());
      expect(result.entities['1']).toEqual({
        id: '1',
        recipeId: RecipeId.WoodenChest,
        count: '30',
        factoryId: 'factoryId',
        overclock: 100,
      });
    });
  });

  it('should return default state', () => {
    expect(producersReducer(state, { type: 'Test' } as any)).toBe(state);
  });
});
