import { ItemId, Mocks, RecipeId } from 'src/tests';
import { Rational } from '~/models';
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
              modules: [{ count: Rational.one, id: ItemId.Module }],
              beacons: [
                {
                  count: Rational.ten,
                  id: ItemId.Beacon,
                  modules: [{ count: Rational.two, id: ItemId.Module }],
                },
              ],
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

  describe('SET_MODULES', () => {
    it('should set the modules', () => {
      const value = [{ count: Rational.one, id: ItemId.Module }];
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetModulesAction({
          id: Mocks.Recipe1.id,
          value,
        }),
      );
      expect(result[Mocks.Recipe1.id].modules).toEqual(value);
    });
  });

  describe('SET_BEACONS', () => {
    it('should set the beacons', () => {
      const value = [
        {
          count: Rational.one,
          id: ItemId.Beacon,
          modules: [{ count: Rational.two, id: ItemId.Module }],
        },
      ];
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetBeaconsAction({
          id: Mocks.Recipe1.id,
          value,
        }),
      );
      expect(result[Mocks.Recipe1.id].beacons).toEqual(value);
    });
  });

  describe('SET_OVERCLOCK', () => {
    it('should set the overclock', () => {
      const value = Rational.fromNumber(200);
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetOverclockAction({
          id: Mocks.Recipe1.id,
          value,
          def: Rational.hundred,
        }),
      );
      expect(result[Mocks.Recipe1.id].overclock).toEqual(value);
    });
  });

  describe('SET_COST', () => {
    it('should set the cost', () => {
      const result = recipesReducer(
        initialRecipesState,
        new Actions.SetCostAction({
          id: Mocks.Recipe1.id,
          value: Rational.ten,
        }),
      );
      expect(result[Mocks.Recipe1.id].cost).toEqual(Rational.ten);
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
