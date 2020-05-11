import Fraction from 'fraction.js';

import * as mocks from 'src/mocks';
import { RecipeUtility } from './recipe';
import { ItemId, CategoryId, RecipeId } from '~/models';

describe('RecipeUtility', () => {
  const assembler2 = ItemId.AssemblingMachine2;
  const assembler3 = ItemId.AssemblingMachine3;

  const item1 = ItemId.WoodenChest;

  const module = ItemId.Module;
  const prodModule = ItemId.ProductivityModule3;
  const speedModule = ItemId.SpeedModule3;

  describe('defaultFactory', () => {
    it('should handle no producers', () => {
      const result = RecipeUtility.defaultFactory({} as any, assembler2, null);
      expect(result).toEqual(assembler2);
    });

    it('should handle one producer', () => {
      const result = RecipeUtility.defaultFactory(
        { producers: [assembler2] } as any,
        null,
        null
      );
      expect(result).toEqual(assembler2);
    });

    it('should find the default assembler', () => {
      const result = RecipeUtility.defaultFactory(
        { producers: [assembler2, assembler3] } as any,
        assembler2,
        null
      );
      expect(result).toEqual(assembler2);
    });

    it('should find the default furnace', () => {
      const result = RecipeUtility.defaultFactory(
        { producers: [assembler2, assembler3] } as any,
        null,
        assembler2
      );
      expect(result).toEqual(assembler2);
    });

    it('should use the first producer if no match found', () => {
      const result = RecipeUtility.defaultFactory(
        { producers: [assembler2, assembler3] } as any,
        null,
        null
      );
      expect(result).toEqual(assembler2);
    });
  });

  describe('prodModuleAllowed', () => {
    it('should not allow for the satellite recipe', () => {
      const result = RecipeUtility.prodModuleAllowed(
        { id: RecipeId.Satellite } as any,
        mocks.Data.itemEntities
      );
      expect(result).toEqual(false);
    });

    it('should allow if there is an intermediate output', () => {
      const result = RecipeUtility.prodModuleAllowed(
        { out: { [item1]: 1 } } as any,
        { [item1]: { category: CategoryId.Intermediate } } as any
      );
      expect(result).toEqual(true);
    });

    it('should not allow if there is not an intermediate output', () => {
      const result = RecipeUtility.prodModuleAllowed(
        { out: { [item1]: 1 } } as any,
        { [item1]: { category: CategoryId.Logistics } } as any
      );
      expect(result).toEqual(false);
    });

    it('should allow if the recipe is for an intermediate with default output', () => {
      const result = RecipeUtility.prodModuleAllowed(
        { id: item1 } as any,
        { [item1]: { category: CategoryId.Intermediate } } as any
      );
      expect(result).toEqual(true);
    });
  });

  describe('defaultModules', () => {
    it('should use the prod module if allowed', () => {
      const result = RecipeUtility.defaultModules(
        { id: item1 } as any,
        prodModule,
        speedModule,
        1,
        { [item1]: { category: CategoryId.Intermediate } } as any
      );
      expect(result).toEqual([prodModule]);
    });

    it('should use the other module if prod not allowed', () => {
      const result = RecipeUtility.defaultModules(
        { id: item1 } as any,
        prodModule,
        speedModule,
        1,
        { [item1]: { category: CategoryId.Logistics } } as any
      );
      expect(result).toEqual([speedModule]);
    });
  });

  describe('recipeFactors', () => {
    it('should return a tuple of speed and productivity factors for passed modules', () => {
      const result = RecipeUtility.recipeFactors(
        new Fraction(1),
        new Fraction(0),
        [prodModule],
        speedModule,
        1,
        {
          [prodModule]: { module: { productivity: 2 } },
          [speedModule]: { module: { speed: 2 } },
        } as any
      );
      expect(result).toEqual({ speed: new Fraction(2), prod: new Fraction(3) });
    });

    it('should handle the empty module', () => {
      const result = RecipeUtility.recipeFactors(
        new Fraction(1),
        new Fraction(0),
        [module],
        null,
        0,
        {
          [module]: {},
        } as any
      );
      expect(result).toEqual({ speed: new Fraction(1), prod: new Fraction(1) });
    });

    it('should handle an invalid/unfound module', () => {
      const result = RecipeUtility.recipeFactors(
        new Fraction(1),
        new Fraction(0),
        [module],
        null,
        0,
        {} as any
      );
      expect(result).toEqual({ speed: new Fraction(1), prod: new Fraction(1) });
    });

    it('should handle an unfound beacon type', () => {
      const result = RecipeUtility.recipeFactors(
        new Fraction(1),
        new Fraction(0),
        [],
        module,
        1,
        {} as any
      );
      expect(result).toEqual({ speed: new Fraction(1), prod: new Fraction(1) });
    });

    it('should handle no modules or beacons', () => {
      const result = RecipeUtility.recipeFactors(
        new Fraction(1),
        new Fraction(0),
        [],
        null,
        0,
        {} as any
      );
      expect(result).toEqual({ speed: new Fraction(1), prod: new Fraction(1) });
    });
  });
});
