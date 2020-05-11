import * as mocks from 'src/mocks';
import { ResearchSpeed } from '~/models';
import { initialSettingsState } from '../settings';
import { initialRecipeState } from './recipe.reducer';
import * as selectors from './recipe.selectors';

describe('Recipe Selectors', () => {
  const stringValue = 'value';
  const numberValue = 2;

  describe('getRecipeSettings', () => {
    it('should handle null/empty values', () => {
      const result = selectors.getRecipeSettings.projector({}, null, {});
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should handle empty recipes', () => {
      const result = selectors.getRecipeSettings.projector(
        {},
        { recipes: [] },
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the recipe settings', () => {
      const result = selectors.getRecipeSettings.projector(
        initialRecipeState,
        mocks.Data,
        initialSettingsState
      );
      expect(Object.keys(result).length).toEqual(mocks.Data.recipes.length);
    });

    it('should use belt override', () => {
      const state = {
        ...initialRecipeState,
        ...{ [mocks.Item1.id]: { belt: stringValue } },
      };
      const result = selectors.getRecipeSettings.projector(
        state,
        mocks.Data,
        initialSettingsState
      );
      expect(result[mocks.Item1.id].belt).toEqual(stringValue);
    });

    it('should use factory override', () => {
      const state = {
        ...initialRecipeState,
        ...{ [mocks.Item1.id]: { factory: stringValue } },
      };
      const result = selectors.getRecipeSettings.projector(
        state,
        mocks.Data,
        initialSettingsState
      );
      expect(result[mocks.Item1.id].factory).toEqual(stringValue);
    });

    it('should use module override', () => {
      const state = {
        ...initialRecipeState,
        ...{ [mocks.Item1.id]: { modules: [stringValue] } },
      };
      const result = selectors.getRecipeSettings.projector(
        state,
        mocks.Data,
        initialSettingsState
      );
      expect(result[mocks.Item1.id].modules as string[]).toEqual([stringValue]);
    });

    it('should use beacon type override', () => {
      const state = {
        ...initialRecipeState,
        ...{ [mocks.Item1.id]: { beaconModule: stringValue } },
      };
      const result = selectors.getRecipeSettings.projector(
        state,
        mocks.Data,
        initialSettingsState
      );
      expect(result[mocks.Item1.id].beaconModule).toEqual(stringValue);
    });

    it('should use beacon count override', () => {
      const state = {
        ...initialRecipeState,
        ...{ [mocks.Item1.id]: { beaconCount: numberValue } },
      };
      const result = selectors.getRecipeSettings.projector(
        state,
        mocks.Data,
        initialSettingsState
      );
      expect(result[mocks.Item1.id].beaconCount).toEqual(numberValue);
    });
  });

  describe('getRecipeFactors', () => {
    const recipeSettings = selectors.getRecipeSettings.projector(
      initialRecipeState,
      mocks.Data,
      initialSettingsState
    );

    it('should handle null/empty values', () => {
      const result = selectors.getRecipeFactors.projector({}, null, null, {});
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return recipe speed/prod factors', () => {
      const result = selectors.getRecipeFactors.projector(
        recipeSettings,
        0,
        ResearchSpeed.Speed0,
        mocks.Data
      );
      expect(Object.keys(result).length).toEqual(mocks.Data.recipes.length);
    });
  });
});
