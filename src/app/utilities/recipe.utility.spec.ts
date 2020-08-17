import { Mocks, ItemId, RecipeId } from 'src/tests';
import { Rational, RationalRecipe, DisplayRate } from '~/models';
import { RecipeUtility } from './recipe.utility';

describe('RecipeUtility', () => {
  describe('bestMatch', () => {
    it('should pick the first option if list only contains one', () => {
      const value = 'value';
      const result = RecipeUtility.bestMatch([value], []);
      expect(result).toEqual(value);
    });

    it('should pick the first match from rank', () => {
      const value = 'value';
      const result = RecipeUtility.bestMatch(
        ['test1', value],
        ['test2', value]
      );
      expect(result).toEqual(value);
    });
  });

  describe('defaultModules', () => {
    it('should fill in modules list for factory', () => {
      const result = RecipeUtility.defaultModules(
        [ItemId.SpeedModule],
        [ItemId.ProductivityModule, ItemId.SpeedModule],
        1
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
        ItemId.Coal,
        DisplayRate.PerMinute,
        Rational.zero,
        Rational.zero,
        settings,
        Mocks.Data
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = { [ItemId.SteelChest]: Rational.one };
      expected.time = new Rational(BigInt(2), BigInt(3));
      expected.consumption = new Rational(BigInt(155));
      expected.pollution = new Rational(BigInt(3));
      expect(result).toEqual(expected);
    });

    it('should handle recipes with declared outputs', () => {
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CopperCable,
        ItemId.Coal,
        DisplayRate.PerMinute,
        Rational.zero,
        Rational.zero,
        Mocks.RationalRecipeSettings[RecipeId.CopperCable],
        Mocks.Data
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.CopperCable]
      );
      expected.time = new Rational(BigInt(2), BigInt(3));
      expected.consumption = new Rational(BigInt(155));
      expected.pollution = new Rational(BigInt(3));
      expect(result).toEqual(expected);
    });

    it('should handle research factor/productivity', () => {
      const settings = {
        ...Mocks.RationalRecipeSettings[RecipeId.MiningProductivity],
      };
      settings.factory = ItemId.Lab;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.MiningProductivity,
        ItemId.Coal,
        DisplayRate.PerMinute,
        Rational.zero,
        Rational.two,
        settings,
        Mocks.Data
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.MiningProductivity]
      );
      expected.out = { [ItemId.MiningProductivity]: Rational.one };
      expected.time = new Rational(BigInt(30));
      expected.adjustProd = Rational.one;
      expected.consumption = new Rational(BigInt(62));
      expected.pollution = Rational.zero;
      expect(result).toEqual(expected);
    });

    it('should handle mining productivity', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.IronOre] };
      settings.factory = ItemId.ElectricMiningDrill;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.IronOre,
        ItemId.Coal,
        DisplayRate.PerMinute,
        Rational.two,
        Rational.zero,
        settings,
        Mocks.Data
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.IronOre]
      );
      expected.out = { [ItemId.IronOre]: new Rational(BigInt(3)) };
      expected.time = Rational.two;
      expected.consumption = new Rational(BigInt(90));
      expected.pollution = new Rational(BigInt(10));
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
        ItemId.Coal,
        DisplayRate.PerMinute,
        Rational.zero,
        Rational.zero,
        settings,
        Mocks.Data
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = {
        [ItemId.SteelChest]: new Rational(BigInt(26), BigInt(25)),
      };
      expected.time = new Rational(BigInt(8), BigInt(15));
      expected.consumption = new Rational(BigInt(320));
      expected.pollution = new Rational(BigInt(1323), BigInt(200));
      expect(result).toEqual(expected);
    });

    it('should handle beacon with no speed effect', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.beaconModule = ItemId.EfficiencyModule;
      settings.beaconCount = Rational.two;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        DisplayRate.PerMinute,
        Rational.zero,
        Rational.zero,
        settings,
        Mocks.Data
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = {
        [ItemId.SteelChest]: Rational.one,
      };
      expected.time = new Rational(BigInt(2), BigInt(3));
      expected.consumption = new Rational(BigInt(110));
      expected.pollution = new Rational(BigInt(21), BigInt(10));
      expect(result).toEqual(expected);
    });

    it('should handle burner fuel inputs', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.IronOre] };
      settings.factory = ItemId.BurnerMiningDrill;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.IronOre,
        ItemId.Coal,
        DisplayRate.PerMinute,
        Rational.zero,
        Rational.zero,
        settings,
        Mocks.Data
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.IronOre]
      );
      expected.in = { [ItemId.Coal]: new Rational(BigInt(3), BigInt(20)) };
      expected.out = {
        [ItemId.IronOre]: Rational.one,
      };
      expected.time = new Rational(BigInt(4));
      expected.consumption = Rational.zero;
      expected.pollution = new Rational(BigInt(12));
      expect(result).toEqual(expected);
    });

    it('should add to existing burner fuel input', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.PlasticBar] };
      settings.factory = ItemId.SteelFurnace;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.PlasticBar,
        ItemId.Coal,
        DisplayRate.PerMinute,
        Rational.zero,
        Rational.zero,
        settings,
        Mocks.Data
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.PlasticBar]
      );
      expected.in[ItemId.Coal] = new Rational(BigInt(809), BigInt(800));
      expected.out = {
        [ItemId.PlasticBar]: Rational.two,
      };
      expected.time = new Rational(BigInt(1), BigInt(2));
      expected.consumption = Rational.zero;
      expected.pollution = new Rational(BigInt(4));
      expect(result).toEqual(expected);
    });
  });
});
