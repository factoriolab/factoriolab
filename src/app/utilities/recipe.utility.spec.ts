import { ItemId, Mocks, RecipeId } from 'src/tests';
import {
  Entities,
  Rat,
  Rational,
  Recipe,
  RecipeSettingsRational,
} from '~/models';
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
    it('should fill in modules list for machine', () => {
      const result = RecipeUtility.defaultModules(
        [{ value: ItemId.SpeedModule }],
        [ItemId.ProductivityModule, ItemId.SpeedModule],
        1
      );
      expect(result).toEqual([ItemId.SpeedModule]);
    });
  });

  describe('adjustRecipe', () => {
    it('should adjust a standard recipe', () => {
      const settings = { ...Mocks.RecipesStateRational[RecipeId.SteelChest] };
      settings.machineModuleIds = undefined;
      settings.beacons = [{ moduleIds: [ItemId.SpeedModule] }];
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        Mocks.Dataset
      );
      const expected = new RecipeRat(
        Mocks.Dataset.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = { [ItemId.SteelChest]: Rational.one };
      expected.time = Rational.from(2, 3);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(150);
      expected.pollution = Rational.from(1, 20);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should handle recipes with declared outputs', () => {
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CopperCable,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        Mocks.RecipesStateRational[RecipeId.CopperCable],
        Mocks.ItemsStateInitial,
        Mocks.Dataset
      );
      const expected = new RecipeRat(
        Mocks.Dataset.recipeEntities[RecipeId.CopperCable]
      );
      expected.time = Rational.from(2, 3);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(150);
      expected.pollution = Rational.from(1, 20);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should handle research factor/productivity', () => {
      const settings = {
        ...Mocks.RecipesStateRational[RecipeId.MiningProductivity],
      };
      settings.machineId = ItemId.Lab;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.MiningProductivity,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.two,
        false,
        settings,
        Mocks.ItemsStateInitial,
        Mocks.Dataset
      );
      const expected = new RecipeRat(
        Mocks.Dataset.recipeEntities[RecipeId.MiningProductivity]
      );
      expected.out = { [ItemId.MiningProductivity]: Rational.one };
      expected.time = Rational.from(30);
      expected.adjustProd = true;
      expected.productivity = Rational.one;
      expected.drain = Rational.zero;
      expected.consumption = Rational.from(60);
      expected.pollution = Rational.zero;
      expect(result).toEqual(expected);
    });

    it('should handle mining productivity', () => {
      const settings = { ...Mocks.RecipesStateRational[RecipeId.IronOre] };
      settings.machineId = ItemId.ElectricMiningDrill;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.IronOre,
        ItemId.Coal,
        ItemId.Module,
        Rational.two,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        Mocks.Dataset
      );
      const expected = new RecipeRat(
        Mocks.Dataset.recipeEntities[RecipeId.IronOre]
      );
      expected.out = { [ItemId.IronOre]: Rational.from(3) };
      expected.time = Rational.two;
      expected.drain = Rational.zero;
      expected.consumption = Rational.from(90);
      expected.pollution = Rational.from(1, 6);
      expected.productivity = Rational.from(3);
      expect(result).toEqual(expected);
    });

    it('should handle modules and beacons', () => {
      const settings = { ...Mocks.RecipesStateRational[RecipeId.SteelChest] };
      settings.machineModuleIds = [
        ItemId.SpeedModule,
        ItemId.ProductivityModule,
        ItemId.EfficiencyModule,
      ];
      settings.beacons = [
        {
          id: ItemId.Beacon,
          count: Rational.one,
          moduleIds: [ItemId.SpeedModule, ItemId.SpeedModule],
        },
      ];
      const data = {
        ...Mocks.Dataset,
        ...{
          moduleEntities: {
            ...Mocks.Dataset.moduleEntities,
            ...{
              // To verify all factors work in beacons
              [ItemId.SpeedModule]: {
                ...Mocks.Dataset.moduleEntities[ItemId.SpeedModule],
                ...{ productivity: Rational.one, pollution: Rational.one },
              },
              // To verify null consumption works
              [ItemId.ProductivityModule]: {
                ...Mocks.Dataset.moduleEntities[ItemId.ProductivityModule],
                ...{ consumption: undefined },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        data
      );
      const expected = new RecipeRat(
        Mocks.Dataset.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = {
        [ItemId.SteelChest]: Rational.from(76, 25),
      };
      expected.time = Rational.from(40, 81);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(255);
      expected.pollution = Rational.from(1037, 4000);
      expected.productivity = Rational.from(76, 25);
      expect(result).toEqual(expected);
    });

    it('should use minimum 20% effects', () => {
      const settings = { ...Mocks.RecipesStateRational[RecipeId.SteelChest] };
      settings.machineModuleIds = [
        ItemId.EfficiencyModule3,
        ItemId.EfficiencyModule3,
        ItemId.EfficiencyModule3,
      ];
      // Set up efficiency module 3 to cause more than maximum effect in speed, consumption, and pollution
      const data = {
        ...Mocks.Dataset,
        ...{
          moduleEntities: {
            ...Mocks.Dataset.moduleEntities,
            ...{
              [ItemId.EfficiencyModule3]: {
                ...Mocks.Dataset.moduleEntities[ItemId.EfficiencyModule3],
                ...{
                  speed:
                    Mocks.Dataset.moduleEntities[ItemId.EfficiencyModule3]
                      .consumption,
                  pollution:
                    Mocks.Dataset.moduleEntities[ItemId.EfficiencyModule3]
                      .consumption,
                },
              },
            },
          },
        },
      };
      settings.beacons = [{ count: Rational.zero, moduleIds: [ItemId.Module] }];
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        data
      );
      const expected = new RecipeRat(
        Mocks.Dataset.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = {
        [ItemId.SteelChest]: Rational.one,
      };
      expected.time = Rational.from(10, 3);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(30);
      expected.pollution = Rational.from(1, 500);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should handle burner fuel inputs', () => {
      const settings = { ...Mocks.RecipesStateRational[RecipeId.IronOre] };
      settings.machineId = ItemId.BurnerMiningDrill;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.IronOre,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        Mocks.Dataset
      );
      const expected = new RecipeRat(
        Mocks.Dataset.recipeEntities[RecipeId.IronOre]
      );
      expected.in = { [ItemId.Coal]: Rational.from(3, 20) };
      expected.out = {
        [ItemId.IronOre]: Rational.one,
      };
      expected.time = Rational.from(4);
      expected.drain = undefined;
      expected.consumption = Rational.zero;
      expected.pollution = Rational.from(1, 5);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should add to existing burner fuel input', () => {
      const settings = { ...Mocks.RecipesStateRational[RecipeId.PlasticBar] };
      settings.machineId = ItemId.SteelFurnace;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.PlasticBar,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        Mocks.Dataset
      );
      const expected = new RecipeRat(
        Mocks.Dataset.recipeEntities[RecipeId.PlasticBar]
      );
      expected.in[ItemId.Coal] = Rational.from(809, 800);
      expected.out = {
        [ItemId.PlasticBar]: Rational.two,
      };
      expected.time = Rational.from(1, 2);
      expected.drain = undefined;
      expected.consumption = Rational.zero;
      expected.pollution = Rational.from(1, 15);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should find matching nonchemical fuel', () => {
      const result = RecipeUtility.adjustRecipe(
        RecipeId.UsedUpUraniumFuelCell,
        ItemId.UsedUpUraniumFuelCell,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        Mocks.RecipesStateRationalInitial[RecipeId.UsedUpUraniumFuelCell],
        Mocks.ItemsStateInitial,
        Mocks.Dataset
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(Rational.from(1, 200));
    });

    it('should find non-matching nonchemical fuel', () => {
      const data = {
        ...Mocks.Dataset,
        ...{
          recipeEntities: {
            ...Mocks.Dataset.recipeEntities,
            ...{
              [RecipeId.UsedUpUraniumFuelCell]: {
                ...Mocks.Dataset.recipeEntities[RecipeId.UsedUpUraniumFuelCell],
                ...{ in: {}, out: {} },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.UsedUpUraniumFuelCell,
        ItemId.UsedUpUraniumFuelCell,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        Mocks.RecipesStateRationalInitial[RecipeId.UsedUpUraniumFuelCell],
        Mocks.ItemsStateInitial,
        data
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(Rational.from(1, 200));
    });

    it('should adjust based on overclock', () => {
      const settings = { ...Mocks.RecipesStateRational[RecipeId.SteelChest] };
      settings.overclock = Rational.from(200);
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        Mocks.Dataset
      );
      const expected = new RecipeRat(
        Mocks.Dataset.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = { [ItemId.SteelChest]: Rational.one };
      expected.time = Rational.from(1, 3);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(375);
      expected.pollution = Rational.from(1, 20);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should adjust a power producer based on overclock', () => {
      const settings = { ...Mocks.RecipesStateRational[RecipeId.SteelChest] };
      settings.overclock = Rational.from(200);
      const data = Mocks.getDataset();
      data.machineEntities[ItemId.AssemblingMachine2].usage =
        Rational.from(-10);
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        data
      );
      const expected = new RecipeRat(
        Mocks.Dataset.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = { [ItemId.SteelChest]: Rational.one };
      expected.time = Rational.from(1, 3);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(-20);
      expected.pollution = Rational.from(1, 20);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should use a recipe specific usage', () => {
      const settings = { ...Mocks.RecipesStateRational[RecipeId.SteelChest] };
      const data = {
        ...Mocks.Dataset,
        ...{
          recipeEntities: {
            ...Mocks.Dataset.recipeEntities,
            ...{
              [RecipeId.SteelChest]: {
                ...Mocks.Dataset.recipeEntities[RecipeId.SteelChest],
                ...{
                  usage: 10000,
                },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        data
      );
      const expected = new RecipeRat(
        Mocks.Dataset.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = { [ItemId.SteelChest]: Rational.one };
      expected.time = Rational.from(2, 3);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(10000);
      expected.pollution = Rational.from(1, 20);
      expected.productivity = Rational.one;
      expected.usage = Rational.from(10000);
      expect(result).toEqual(expected);
    });

    it('should handle a machine with no listed speed', () => {
      const settings = Mocks.RecipesStateRational[RecipeId.SteelChest];
      const data = {
        ...Mocks.Dataset,
        ...{
          machineEntities: {
            ...Mocks.Dataset.machineEntities,
            ...{
              [ItemId.AssemblingMachine2]: {
                ...Mocks.Dataset.machineEntities[ItemId.AssemblingMachine2],
                ...{
                  ...Mocks.Dataset.machineEntities[ItemId.AssemblingMachine2],
                  ...{ speed: undefined },
                },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        data
      );
      const expected = new RecipeRat(
        Mocks.Dataset.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = { [ItemId.SteelChest]: Rational.one };
      expected.time = Rational.from(1, 30);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(150);
      expected.pollution = Rational.from(1, 20);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should calculate proliferator usage', () => {
      const settings = new RecipeSettingsRational({
        ...Mocks.RecipesStateInitial[ItemId.SteelChest],
        ...{ machineModuleIds: [ItemId.ProductivityModule3] },
      });
      const recipe = {
        ...Mocks.Dataset.recipeEntities[RecipeId.SteelChest],
        ...{
          in: {
            ...Mocks.Dataset.recipeEntities[RecipeId.SteelChest].in,
            ...{ [ItemId.ProductivityModule]: 1 },
          },
        },
      };
      const data = {
        ...Mocks.Dataset,
        ...{
          recipeEntities: {
            ...Mocks.Dataset.recipeEntities,
            ...{
              [RecipeId.SteelChest]: recipe,
            },
          },
          moduleEntities: {
            ...Mocks.Dataset.moduleEntities,
            ...{
              [ItemId.ProductivityModule3]: {
                ...Mocks.Dataset.moduleEntities[ItemId.ProductivityModule3],
                ...{
                  sprays: Rational.ten,
                  proliferator: ItemId.ProductivityModule3,
                },
              },
              [ItemId.ProductivityModule]: {
                ...Mocks.Dataset.moduleEntities[ItemId.ProductivityModule],
                ...{
                  sprays: Rational.ten,
                  proliferator: ItemId.ProductivityModule,
                },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        ItemId.ProductivityModule,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        data
      );
      const expected = new RecipeRat(recipe);
      expected.in[ItemId.ProductivityModule] = Rational.from(11, 10);
      expected.in[ItemId.ProductivityModule3] = Rational.from(9, 10);
      expected.out = { [ItemId.SteelChest]: Rational.from(11, 10) };
      expected.time = Rational.from(8, 97);
      expected.drain = Rational.from(25, 2);
      expected.consumption = Rational.from(2775);
      expected.pollution = Rational.from(407, 1500);
      expected.productivity = Rational.from(11, 10);
      expect(result).toEqual(expected);
    });

    it('should ignore proliferator self-spray with no productivity bonus', () => {
      const settings = new RecipeSettingsRational({
        ...Mocks.RecipesStateInitial[ItemId.SteelChest],
        ...{ machineModuleIds: [ItemId.ProductivityModule3] },
      });
      const recipe = {
        ...Mocks.Dataset.recipeEntities[RecipeId.SteelChest],
        ...{
          in: {
            ...Mocks.Dataset.recipeEntities[RecipeId.SteelChest].in,
            ...{ [ItemId.ProductivityModule]: 1 },
          },
        },
      };
      const data = {
        ...Mocks.Dataset,
        ...{
          recipeEntities: {
            ...Mocks.Dataset.recipeEntities,
            ...{
              [RecipeId.SteelChest]: recipe,
            },
          },
          moduleEntities: {
            ...Mocks.Dataset.moduleEntities,
            ...{
              [ItemId.ProductivityModule3]: {
                ...Mocks.Dataset.moduleEntities[ItemId.ProductivityModule3],
                ...{
                  sprays: Rational.ten,
                  proliferator: ItemId.ProductivityModule3,
                },
              },
              [ItemId.SpeedModule]: {
                ...Mocks.Dataset.moduleEntities[ItemId.SpeedModule],
                ...{
                  sprays: Rational.ten,
                  proliferator: ItemId.SpeedModule,
                },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        ItemId.SpeedModule,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        data
      );
      const expected = new RecipeRat(recipe);
      expected.in[ItemId.SpeedModule] = Rational.from(1, 10);
      expected.in[ItemId.ProductivityModule3] = Rational.from(9, 10);
      expected.out = { [ItemId.SteelChest]: Rational.from(11, 10) };
      expected.time = Rational.from(8, 97);
      expected.drain = Rational.from(25, 2);
      expected.consumption = Rational.from(2775);
      expected.pollution = Rational.from(407, 1500);
      expected.productivity = Rational.from(11, 10);
      expect(result).toEqual(expected);
    });

    it('should add machine consumption', () => {
      const data = {
        ...Mocks.Dataset,
        ...{
          machineEntities: {
            ...Mocks.Dataset.machineEntities,
            ...{
              [ItemId.AssemblingMachine2]: {
                ...Mocks.Dataset.machineEntities[ItemId.AssemblingMachine2],
                ...{
                  consumption: {
                    [ItemId.Coal]: Rational.one,
                  },
                },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CopperCable,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        Mocks.RecipesStateRational[RecipeId.CopperCable],
        Mocks.ItemsStateInitial,
        data
      );
      const expected = new RecipeRat(
        Mocks.Dataset.recipeEntities[RecipeId.CopperCable]
      );
      expected.time = Rational.from(2, 3);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(150);
      expected.pollution = Rational.from(1, 20);
      expected.productivity = Rational.one;
      expected.in[ItemId.Coal] = Rational.from(1, 90);
      expect(result).toEqual(expected);
    });

    it('should reduce net production to output only', () => {
      const data = Mocks.getDataset();
      data.recipeEntities[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] = 1;
      data.recipeEntities[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] = 2;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CoalLiquefaction,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        true,
        Mocks.RecipesStateRational[RecipeId.CoalLiquefaction],
        Mocks.ItemsStateInitial,
        data
      );
      expect(result.in[ItemId.HeavyOil]).toBeUndefined();
      expect(result.out[ItemId.HeavyOil]).toEqual(Rational.one);
    });

    it('should reduce net production to input only', () => {
      const data = Mocks.getDataset();
      data.recipeEntities[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] = 2;
      data.recipeEntities[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] = 1;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CoalLiquefaction,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        true,
        Mocks.RecipesStateRational[RecipeId.CoalLiquefaction],
        Mocks.ItemsStateInitial,
        data
      );
      expect(result.in[ItemId.HeavyOil]).toEqual(Rational.one);
      expect(result.out[ItemId.HeavyOil]).toBeUndefined();
    });

    it('should reduce net production to no input/output', () => {
      const data = Mocks.getDataset();
      data.recipeEntities[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] = 1;
      data.recipeEntities[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] = 1;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CoalLiquefaction,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        true,
        Mocks.RecipesStateRational[RecipeId.CoalLiquefaction],
        Mocks.ItemsStateInitial,
        data
      );
      expect(result.in[ItemId.HeavyOil]).toBeUndefined();
      expect(result.out[ItemId.HeavyOil]).toBeUndefined();
    });
  });

  describe('adjustSiloRecipes', () => {
    let recipeR: Entities<RecipeRat>;

    beforeEach(() => {
      recipeR = Mocks.AdjustedData.recipeIds.reduce(
        (e: Entities<RecipeRat>, i) => {
          e[i] = RecipeUtility.adjustRecipe(
            i,
            ItemId.Coal,
            ItemId.Module,
            Rational.zero,
            Rational.one,
            false,
            Mocks.RecipesStateRationalInitial[i],
            Mocks.ItemsStateInitial,
            Mocks.Dataset
          );
          return e;
        },
        {}
      );
    });

    it('should adjust recipes', () => {
      const result = RecipeUtility.adjustSiloRecipes(
        recipeR,
        Mocks.RecipesStateRationalInitial,
        Mocks.AdjustedData
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        Rational.from(82499, 924)
      );
      expect(result[RecipeId.RocketPart].time).toEqual(
        Rational.from(82499, 66000)
      );
    });

    it('should handle invalid machine', () => {
      const settings2 = {
        ...Mocks.RecipesStateRationalInitial,
        ...{
          [RecipeId.SpaceSciencePack]: {
            machineId: 'id',
          },
        },
      };
      const result = RecipeUtility.adjustSiloRecipes(
        recipeR,
        settings2,
        Mocks.AdjustedData
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        Rational.from(203, 5)
      );
      expect(result[RecipeId.RocketPart].time).toEqual(
        Rational.from(82499, 66000)
      );
    });
  });

  describe('allowsModules', () => {
    it('should check machine and rocket recipes', () => {
      // Silo recipes
      expect(
        RecipeUtility.allowsModules(
          Mocks.Dataset.recipeEntities[RecipeId.RocketPart],
          Mocks.Dataset.machineEntities[ItemId.RocketSilo]
        )
      ).toBeTrue();
      expect(
        RecipeUtility.allowsModules(
          Mocks.Dataset.recipeEntities[RecipeId.SpaceSciencePack],
          Mocks.Dataset.machineEntities[ItemId.RocketSilo]
        )
      ).toBeFalse();
      // Normal recipes
      expect(
        RecipeUtility.allowsModules(
          Mocks.Dataset.recipeEntities[ItemId.Coal],
          Mocks.Dataset.machineEntities[ItemId.ElectricMiningDrill]
        )
      ).toBeTrue();
      expect(
        RecipeUtility.allowsModules(
          Mocks.Dataset.recipeEntities[ItemId.Coal],
          Mocks.Dataset.machineEntities[ItemId.BurnerMiningDrill]
        )
      ).toBeFalse();
    });
  });

  describe('adjustDataset', () => {
    it('should adjust recipes and silo recipes', () => {
      spyOn(RecipeUtility, 'adjustSiloRecipes').and.callThrough();
      spyOn(RecipeUtility, 'adjustRecipe').and.callThrough();
      const result = RecipeUtility.adjustDataset(
        Mocks.RecipesStateRationalInitial,
        Mocks.ItemsStateInitial,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.one,
        false,
        Rational.one,
        Rational.one,
        Mocks.Dataset
      );
      expect(result).toBeTruthy();
      expect(RecipeUtility.adjustSiloRecipes).toHaveBeenCalledTimes(1);
      expect(RecipeUtility.adjustRecipe).toHaveBeenCalledTimes(228);
    });

    it('should use specified item recipe', () => {
      const itemSettings = {
        ...Mocks.ItemsStateInitial,
        ...{
          [ItemId.PetroleumGas]: {
            ...Mocks.ItemsStateInitial[ItemId.PetroleumGas],
            ...{
              recipeId: RecipeId.CoalLiquefaction,
            },
          },
        },
      };
      const result = RecipeUtility.adjustDataset(
        Mocks.RecipesStateRationalInitial,
        itemSettings,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.one,
        false,
        Rational.one,
        Rational.one,
        Mocks.Dataset
      );
      expect(result.itemRecipeId[ItemId.PetroleumGas]).toEqual(
        RecipeId.CoalLiquefaction
      );
    });

    it('should find unique item recipes', () => {
      const result = RecipeUtility.adjustDataset(
        Mocks.RecipesStateRationalInitial,
        Mocks.ItemsStateInitial,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.one,
        false,
        Rational.one,
        Rational.one,
        Mocks.Dataset
      );
      expect(result.itemRecipeId[ItemId.SolidFuel]).toEqual(
        RecipeId.SolidFuelFromLightOil
      );
    });
  });

  describe('adjustCost', () => {
    let recipeR: Entities<RecipeRat>;

    beforeEach(() => {
      recipeR = RecipeUtility.adjustRecipes(
        Mocks.RecipesStateRationalInitial,
        Mocks.ItemsStateInitial,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.one,
        false,
        Mocks.Dataset
      );
    });

    it('should apply an overridden cost', () => {
      const recipeSettings = {
        ...Mocks.RecipesStateRationalInitial,
        ...{
          [RecipeId.Coal]: {
            ...Mocks.RecipesStateRationalInitial[RecipeId.Coal],
            ...{ cost: Rational.two },
          },
        },
      };
      RecipeUtility.adjustCost(
        recipeR,
        recipeSettings,
        Rational.one,
        Rational.one
      );
      expect(recipeR[RecipeId.Coal].cost).toEqual(Rational.two);
    });

    it('should apply normal recipe and machine costs', () => {
      RecipeUtility.adjustCost(
        recipeR,
        Mocks.RecipesStateRationalInitial,
        Rational.one,
        Rational.one
      );
      expect(recipeR[RecipeId.Coal].cost).toEqual(Rational.from(29575));
      expect(recipeR[RecipeId.CopperCable].cost).toEqual(Rational.one);
    });
  });

  describe('adjustProducer', () => {
    it('should adjust a producer based on settings', () => {
      const result = RecipeUtility.adjustProducer(
        { id: '1', recipeId: RecipeId.IronPlate, count: '1' },
        Mocks.MachinesStateInitial,
        Mocks.Dataset
      );
      expect(result.machineId).toEqual(ItemId.ElectricFurnace);
      expect(result.machineModuleOptions?.length).toEqual(10);
      expect(result.machineModuleIds).toEqual([
        ItemId.ProductivityModule3,
        ItemId.ProductivityModule3,
      ]);
      expect(result.beacons?.[0].count).toEqual('8');
      expect(result.beacons?.[0].id).toEqual(ItemId.Beacon);
      expect(result.beacons?.[0].moduleOptions?.length).toEqual(7);
      expect(result.beacons?.[0].moduleIds).toEqual([
        ItemId.SpeedModule3,
        ItemId.SpeedModule3,
      ]);
      expect(result.overclock).toBeUndefined();
    });

    it('should handle a machine with no modules', () => {
      const machines = {
        ...Mocks.MachinesStateInitial,
        ...{ ids: undefined },
      };
      const result = RecipeUtility.adjustProducer(
        {
          id: '1',
          recipeId: RecipeId.IronPlate,
          count: '1',
        },
        machines,
        Mocks.Dataset
      );
      expect(result.machineId).toEqual(ItemId.StoneFurnace);
    });

    it('should handle nullish values', () => {
      spyOn(RecipeUtility, 'allowsModules').and.returnValue(true);
      const data = Mocks.getDataset();
      data.machineEntities[ItemId.StoneFurnace].modules = undefined;
      const machines = {
        ...Mocks.MachinesStateInitial,
        ...{
          ids: undefined,
          entities: {
            ...Mocks.MachinesStateInitial.entities,
            ...{
              [ItemId.ElectricFurnace]: {
                ...Mocks.MachinesStateInitial.entities[ItemId.ElectricFurnace],
                ...{
                  moduleRankIds: undefined,
                  beaconModuleRankIds: undefined,
                },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustProducer(
        {
          id: '1',
          recipeId: RecipeId.IronPlate,
          count: '1',
          beacons: [{ id: ItemId.Beacon }],
        },
        machines,
        data
      );
      expect(result.machineId).toEqual(ItemId.StoneFurnace);
      expect(result.machineModuleIds).toEqual([]);
      expect(result.beacons?.[0].moduleIds).toEqual([
        ItemId.Module,
        ItemId.Module,
      ]);
    });
  });
});
