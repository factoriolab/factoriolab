import * as Mocks from 'src/mocks';
import * as Actions from './recipe.actions';
import { recipeReducer, initialRecipeState } from './recipe.reducer';
import { RecipeUtility } from '~/utilities';

describe('Recipe Reducer', () => {
  const numberValue = 2;

  describe('LOAD', () => {
    it('should load recipe settings', () => {
      const result = recipeReducer(
        undefined,
        new Actions.LoadAction(Mocks.RecipeSettingsEntities)
      );
      expect(result).toEqual(Mocks.RecipeSettingsEntities);
    });
  });

  describe('IGNORE', () => {
    it('should ignore a recipe', () => {
      const result = recipeReducer(
        initialRecipeState,
        new Actions.IgnoreAction(Mocks.Recipe1.id)
      );
      expect(result[Mocks.Recipe1.id].ignore).toEqual(true);
    });

    it('should delete key if ignore = false is the only modification', () => {
      let result = recipeReducer(
        initialRecipeState,
        new Actions.IgnoreAction(Mocks.Recipe1.id)
      );
      result = recipeReducer(
        result,
        new Actions.IgnoreAction(Mocks.Recipe1.id)
      );
      expect(result[Mocks.Recipe1.id]).toBeUndefined();
    });
  });

  describe('SET_BELT', () => {
    it('should set the belt', () => {
      const result = recipeReducer(
        initialRecipeState,
        new Actions.SetBeltAction([Mocks.Recipe1.id, Mocks.Item1.id])
      );
      expect(result[Mocks.Recipe1.id].belt).toEqual(Mocks.Item1.id);
    });
  });

  describe('SET_FACTORY', () => {
    it('should set the factory', () => {
      const result = recipeReducer(
        initialRecipeState,
        new Actions.SetFactoryAction([Mocks.Recipe1.id, Mocks.Item1.id])
      );
      expect(result[Mocks.Recipe1.id].factory).toEqual(Mocks.Item1.id);
    });
  });

  describe('SET_MODULES', () => {
    it('should set the modules', () => {
      const result = recipeReducer(
        initialRecipeState,
        new Actions.SetModulesAction([Mocks.Recipe1.id, [Mocks.Item1.id]])
      );
      expect(result[Mocks.Recipe1.id].modules).toEqual([Mocks.Item1.id]);
    });
  });

  describe('SET_BEACON_MODULE', () => {
    it('should set the beacon module', () => {
      const result = recipeReducer(
        initialRecipeState,
        new Actions.SetBeaconModuleAction([Mocks.Recipe1.id, Mocks.Item1.id])
      );
      expect(result[Mocks.Recipe1.id].beaconModule).toEqual(Mocks.Item1.id);
    });
  });

  describe('SET_BEACONS_COUNT', () => {
    it('should set the beacon count', () => {
      const result = recipeReducer(
        initialRecipeState,
        new Actions.SetBeaconCountAction([Mocks.Recipe1.id, numberValue])
      );
      expect(result[Mocks.Recipe1.id].beaconCount).toEqual(numberValue);
    });
  });

  describe('RESET', () => {
    it('should reset a recipe', () => {
      const result = recipeReducer(
        initialRecipeState,
        new Actions.ResetAction(Mocks.Recipe1.id)
      );
      expect(result[Mocks.Recipe1.id]).toBeUndefined();
    });
  });

  describe('RESET_IGNORE', () => {
    it('should call resetField', () => {
      spyOn(RecipeUtility, 'resetField');
      recipeReducer(null, new Actions.ResetIgnoreAction());
      expect(RecipeUtility.resetField).toHaveBeenCalledWith(null, 'ignore');
    });
  });

  describe('RESET_BELT', () => {
    it('should call resetField', () => {
      spyOn(RecipeUtility, 'resetField');
      recipeReducer(null, new Actions.ResetBeltAction());
      expect(RecipeUtility.resetField).toHaveBeenCalledWith(null, 'belt');
    });
  });

  describe('RESET_FACTORY', () => {
    it('should call resetField', () => {
      spyOn(RecipeUtility, 'resetField');
      recipeReducer(null, new Actions.ResetFactoryAction());
      expect(RecipeUtility.resetField).toHaveBeenCalledWith(null, 'factory');
    });
  });

  describe('RESET_MODULES', () => {
    it('should call resetField', () => {
      spyOn(RecipeUtility, 'resetField');
      recipeReducer(null, new Actions.ResetModulesAction());
      expect(RecipeUtility.resetField).toHaveBeenCalledWith(null, 'modules');
    });
  });

  describe('RESET_BEACONS', () => {
    it('should call resetField', () => {
      spyOn(RecipeUtility, 'resetField');
      recipeReducer(null, new Actions.ResetBeaconsAction());
      expect(RecipeUtility.resetField).toHaveBeenCalledWith(
        null,
        'beaconModule'
      );
      expect(RecipeUtility.resetField).toHaveBeenCalledWith(
        undefined,
        'beaconCount'
      );
    });
  });

  it('should return default state', () => {
    expect(recipeReducer(undefined, { type: 'Test' } as any)).toBe(
      initialRecipeState
    );
  });
});
