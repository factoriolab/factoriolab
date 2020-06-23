import * as Mocks from 'src/mocks';
import { RecipeUtility } from './recipe';
import { ItemId, RecipeId, Rational, RationalRecipe } from '~/models';

describe('RecipeUtility', () => {
  const assembler2 = ItemId.AssemblingMachine2;
  const assembler3 = ItemId.AssemblingMachine3;
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

  describe('adjustRecipe', () => {
    it('should adjust a standard recipe', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.modules = null;
      settings.beaconModule = ItemId.Module;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        Rational.zero,
        Rational.zero,
        ItemId.Coal,
        settings,
        Mocks.RationalData
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = { [ItemId.SteelChest]: Rational.one };
      expected.time = new Rational(BigInt(2), BigInt(3));
      expect(result).toEqual(expected);
    });

    it('should handle recipes with declared outputs', () => {
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CopperCable,
        Rational.zero,
        Rational.zero,
        ItemId.Coal,
        Mocks.RationalRecipeSettings[RecipeId.CopperCable],
        Mocks.RationalData
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.CopperCable]
      );
      expected.time = new Rational(BigInt(2), BigInt(3));
      expect(result).toEqual(expected);
    });

    it('should handle research factor/productivity', () => {
      const settings = {
        ...Mocks.RationalRecipeSettings[RecipeId.MiningProductivity],
      };
      settings.factory = ItemId.Lab;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.MiningProductivity,
        Rational.zero,
        Rational.two,
        ItemId.Coal,
        settings,
        Mocks.RationalData
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.MiningProductivity]
      );
      expected.out = { [ItemId.MiningProductivity]: Rational.one };
      expected.time = new Rational(BigInt(30));
      expected.adjustProd = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should handle mining productivity', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.IronOre] };
      settings.factory = ItemId.ElectricMiningDrill;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.IronOre,
        Rational.two,
        Rational.zero,
        ItemId.Coal,
        settings,
        Mocks.RationalData
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.IronOre]
      );
      expected.out = { [ItemId.IronOre]: new Rational(BigInt(3)) };
      expected.time = Rational.two;
      expect(result).toEqual(expected);
    });

    it('should handle modules and beacons', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.modules = [
        ItemId.SpeedModule,
        ItemId.ProductivityModule,
        ItemId.EfficiencyModule,
      ];
      settings.beaconModule = ItemId.SpeedModule;
      settings.beaconCount = Rational.two;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        Rational.zero,
        Rational.zero,
        ItemId.Coal,
        settings,
        Mocks.RationalData
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = {
        [ItemId.SteelChest]: new Rational(BigInt(26), BigInt(25)),
      };
      expected.time = new Rational(BigInt(8), BigInt(15));
      expect(result).toEqual(expected);
    });

    it('should handle beacon with no speed effect', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.beaconModule = ItemId.EfficiencyModule;
      settings.beaconCount = Rational.two;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        Rational.zero,
        Rational.zero,
        ItemId.Coal,
        settings,
        Mocks.RationalData
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = {
        [ItemId.SteelChest]: Rational.one,
      };
      expected.time = new Rational(BigInt(2), BigInt(3));
      expect(result).toEqual(expected);
    });

    it('should handle burner fuel inputs', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.factory = ItemId.SteelFurnace;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        Rational.zero,
        Rational.zero,
        ItemId.Coal,
        settings,
        Mocks.RationalData
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.SteelChest]
      );
      expected.in[ItemId.Coal] = new Rational(BigInt(9), BigInt(1600));
      expected.out = {
        [ItemId.SteelChest]: Rational.one,
      };
      expected.time = new Rational(BigInt(1), BigInt(4));
      expect(result).toEqual(expected);
    });

    it('should add to existing burner fuel input', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.PlasticBar] };
      settings.factory = ItemId.SteelFurnace;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.PlasticBar,
        Rational.zero,
        Rational.zero,
        ItemId.Coal,
        settings,
        Mocks.RationalData
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.PlasticBar]
      );
      expected.in[ItemId.Coal] = new Rational(BigInt(809), BigInt(800));
      expected.out = {
        [ItemId.PlasticBar]: Rational.two,
      };
      expected.time = new Rational(BigInt(1), BigInt(2));
      expect(result).toEqual(expected);
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
