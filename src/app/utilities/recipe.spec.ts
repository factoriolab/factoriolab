import * as Mocks from 'src/mocks';
import { RecipeUtility } from './recipe';
import { ItemId, CategoryId, RecipeId, Rational } from '~/models';

describe('RecipeUtility', () => {
  const assembler2 = ItemId.AssemblingMachine2;
  const assembler3 = ItemId.AssemblingMachine3;

  const item1 = ItemId.WoodenChest;

  const module = ItemId.Module;
  const effModule = ItemId.EfficiencyModule;
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

  describe('moduleAllowed', () => {
    it('should handle modules with no limitation', () => {
      const result = RecipeUtility.moduleAllowed(
        ItemId.EfficiencyModule,
        RecipeId.AdvancedOilProcessing,
        Mocks.Data
      );
      expect(result).toEqual(true);
    });

    it('should allow if there is a match on limitation', () => {
      const result = RecipeUtility.moduleAllowed(
        ItemId.ProductivityModule,
        RecipeId.AdvancedOilProcessing,
        Mocks.Data
      );
      expect(result).toEqual(true);
    });

    it('should not allow if there is not a match on limitation', () => {
      const result = RecipeUtility.moduleAllowed(
        ItemId.ProductivityModule,
        RecipeId.Satellite,
        Mocks.Data
      );
      expect(result).toEqual(false);
    });
  });

  describe('defaultModules', () => {
    it('should use the prod module if allowed', () => {
      const result = RecipeUtility.defaultModules(
        { id: RecipeId.AdvancedOilProcessing } as any,
        prodModule,
        speedModule,
        1,
        Mocks.Data
      );
      expect(result).toEqual([prodModule]);
    });

    it('should use the other module if prod not allowed', () => {
      const result = RecipeUtility.defaultModules(
        { id: RecipeId.Satellite } as any,
        prodModule,
        speedModule,
        1,
        Mocks.Data
      );
      expect(result).toEqual([speedModule]);
    });
  });

  describe('sort', () => {
    it('should sort steps', () => {
      const a: any = { itemId: ItemId.Water };
      const b: any = { recipeId: RecipeId.SolidFuelFromLightOil };
      const result = RecipeUtility.sort([a, b]);
      expect(result).toEqual([b, a]);
    });
  });

  describe('sortNode', () => {
    it('should skip nodes with no children', () => {
      const node = { id: 'id' } as any;
      RecipeUtility.sortNode(node);
      expect(node.children).toBeUndefined();
    });

    it('should sort child nodes', () => {
      const a: any = { itemId: ItemId.Water };
      const b: any = { recipeId: RecipeId.SolidFuelFromLightOil };
      const node = { id: 'id', children: [a, b] } as any;
      RecipeUtility.sortNode(node);
      expect(node.children).toEqual([b, a]);
    });
  });

  describe('sortOrder', () => {
    it('should sort items and recipes', () => {
      const a: any = { itemId: ItemId.Water };
      const b: any = { recipeId: RecipeId.SolidFuelFromLightOil };
      const aOrder = RecipeUtility.sortOrder(a);
      const bOrder = RecipeUtility.sortOrder(b);
      expect(aOrder).toBeGreaterThan(bOrder);
    });

    it('should leave unspecified steps unsorted', () => {
      const a: any = { itemId: ItemId.AssemblingMachine1 };
      const b: any = { itemId: ItemId.AssemblingMachine2 };
      const aOrder = RecipeUtility.sortOrder(a);
      const bOrder = RecipeUtility.sortOrder(b);
      expect(aOrder).toEqual(bOrder);
    });
  });

  describe('resetField', () => {
    it('should reset changes to a field', () => {
      const result = RecipeUtility.resetField(
        { [Mocks.Item1.id]: { ignore: true, belt: ItemId.TransportBelt } },
        'ignore'
      );
      expect(result[Mocks.Item1.id]).toEqual({
        belt: ItemId.TransportBelt,
      } as any);
    });

    it('should delete a recipe if no modifications remain', () => {
      const result = RecipeUtility.resetField(
        { [Mocks.Item1.id]: { ignore: true } },
        'ignore'
      );
      expect(result[Mocks.Item1.id]).toBeUndefined();
    });
  });
});
