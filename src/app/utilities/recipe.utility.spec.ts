import { Mocks, ItemId, RecipeId } from 'src/tests';
import {
  EnergyType,
  Entities,
  Product,
  RateType,
  Rational,
  RationalItem,
  RationalRecipe,
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
      settings.factoryModules = null;
      settings.beaconModules = [ItemId.Module];
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
        Rational.zero,
        Rational.zero,
        Mocks.RationalRecipeSettings[RecipeId.CopperCable],
        Mocks.Data
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.CopperCable]
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
      expected.time = Rational.from(30);
      expected.adjustProd = true;
      expected.productivity = Rational.one;
      expected.drain = undefined;
      expected.consumption = Rational.from(60);
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
      expected.out = { [ItemId.IronOre]: Rational.from(3) };
      expected.time = Rational.two;
      expected.drain = undefined;
      expected.consumption = Rational.from(90);
      expected.pollution = Rational.from(1, 6);
      expected.productivity = Rational.from(3);
      expect(result).toEqual(expected);
    });

    it('should handle modules and beacons', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.factoryModules = [
        ItemId.SpeedModule,
        ItemId.ProductivityModule,
        ItemId.EfficiencyModule,
      ];
      settings.beaconCount = Rational.one;
      settings.beaconModules = [ItemId.SpeedModule, ItemId.SpeedModule];
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
        [ItemId.SteelChest]: Rational.from(76, 25),
      };
      expected.time = Rational.from(40, 81);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(255);
      expected.pollution = Rational.from(1037, 4000);
      expected.productivity = Rational.from(76, 25);
      expect(result).toEqual(expected);
    });

    it('should handle beacon with no effect', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.beaconCount = Rational.one;
      settings.beaconModules = [
        ItemId.EfficiencyModule,
        ItemId.EfficiencyModule,
      ];
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
      expected.time = Rational.from(2, 3);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(150);
      expected.pollution = Rational.from(1, 20);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should use minimum 20% effects', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.factoryModules = [
        ItemId.EfficiencyModule3,
        ItemId.EfficiencyModule3,
        ItemId.EfficiencyModule3,
      ];
      // Set up efficiency module 3 to cause more than maximum effect in speed, consumption, and pollution
      const data = {
        ...Mocks.Data,
        ...{
          itemR: {
            ...Mocks.Data.itemR,
            ...{
              [ItemId.EfficiencyModule3]: {
                ...Mocks.Data.itemR[ItemId.EfficiencyModule3],
                ...{
                  module: {
                    ...Mocks.Data.itemR[ItemId.EfficiencyModule3].module,
                    ...{
                      speed:
                        Mocks.Data.itemR[ItemId.EfficiencyModule3].module
                          .consumption,
                      pollution:
                        Mocks.Data.itemR[ItemId.EfficiencyModule3].module
                          .consumption,
                    },
                  },
                },
              },
            },
          },
        },
      };
      settings.beaconCount = Rational.zero;
      settings.beaconModules = [ItemId.Module];
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
      expected.time = Rational.from(10, 3);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(30);
      expected.pollution = Rational.from(1, 500);
      expected.productivity = Rational.one;
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
        Rational.zero,
        Rational.zero,
        Mocks.RationalRecipeSettingsInitial[RecipeId.UsedUpUraniumFuelCell],
        Mocks.Data
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(Rational.from(1, 200));
    });

    it('should find non-matching nonchemical fuel', () => {
      const data = {
        ...Mocks.Data,
        ...{
          recipeEntities: {
            ...Mocks.Data.recipeEntities,
            ...{
              [RecipeId.UsedUpUraniumFuelCell]: {
                ...Mocks.Data.recipeEntities[RecipeId.UsedUpUraniumFuelCell],
                ...{ in: null, out: {} },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.UsedUpUraniumFuelCell,
        ItemId.UsedUpUraniumFuelCell,
        Rational.zero,
        Rational.zero,
        Mocks.RationalRecipeSettingsInitial[RecipeId.UsedUpUraniumFuelCell],
        data
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(Rational.from(1, 200));
    });

    it('should ignore burner with no usage', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.IronOre] };
      settings.factory = ItemId.BurnerMiningDrill;
      const data = {
        ...Mocks.Data,
        ...{
          itemR: {
            ...Mocks.Data.itemR,
            ...{
              [ItemId.BurnerMiningDrill]: new RationalItem({
                ...Mocks.Data.itemEntities[ItemId.BurnerMiningDrill],
                ...{
                  factory: {
                    speed: 1,
                    modules: 0,
                    type: EnergyType.Burner,
                    usage: 0,
                  },
                },
              }),
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.IronOre,
        ItemId.Coal,
        Rational.zero,
        Rational.zero,
        settings,
        data
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.IronOre]
      );
      expected.out = {
        [ItemId.IronOre]: Rational.one,
      };
      expected.time = Rational.one;
      expected.drain = undefined;
      expected.consumption = Rational.zero;
      expected.pollution = Rational.zero;
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should adjust based on overclock', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      settings.overclock = Rational.from(200);
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
      expected.time = Rational.from(1, 3);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(909429939, 2000000);
      expected.pollution = Rational.from(1, 20);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should use a recipe specific usage', () => {
      const settings = { ...Mocks.RationalRecipeSettings[RecipeId.SteelChest] };
      const data = {
        ...Mocks.Data,
        ...{
          recipeEntities: {
            ...Mocks.Data.recipeEntities,
            ...{
              [RecipeId.SteelChest]: {
                ...Mocks.Data.recipeEntities[RecipeId.SteelChest],
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
        Rational.zero,
        Rational.zero,
        settings,
        data
      );
      const expected = new RationalRecipe(
        Mocks.Data.recipeEntities[RecipeId.SteelChest]
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
  });

  describe('adjustSiloRecipes', () => {
    let recipeR: Entities<RationalRecipe>;

    beforeEach(() => {
      recipeR = Mocks.AdjustedData.recipeIds.reduce(
        (e: Entities<RationalRecipe>, i) => {
          e[i] = RecipeUtility.adjustRecipe(
            i,
            ItemId.Coal,
            Rational.zero,
            Rational.one,
            Mocks.RationalRecipeSettingsInitial[i],
            Mocks.Data
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
            factory: 'id',
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
      expect(result).toBeUndefined();
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
          Mocks.Data.recipeEntities[RecipeId.RocketPart],
          Mocks.Data.itemEntities[ItemId.RocketSilo].factory
        )
      ).toBeTrue();
      expect(
        RecipeUtility.allowsModules(
          Mocks.Data.recipeEntities[RecipeId.SpaceSciencePack],
          Mocks.Data.itemEntities[ItemId.RocketSilo].factory
        )
      ).toBeFalse();
      // Normal recipes
      expect(
        RecipeUtility.allowsModules(
          Mocks.Data.recipeEntities[ItemId.Coal],
          Mocks.Data.itemEntities[ItemId.ElectricMiningDrill].factory
        )
      ).toBeTrue();
      expect(
        RecipeUtility.allowsModules(
          Mocks.Data.recipeEntities[ItemId.Coal],
          Mocks.Data.itemEntities[ItemId.BurnerMiningDrill].factory
        )
      ).toBeFalse();
      // Null factory
      expect(
        RecipeUtility.allowsModules(
          Mocks.Data.recipeEntities[ItemId.Coal],
          null
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
        Mocks.Defaults.disabledRecipes,
        ItemId.Coal,
        Rational.zero,
        Rational.one,
        Rational.one,
        Rational.one,
        Mocks.Data
      );
      expect(result).toBeTruthy();
      expect(RecipeUtility.adjustSiloRecipes).toHaveBeenCalledTimes(1);
      expect(RecipeUtility.adjustRecipe).toHaveBeenCalledTimes(221);
    });

    it('should use specified item recipe', () => {
      const itemSettings = {
        ...Mocks.ItemSettingsInitial,
        ...{
          [ItemId.PetroleumGas]: {
            ...Mocks.ItemSettingsInitial[ItemId.PetroleumGas],
            ...{
              recipe: RecipeId.CoalLiquefaction,
            },
          },
        },
      };
      const result = RecipeUtility.adjustDataset(
        Mocks.RationalRecipeSettingsInitial,
        itemSettings,
        Mocks.Defaults.disabledRecipes,
        ItemId.Coal,
        Rational.zero,
        Rational.one,
        Rational.one,
        Rational.one,
        Mocks.Data
      );
      expect(result.itemRecipeIds[ItemId.PetroleumGas]).toEqual(
        RecipeId.CoalLiquefaction
      );
    });

    it('should find unique item recipes', () => {
      const result = RecipeUtility.adjustDataset(
        Mocks.RationalRecipeSettingsInitial,
        Mocks.ItemSettingsInitial,
        [RecipeId.SolidFuelFromHeavyOil, RecipeId.SolidFuelFromPetroleumGas],
        ItemId.Coal,
        Rational.zero,
        Rational.one,
        Rational.one,
        Rational.one,
        Mocks.Data
      );
      expect(result.itemRecipeIds[ItemId.SolidFuel]).toEqual(
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
      expect(result).toBeNull();
    });
  });

  describe('adjustCost', () => {
    let recipeR: Entities<RationalRecipe>;

    beforeEach(() => {
      recipeR = RecipeUtility.adjustRecipes(
        Mocks.RationalRecipeSettingsInitial,
        ItemId.Coal,
        Rational.zero,
        Rational.one,
        Mocks.Data
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
        RecipeUtility.adjustProduct(product, null, null, null, null)
      ).toEqual(product);
    });

    it('should add viaId to products using rateType other than Factories', () => {
      const recipe = RecipeUtility.adjustProduct(
        Mocks.Product1,
        null,
        null,
        null,
        null
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
        viaFactoryModules: [],
        viaBeaconCount: '0',
        viaBeacon: ItemId.Beacon,
        viaBeaconModules: [],
        viaOverclock: 200,
      };
      expect(
        RecipeUtility.adjustProduct(
          product,
          null,
          Mocks.RecipeSettingsInitial,
          Mocks.FactorySettingsInitial,
          Mocks.Data
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
        viaFactoryModules: [],
        viaBeaconCount: '0',
        viaBeacon: ItemId.Beacon,
        viaBeaconModules: [],
        viaOverclock: 200,
      };
      expect(
        RecipeUtility.adjustProduct(
          product,
          null,
          Mocks.RecipeSettingsInitial,
          Mocks.FactorySettingsInitial,
          Mocks.Data
        )
      ).toEqual(product);
    });

    it('by factories, should set simple viaId', () => {
      const result = RecipeUtility.adjustProduct(
        { id, itemId, rate, rateType },
        null,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        Mocks.Data
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
        null,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        Mocks.Data
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
              beacon: 'beacon-2',
            },
          },
        },
      };
      const result = RecipeUtility.adjustProduct(
        { id, itemId, rate, rateType, viaBeacon: ItemId.Beacon },
        null,
        recipeSettings,
        Mocks.FactorySettingsInitial,
        Mocks.Data
      );
      expect(result.viaBeaconModules).toEqual([
        ItemId.SpeedModule3,
        ItemId.SpeedModule3,
      ]);
    });

    it('by factories, should skip missed viaId', () => {
      spyOn(RecipeUtility, 'getProductStepData').and.returnValue(null);
      const result = RecipeUtility.adjustProduct(
        { id, itemId: ItemId.PetroleumGas, rate, rateType },
        null,
        Mocks.RecipeSettingsInitial,
        null,
        Mocks.Data
      );
      expect(result.viaId).toBeUndefined();
    });

    it('by factories, should skip modules if not allowed', () => {
      spyOn(RecipeUtility, 'allowsModules').and.returnValue(false);
      const result = RecipeUtility.adjustProduct(
        { id, itemId, rate, rateType },
        null,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        Mocks.Data
      );
      expect(result.viaFactoryModules).toBeUndefined();
      expect(result.viaBeaconCount).toBeUndefined();
      expect(result.viaBeacon).toBeUndefined();
      expect(result.viaBeaconModules).toBeUndefined();
    });

    it('by factories, nondefault factory, should adjust modules', () => {
      const result = RecipeUtility.adjustProduct(
        { id, itemId, rate, rateType, viaSetting: ItemId.AssemblingMachine2 },
        null,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        Mocks.Data
      );
      expect(result.viaFactoryModules).toEqual([
        ItemId.ProductivityModule3,
        ItemId.ProductivityModule3,
      ]);
    });

    it('by factories, should handle invalid viaBeacon', () => {
      const result = RecipeUtility.adjustProduct(
        { id, itemId, rate, rateType, viaBeacon: 'test' },
        null,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        Mocks.Data
      );
      expect(result.viaBeaconModules).toBeUndefined();
    });

    it('by factories, nondefault factory, should handle invalid viaBeacon', () => {
      const result = RecipeUtility.adjustProduct(
        {
          id,
          itemId,
          rate,
          rateType,
          viaSetting: ItemId.AssemblingMachine2,
          viaBeacon: 'test',
        },
        null,
        Mocks.RecipeSettingsInitial,
        Mocks.FactorySettingsInitial,
        Mocks.Data
      );
      expect(result.viaBeaconModules).toBeUndefined();
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
      expect(itemRecipeIds).toEqual({ [ItemId.Wood]: null });
    });
  });
});
