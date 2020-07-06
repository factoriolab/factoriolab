import { Mocks, ItemId, RecipeId } from 'src/tests';
import { Rational, RationalRecipe } from '~/models';
import { RecipeUtility } from './recipe.utility';

describe('RecipeUtility', () => {
  describe('defaultFactory', () => {
    it('should pick the first producer if list only contains one', () => {
      const result = RecipeUtility.defaultFactory(
        Mocks.Data.recipeEntities[RecipeId.AdvancedOilProcessing],
        []
      );
      expect(result).toEqual(ItemId.OilRefinery);
    });

    it('should pick the first match from rank', () => {
      const result = RecipeUtility.defaultFactory(
        Mocks.Data.recipeEntities[RecipeId.SteelChest],
        [ItemId.AssemblingMachine2, ItemId.AssemblingMachine3]
      );
      expect(result).toEqual(ItemId.AssemblingMachine2);
    });

    it('should pick the first producer if no match is found', () => {
      const result = RecipeUtility.defaultFactory(
        Mocks.Data.recipeEntities[RecipeId.SteelChest],
        [ItemId.SteelFurnace]
      );
      expect(result).toEqual(ItemId.AssemblingMachine1);
    });
  });

  describe('defaultModules', () => {
    it('should fill in modules list for factory', () => {
      const result = RecipeUtility.defaultModules(
        Mocks.Data.recipeEntities[RecipeId.SteelChest],
        [ItemId.ProductivityModule, ItemId.SpeedModule],
        1,
        Mocks.Data
      );
      expect(result).toEqual([ItemId.SpeedModule]);
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
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.IronOre] };
      settings.factory = ItemId.BurnerMiningDrill;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.IronOre,
        Rational.zero,
        Rational.zero,
        ItemId.Coal,
        settings,
        Mocks.RationalData
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.IronOre]
      );
      expected.in = { [ItemId.Coal]: new Rational(BigInt(3), BigInt(20)) };
      expected.out = {
        [ItemId.IronOre]: Rational.one,
      };
      expected.time = new Rational(BigInt(4));
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
