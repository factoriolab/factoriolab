import { RecipeUtility } from './recipe';
import Fraction from 'fraction.js';

describe('RecipeUtility', () => {
  const stringValue1 = 'test';
  const stringValue2 = 'test2';

  describe('defaultFactory', () => {
    it('should handle no producers', () => {
      const result = RecipeUtility.defaultFactory(
        {} as any,
        stringValue1,
        null,
        null
      );
      expect(result).toEqual(stringValue1);
    });

    it('should handle one producer', () => {
      const result = RecipeUtility.defaultFactory(
        { producers: [stringValue1] } as any,
        null,
        null,
        null
      );
      expect(result).toEqual(stringValue1);
    });

    it('should find the default assembler', () => {
      const result = RecipeUtility.defaultFactory(
        { producers: [stringValue1, stringValue2] } as any,
        stringValue1,
        null,
        null
      );
      expect(result).toEqual(stringValue1);
    });

    it('should find the default furnace', () => {
      const result = RecipeUtility.defaultFactory(
        { producers: [stringValue1, stringValue2] } as any,
        null,
        stringValue1,
        null
      );
      expect(result).toEqual(stringValue1);
    });

    it('should find the default drill', () => {
      const result = RecipeUtility.defaultFactory(
        { producers: [stringValue1, stringValue2] } as any,
        null,
        null,
        stringValue1
      );
      expect(result).toEqual(stringValue1);
    });

    it('should use the first producer if no match found', () => {
      const result = RecipeUtility.defaultFactory(
        { producers: [stringValue1, stringValue2] } as any,
        null,
        null,
        null
      );
      expect(result).toEqual(stringValue1);
    });
  });

  describe('prodModuleAllowed', () => {
    it('should allow if there is an intermediate output', () => {
      const result = RecipeUtility.prodModuleAllowed(
        { out: { [stringValue1]: 1 } } as any,
        { [stringValue1]: { category: 'intermediate' } } as any
      );
      expect(result).toEqual(true);
    });

    it('should not allow if there is not an intermediate output', () => {
      const result = RecipeUtility.prodModuleAllowed(
        { out: { [stringValue1]: 1 } } as any,
        { [stringValue1]: { category: stringValue2 } } as any
      );
      expect(result).toEqual(false);
    });

    it('should allow if the recipe is for an intermediate with default output', () => {
      const result = RecipeUtility.prodModuleAllowed(
        { id: stringValue1 } as any,
        { [stringValue1]: { category: 'intermediate' } } as any
      );
      expect(result).toEqual(true);
    });
  });

  describe('defaultModules', () => {
    it('should use the prod module if allowed', () => {
      const result = RecipeUtility.defaultModules(
        { id: stringValue1 } as any,
        stringValue1,
        stringValue2,
        1,
        { [stringValue1]: { category: 'intermediate' } } as any
      );
      expect(result).toEqual([stringValue1]);
    });

    it('should use the other module if prod not allowed', () => {
      const result = RecipeUtility.defaultModules(
        { id: stringValue1 } as any,
        stringValue1,
        stringValue2,
        1,
        { [stringValue1]: { category: stringValue1 } } as any
      );
      expect(result).toEqual([stringValue2]);
    });
  });

  describe('recipeFactors', () => {
    it('should return a tuple of speed and productivity factors for passed modules', () => {
      const result = RecipeUtility.recipeFactors(
        1,
        [stringValue1],
        stringValue1,
        1,
        { [stringValue1]: { module: { speed: 2, productivity: 2 } } } as any
      );
      expect(result).toEqual([new Fraction(5), new Fraction(5)]);
    });

    it('should handle the an invalid module', () => {
      const result = RecipeUtility.recipeFactors(1, ['module'], null, 0, {
        ['module']: {}
      } as any);
      expect(result).toEqual([new Fraction(1), new Fraction(1)]);
    });

    it('should handle the empty module', () => {
      const result = RecipeUtility.recipeFactors(
        1,
        ['module'],
        null,
        0,
        {} as any
      );
      expect(result).toEqual([new Fraction(1), new Fraction(1)]);
    });

    it('should handle no modules or beacons', () => {
      const result = RecipeUtility.recipeFactors(1, [], null, 0, {} as any);
      expect(result).toEqual([new Fraction(1), new Fraction(1)]);
    });
  });
});
