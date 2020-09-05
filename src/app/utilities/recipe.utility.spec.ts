import { Mocks, ItemId, RecipeId } from 'src/tests';
import { Rational, RationalRecipe } from '~/models';
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
      expected.pollution = new Rational(BigInt(1), BigInt(20));
      expect(result).toEqual(expected);
    });

    it('should handle recipes with declared outputs', () => {
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CopperCable,
        ItemId.Coal,
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
      expected.pollution = new Rational(BigInt(1), BigInt(20));
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
      expected.pollution = new Rational(BigInt(1), BigInt(6));
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
      const data = {
        ...Mocks.Data,
        ...{
          itemR: {
            ...Mocks.Data.itemR,
            ...{
              // To verify all factors work in beacons
              [ItemId.SpeedModule]: {
                ...Mocks.Data.itemR[ItemId.SpeedModule],
                ...{
                  module: {
                    ...Mocks.Data.itemR[ItemId.SpeedModule].module,
                    ...{ productivity: Rational.one, pollution: Rational.one },
                  },
                },
              },
              // To verify null consumption works
              [ItemId.ProductivityModule]: {
                ...Mocks.Data.itemR[ItemId.ProductivityModule],
                ...{
                  module: {
                    ...Mocks.Data.itemR[ItemId.ProductivityModule].module,
                    ...{ consumption: null },
                  },
                },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        Rational.zero,
        Rational.zero,
        settings,
        data
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = {
        [ItemId.SteelChest]: new Rational(BigInt(76), BigInt(25)),
      };
      expected.time = new Rational(BigInt(8), BigInt(15));
      expected.consumption = new Rational(BigInt(260));
      expected.pollution = new Rational(BigInt(1037), BigInt(4000));
      expect(result).toEqual(expected);
    });

    it('should handle beacon with no effect', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.beaconModule = ItemId.EfficiencyModule;
      settings.beaconCount = Rational.two;
      const data = {
        ...Mocks.Data,
        ...{
          itemR: {
            ...Mocks.Data.itemR,
            ...{
              // To verify all factors work in beacons
              [ItemId.EfficiencyModule]: {
                ...Mocks.Data.itemR[ItemId.EfficiencyModule],
                ...{
                  module: {
                    ...Mocks.Data.itemR[ItemId.EfficiencyModule].module,
                    ...{ consumption: null },
                  },
                },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        Rational.zero,
        Rational.zero,
        settings,
        data
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = {
        [ItemId.SteelChest]: Rational.one,
      };
      expected.time = new Rational(BigInt(2), BigInt(3));
      expected.consumption = new Rational(BigInt(155));
      expected.pollution = new Rational(BigInt(1), BigInt(20));
      expect(result).toEqual(expected);
    });

    it('should use minimum 20% consumption', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.modules = [
        ItemId.EfficiencyModule3,
        ItemId.EfficiencyModule3,
        ItemId.EfficiencyModule3,
      ];
      settings.beaconModule = ItemId.Module;
      settings.beaconCount = Rational.zero;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
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
      expected.consumption = new Rational(BigInt(35));
      expected.pollution = new Rational(BigInt(1), BigInt(100));
      expect(result).toEqual(expected);
    });

    it('should handle burner fuel inputs', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.IronOre] };
      settings.factory = ItemId.BurnerMiningDrill;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.IronOre,
        ItemId.Coal,
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
      expected.pollution = new Rational(BigInt(1), BigInt(5));
      expect(result).toEqual(expected);
    });

    it('should add to existing burner fuel input', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.PlasticBar] };
      settings.factory = ItemId.SteelFurnace;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.PlasticBar,
        ItemId.Coal,
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
      expected.pollution = new Rational(BigInt(1), BigInt(15));
      expect(result).toEqual(expected);
    });

    it('should subtract from existing burner fuel output', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.Coal] };
      settings.factory = ItemId.BurnerMiningDrill;
      settings.modules = null;
      settings.beaconModule = null;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.Coal,
        ItemId.Coal,
        Rational.zero,
        Rational.zero,
        settings,
        Mocks.Data
      );
      expect(result.in[ItemId.Coal]).toBeUndefined();
      expect(result.out[ItemId.Coal]).toEqual(
        new Rational(BigInt(17), BigInt(20))
      );
    });

    it('should negate existing burner fuel output', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.Coal] };
      settings.factory = ItemId.BurnerMiningDrill;
      settings.modules = null;
      settings.beaconModule = null;
      const data = {
        ...Mocks.Data,
        ...{
          recipeEntities: {
            ...Mocks.Data.recipeEntities,
            ...{
              [RecipeId.Coal]: {
                ...Mocks.Data.recipeEntities[RecipeId.Coal],
                ...{
                  out: { [ItemId.Coal]: 0.05 },
                },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.Coal,
        ItemId.Coal,
        Rational.zero,
        Rational.zero,
        settings,
        data
      );
      expect(result.in[ItemId.Coal]).toEqual(
        new Rational(BigInt(1), BigInt(10))
      );
      expect(result.out[ItemId.Coal]).toBeUndefined();
    });
  });
});
