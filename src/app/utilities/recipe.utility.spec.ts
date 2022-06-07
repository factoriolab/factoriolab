import { ItemId, Mocks, RecipeId } from 'src/tests';
import {
  Entities,
  Product,
  RateType,
  Rational,
  RationalRecipe,
  RationalRecipeSettings,
} from '~/models';
import * as Factories from '~/store/factories';
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
      settings.factoryModuleIds = undefined;
      settings.beaconModuleIds = [ItemId.SpeedModule];
      settings.beaconCount = undefined;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        settings,
        Mocks.ItemSettingsInitial,
        Mocks.Dataset
      );
      const expected = new RationalRecipe(
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
        Mocks.RationalRecipeSettings[RecipeId.CopperCable],
        Mocks.ItemSettingsInitial,
        Mocks.Dataset
      );
      const expected = new RationalRecipe(
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
        ...Mocks.RationalRecipeSettings[RecipeId.MiningProductivity],
      };
      settings.factoryId = ItemId.Lab;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.MiningProductivity,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.two,
        settings,
        Mocks.ItemSettingsInitial,
        Mocks.Dataset
      );
      const expected = new RationalRecipe(
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
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.IronOre] };
      settings.factoryId = ItemId.ElectricMiningDrill;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.IronOre,
        ItemId.Coal,
        ItemId.Module,
        Rational.two,
        Rational.zero,
        settings,
        Mocks.ItemSettingsInitial,
        Mocks.Dataset
      );
      const expected = new RationalRecipe(
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
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.factoryModuleIds = [
        ItemId.SpeedModule,
        ItemId.ProductivityModule,
        ItemId.EfficiencyModule,
      ];
      settings.beaconCount = Rational.one;
      settings.beaconModuleIds = [ItemId.SpeedModule, ItemId.SpeedModule];
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
        settings,
        Mocks.ItemSettingsInitial,
        data
      );
      const expected = new RationalRecipe(
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
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.factoryModuleIds = [
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
      settings.beaconCount = Rational.zero;
      settings.beaconModuleIds = [ItemId.Module];
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        settings,
        Mocks.ItemSettingsInitial,
        data
      );
      const expected = new RationalRecipe(
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
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.IronOre] };
      settings.factoryId = ItemId.BurnerMiningDrill;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.IronOre,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        settings,
        Mocks.ItemSettingsInitial,
        Mocks.Dataset
      );
      const expected = new RationalRecipe(
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
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.PlasticBar] };
      settings.factoryId = ItemId.SteelFurnace;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.PlasticBar,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        settings,
        Mocks.ItemSettingsInitial,
        Mocks.Dataset
      );
      const expected = new RationalRecipe(
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
        Mocks.RationalRecipeSettingsInitial[RecipeId.UsedUpUraniumFuelCell],
        Mocks.ItemSettingsInitial,
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
        Mocks.RationalRecipeSettingsInitial[RecipeId.UsedUpUraniumFuelCell],
        Mocks.ItemSettingsInitial,
        data
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(Rational.from(1, 200));
    });

    it('should adjust based on overclock', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.overclock = Rational.from(200);
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        settings,
        Mocks.ItemSettingsInitial,
        Mocks.Dataset
      );
      const expected = new RationalRecipe(
        Mocks.Dataset.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = { [ItemId.SteelChest]: Rational.one };
      expected.time = Rational.from(1, 3);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(909429939, 2000000);
      expected.pollution = Rational.from(1, 20);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should account for factories with custom overclock factors', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.overclock = Rational.from(200);
      const data = {
        ...Mocks.Dataset,
        ...{
          factoryEntities: {
            ...Mocks.Dataset.factoryEntities,
            ...{
              [settings.factoryId!]: {
                ...Mocks.Dataset.factoryEntities[settings.factoryId!],
                ...{ overclockFactor: 1.321928 },
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
        settings,
        Mocks.ItemSettingsInitial,
        data
      );
      const expected = new RationalRecipe(
        Mocks.Dataset.recipeEntities[RecipeId.SteelChest]
      );
      expected.out = { [ItemId.SteelChest]: Rational.one };
      expected.time = Rational.from(29597129, 75000000);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(694182921, 2000000);
      expected.pollution = Rational.from(1, 20);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should use a recipe specific usage', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
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
        settings,
        Mocks.ItemSettingsInitial,
        data
      );
      const expected = new RationalRecipe(
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

    it('should handle a factory with no listed speed', () => {
      const settings = Mocks.RationalRecipeSettings[RecipeId.SteelChest];
      const data = {
        ...Mocks.Dataset,
        ...{
          factoryEntities: {
            ...Mocks.Dataset.factoryEntities,
            ...{
              [ItemId.AssemblingMachine2]: {
                ...Mocks.Dataset.factoryEntities[ItemId.AssemblingMachine2],
                ...{
                  ...Mocks.Dataset.factoryEntities[ItemId.AssemblingMachine2],
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
        settings,
        Mocks.ItemSettingsInitial,
        data
      );
      const expected = new RationalRecipe(
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
      const settings = new RationalRecipeSettings({
        ...Mocks.RecipeSettingsInitial[ItemId.SteelChest],
        ...{ factoryModuleIds: [ItemId.ProductivityModule3] },
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
        settings,
        Mocks.ItemSettingsInitial,
        data
      );
      const expected = new RationalRecipe(recipe);
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
      const settings = new RationalRecipeSettings({
        ...Mocks.RecipeSettingsInitial[ItemId.SteelChest],
        ...{ factoryModuleIds: [ItemId.ProductivityModule3] },
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
        settings,
        Mocks.ItemSettingsInitial,
        data
      );
      const expected = new RationalRecipe(recipe);
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
  });

  describe('adjustSiloRecipes', () => {
    let recipeR: Entities<RationalRecipe>;

    beforeEach(() => {
      recipeR = Mocks.AdjustedData.recipeIds.reduce(
        (e: Entities<RationalRecipe>, i) => {
          e[i] = RecipeUtility.adjustRecipe(
            i,
            ItemId.Coal,
            ItemId.Module,
            Rational.zero,
            Rational.one,
            Mocks.RationalRecipeSettingsInitial[i],
            Mocks.ItemSettingsInitial,
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
        Mocks.RationalRecipeSettingsInitial,
        Mocks.AdjustedData
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        Rational.from(82499, 924)
      );
      expect(result[RecipeId.RocketPart].time).toEqual(
        Rational.from(82499, 66000)
      );
    });

    it('should handle invalid factory', () => {
      const settings2 = {
        ...Mocks.RationalRecipeSettingsInitial,
        ...{
          [RecipeId.SpaceSciencePack]: {
            factoryId: 'id',
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

  describe('getProductStepData', () => {
    it('should handle no recipes available', () => {
      const result = RecipeUtility.getProductStepData({ [RecipeId.Coal]: [] }, {
        itemId: RecipeId.Coal,
      } as any);
      expect(result).toBeNull();
    });

    it('should find matching data', () => {
      const data: [string, Rational] = [RecipeId.Coal, Rational.one];
      const result = RecipeUtility.getProductStepData(
        { [RecipeId.Coal]: [data] },
        { itemId: RecipeId.Coal, viaId: RecipeId.Coal } as any
      );
      expect(result).toEqual(data);
    });

    it('should fail to find matching data', () => {
      const data: [string, Rational] = [RecipeId.Coal, Rational.one];
      const result = RecipeUtility.getProductStepData(
        { [RecipeId.Coal]: [data] },
        { itemId: RecipeId.Coal, viaId: RecipeId.AdvancedOilProcessing } as any
      );
      expect(result).toBeNull();
    });

    it('should handle no recipe specified', () => {
      const data: [string, Rational] = [RecipeId.Coal, Rational.one];
      const result = RecipeUtility.getProductStepData(
        { [RecipeId.Coal]: [data] },
        { itemId: RecipeId.Coal } as any
      );
      expect(result).toEqual(data);
    });
  });

  describe('allowsModules', () => {
    it('should check factory and rocket recipes', () => {
      // Silo recipes
      expect(
        RecipeUtility.allowsModules(
          Mocks.Dataset.recipeEntities[RecipeId.RocketPart],
          Mocks.Dataset.factoryEntities[ItemId.RocketSilo]
        )
      ).toBeTrue();
      expect(
        RecipeUtility.allowsModules(
          Mocks.Dataset.recipeEntities[RecipeId.SpaceSciencePack],
          Mocks.Dataset.factoryEntities[ItemId.RocketSilo]
        )
      ).toBeFalse();
      // Normal recipes
      expect(
        RecipeUtility.allowsModules(
          Mocks.Dataset.recipeEntities[ItemId.Coal],
          Mocks.Dataset.factoryEntities[ItemId.ElectricMiningDrill]
        )
      ).toBeTrue();
      expect(
        RecipeUtility.allowsModules(
          Mocks.Dataset.recipeEntities[ItemId.Coal],
          Mocks.Dataset.factoryEntities[ItemId.BurnerMiningDrill]
        )
      ).toBeFalse();
    });
  });

  describe('adjustDataset', () => {
    it('should adjust recipes and silo recipes', () => {
      spyOn(RecipeUtility, 'adjustSiloRecipes').and.callThrough();
      spyOn(RecipeUtility, 'adjustRecipe').and.callThrough();
      const result = RecipeUtility.adjustDataset(
        Mocks.RationalRecipeSettingsInitial,
        Mocks.ItemSettingsInitial,
        Mocks.Defaults.disabledRecipeIds,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.one,
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
        ...Mocks.ItemSettingsInitial,
        ...{
          [ItemId.PetroleumGas]: {
            ...Mocks.ItemSettingsInitial[ItemId.PetroleumGas],
            ...{
              recipeId: RecipeId.CoalLiquefaction,
            },
          },
        },
      };
      const result = RecipeUtility.adjustDataset(
        Mocks.RationalRecipeSettingsInitial,
        itemSettings,
        Mocks.Defaults.disabledRecipeIds,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.one,
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
        Mocks.RationalRecipeSettingsInitial,
        Mocks.ItemSettingsInitial,
        [RecipeId.SolidFuelFromHeavyOil, RecipeId.SolidFuelFromPetroleumGas],
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.one,
        Rational.one,
        Rational.one,
        Mocks.Dataset
      );
      expect(result.itemRecipeId[ItemId.SolidFuel]).toEqual(
        RecipeId.SolidFuelFromLightOil
      );
    });
  });

  describe('defaultRecipe', () => {
    it('should find a default recipe for an item', () => {
      const result = RecipeUtility.defaultRecipe(
        ItemId.Coal,
        [],
        Mocks.AdjustedData
      );
      expect(result).toEqual(RecipeId.Coal);
    });

    it('should handle disabled recipes', () => {
      const result = RecipeUtility.defaultRecipe(
        ItemId.Coal,
        [RecipeId.Coal],
        Mocks.AdjustedData
      );
      expect(result).toBeUndefined();
    });
  });

  describe('adjustCost', () => {
    let recipeR: Entities<RationalRecipe>;

    beforeEach(() => {
      recipeR = RecipeUtility.adjustRecipes(
        Mocks.RationalRecipeSettingsInitial,
        Mocks.ItemSettingsInitial,
        ItemId.Coal,
        ItemId.Module,
        Rational.zero,
        Rational.one,
        Mocks.Dataset
      );
    });

    it('should apply an overridden cost', () => {
      const recipeSettings = {
        ...Mocks.RationalRecipeSettingsInitial,
        ...{
          [RecipeId.Coal]: {
            ...Mocks.RationalRecipeSettingsInitial[RecipeId.Coal],
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

    it('should apply normal recipe and factory costs', () => {
      RecipeUtility.adjustCost(
        recipeR,
        Mocks.RationalRecipeSettingsInitial,
        Rational.one,
        Rational.one
      );
      expect(recipeR[RecipeId.Coal].cost).toEqual(Rational.from(29575));
      expect(recipeR[RecipeId.CopperCable].cost).toEqual(Rational.one);
    });
  });

  describe('adjustProduct', () => {
    const id = '0';
    const itemId = ItemId.Coal;
    const rate = '1';
    const rateType = RateType.Factories;

    it('should ignore products using rateType other than Factories', () => {
      const product = {
        ...Mocks.Product1,
        ...{ viaId: Mocks.Product1.itemId },
      };
      expect(
        RecipeUtility.adjustProduct(
          product,
          {},
          {},
          Factories.initialFactoriesState,
          Mocks.AdjustedData
        )
      ).toEqual(product);
    });

    it('should add viaId to products using rateType other than Factories', () => {
      const recipe = RecipeUtility.adjustProduct(
        Mocks.Product1,
        {},
        {},
        Factories.initialFactoriesState,
        Mocks.AdjustedData
      );
      expect(recipe).toEqual({
        ...Mocks.Product1,
        ...{ viaId: Mocks.Product1.itemId },
      });
    });

    it('by factories, should return product with all fields defined', () => {
      const product: Product = {
        id,
        itemId,
        rate,
        rateType,
        viaId: RecipeId.Coal,
        viaSetting: ItemId.ElectricMiningDrill,
        viaFactoryModuleIds: [],
        viaBeaconCount: '0',
        viaBeaconId: ItemId.Beacon,
        viaBeaconModuleIds: [],
        viaOverclock: 200,
      };
      expect(
        RecipeUtility.adjustProduct(
          product,
          {},
          Mocks.RecipeSettingsInitial,
          Mocks.FactorySettingsInitial,
          Mocks.Dataset
        )
      ).toEqual(product);
    });

    it('by factories, nondefault factory, should return product with all fields defined', () => {
      const product: Product = {
        id,
        itemId,
        rate,
        rateType,
        viaId: RecipeId.Coal,
        viaSetting: ItemId.AssemblingMachine2,
        viaFactoryModuleIds: [],
        viaBeaconCount: '0',
        viaBeaconId: ItemId.Beacon,
        viaBeaconModuleIds: [],
        viaOverclock: 200,
      };
      expect(
        RecipeUtility.adjustProduct(
          product,
          {},
          Mocks.RecipeSettingsInitial,
          Mocks.FactorySettingsInitial,
          Mocks.Dataset
        )
      ).toEqual(product);
    });

    it('by factories, should set simple viaId', () => {
      const result = RecipeUtility.adjustProduct(
        { id, itemId, rate, rateType },
        {},
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        Mocks.Dataset
      );
      expect(result.viaId).toEqual(itemId);
    });

    it('by factories, should set complex viaId', () => {
      spyOn(RecipeUtility, 'getProductStepData').and.returnValue([
        itemId,
        Rational.zero,
      ]);
      const result = RecipeUtility.adjustProduct(
        { id, itemId: ItemId.PetroleumGas, rate, rateType },
        {},
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        Mocks.Dataset
      );
      expect(result.viaId).toEqual(itemId);
    });

    it('by factories, nondefault beacon, should set beacon modules', () => {
      const recipeSettings = {
        ...Mocks.RecipeSettingsInitial,
        ...{
          [RecipeId.Coal]: {
            ...Mocks.RecipeSettingsInitial[RecipeId.Coal],
            ...{
              beaconId: 'beacon-2',
            },
          },
        },
      };
      const result = RecipeUtility.adjustProduct(
        { id, itemId, rate, rateType, viaBeaconId: ItemId.Beacon },
        {},
        recipeSettings,
        Mocks.FactorySettingsInitial,
        Mocks.Dataset
      );
      expect(result.viaBeaconModuleIds).toEqual([
        ItemId.SpeedModule3,
        ItemId.SpeedModule3,
      ]);
    });

    it('by factories, should skip missed viaId', () => {
      spyOn(RecipeUtility, 'getProductStepData').and.returnValue(null);
      const result = RecipeUtility.adjustProduct(
        { id, itemId: ItemId.PetroleumGas, rate, rateType },
        {},
        Mocks.RecipeSettingsInitial,
        Factories.initialFactoriesState,
        Mocks.Dataset
      );
      expect(result.viaId).toBeUndefined();
    });

    it('by factories, should skip modules if not allowed', () => {
      spyOn(RecipeUtility, 'allowsModules').and.returnValue(false);
      const result = RecipeUtility.adjustProduct(
        { id, itemId, rate, rateType },
        {},
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        Mocks.Dataset
      );
      expect(result.viaFactoryModuleIds).toBeUndefined();
      expect(result.viaBeaconCount).toBeUndefined();
      expect(result.viaBeaconId).toBeUndefined();
      expect(result.viaBeaconModuleIds).toBeUndefined();
    });

    it('by factories, nondefault factory, should adjust modules', () => {
      const result = RecipeUtility.adjustProduct(
        { id, itemId, rate, rateType, viaSetting: ItemId.AssemblingMachine2 },
        {},
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        Mocks.Dataset
      );
      expect(result.viaFactoryModuleIds).toEqual([
        ItemId.ProductivityModule3,
        ItemId.ProductivityModule3,
      ]);
    });

    it('by factories, nondefault factory, handle null settings', () => {
      spyOn(RecipeUtility, 'allowsModules').and.returnValue(true);
      const data = {
        ...Mocks.Dataset,
        ...{
          factoryEntities: {
            ...Mocks.Dataset.factoryEntities,
            ...{
              [ItemId.AssemblingMachine1]: {
                ...Mocks.Dataset.factoryEntities[ItemId.AssemblingMachine1],
                ...{ modules: undefined },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustProduct(
        { id, itemId, rate, rateType, viaSetting: ItemId.AssemblingMachine1 },
        {},
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        data
      );
      expect(result.viaFactoryModuleIds).toEqual([]);
    });
  });

  describe('cleanCircularRecipes', () => {
    it('should do nothing for items with no default recipe', () => {
      const itemRecipeIds = {};
      RecipeUtility.cleanCircularRecipes(
        ItemId.Wood,
        Mocks.AdjustedData.recipeR,
        itemRecipeIds
      );
      expect(itemRecipeIds).toEqual({});
    });

    it('should clean up when a circular loop is detected', () => {
      const itemRecipeIds: Entities = { [ItemId.Wood]: RecipeId.WoodenChest };
      RecipeUtility.cleanCircularRecipes(
        ItemId.Wood,
        Mocks.AdjustedData.recipeR,
        itemRecipeIds,
        [ItemId.Wood]
      );
      expect(itemRecipeIds).toEqual({});
    });
  });
});
