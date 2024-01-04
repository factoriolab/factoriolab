import { ItemId, Mocks, RecipeId } from 'src/tests';
import {
  Entities,
  Objective,
  ObjectiveType,
  ObjectiveUnit,
  Rational,
  RecipeRational,
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
        ['test2', value],
      );
      expect(result).toEqual(value);
    });
  });

  describe('fuelOptions', () => {
    it('should handle entities with no fuel categories', () => {
      const result = RecipeUtility.fuelOptions({} as any, Mocks.RawDataset);
      expect(result).toEqual([]);
    });

    it('should handle entity that specifies a fuel', () => {
      const result = RecipeUtility.fuelOptions(
        { fuel: ItemId.Coal } as any,
        Mocks.RawDataset,
      );
      expect(result).toEqual([{ value: ItemId.Coal, label: 'Coal' }]);
    });
  });

  describe('defaultModules', () => {
    it('should fill in modules list for machine', () => {
      const result = RecipeUtility.defaultModules(
        [{ value: ItemId.SpeedModule }],
        [ItemId.ProductivityModule, ItemId.SpeedModule],
        1,
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
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        Mocks.RawDataset,
      );
      const expected = new RecipeRational(
        Mocks.RawDataset.recipeEntities[RecipeId.SteelChest],
      );
      expected.out = { [ItemId.SteelChest]: Rational.one };
      expected.time = Rational.from([2, 3]);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(150);
      expected.pollution = Rational.from([1, 20]);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should handle recipes with declared outputs', () => {
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CopperCable,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        Mocks.RecipesStateRational[RecipeId.CopperCable],
        Mocks.ItemsStateInitial,
        Mocks.RawDataset,
      );
      const expected = new RecipeRational(
        Mocks.RawDataset.recipeEntities[RecipeId.CopperCable],
      );
      expected.time = Rational.from([2, 3]);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(150);
      expected.pollution = Rational.from([1, 20]);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should handle research factor', () => {
      const settings = {
        ...Mocks.RecipesStateRational[RecipeId.MiningProductivity],
      };
      settings.machineId = ItemId.Lab;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.MiningProductivity,
        ItemId.Module,
        Rational.zero,
        Rational.two,
        false,
        settings,
        Mocks.ItemsStateInitial,
        Mocks.RawDataset,
      );
      const expected = new RecipeRational(
        Mocks.RawDataset.recipeEntities[RecipeId.MiningProductivity],
      );
      expected.out = { [ItemId.MiningProductivity]: Rational.one };
      expected.time = Rational.from(30);
      expected.productivity = Rational.one;
      expected.drain = undefined;
      expected.consumption = Rational.from(60);
      expected.pollution = Rational.zero;
      expect(result).toEqual(expected);
    });

    it('should handle mining productivity', () => {
      const settings = { ...Mocks.RecipesStateRational[RecipeId.IronOre] };
      settings.machineId = ItemId.ElectricMiningDrill;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.IronOre,
        ItemId.Module,
        Rational.two,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        Mocks.RawDataset,
      );
      const expected = new RecipeRational(
        Mocks.RawDataset.recipeEntities[RecipeId.IronOre],
      );
      expected.out = { [ItemId.IronOre]: Rational.from(3) };
      expected.time = Rational.two;
      expected.drain = undefined;
      expected.consumption = Rational.from(90);
      expected.pollution = Rational.from([1, 6]);
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
        ...Mocks.RawDataset,
        ...{
          moduleEntities: {
            ...Mocks.RawDataset.moduleEntities,
            ...{
              // To verify all factors work in beacons
              [ItemId.SpeedModule]: {
                ...Mocks.RawDataset.moduleEntities[ItemId.SpeedModule],
                ...{ productivity: Rational.one, pollution: Rational.one },
              },
              // To verify null consumption works
              [ItemId.ProductivityModule]: {
                ...Mocks.RawDataset.moduleEntities[ItemId.ProductivityModule],
                ...{ consumption: undefined },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        data,
      );
      const expected = new RecipeRational(
        Mocks.RawDataset.recipeEntities[RecipeId.SteelChest],
      );
      expected.out = {
        [ItemId.SteelChest]: Rational.from([76, 25]),
      };
      expected.time = Rational.from([40, 81]);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(255);
      expected.pollution = Rational.from([1037, 4000]);
      expected.productivity = Rational.from([76, 25]);
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
        ...Mocks.RawDataset,
        ...{
          moduleEntities: {
            ...Mocks.RawDataset.moduleEntities,
            ...{
              [ItemId.EfficiencyModule3]: {
                ...Mocks.RawDataset.moduleEntities[ItemId.EfficiencyModule3],
                ...{
                  speed:
                    Mocks.RawDataset.moduleEntities[ItemId.EfficiencyModule3]
                      .consumption,
                  pollution:
                    Mocks.RawDataset.moduleEntities[ItemId.EfficiencyModule3]
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
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        data,
      );
      const expected = new RecipeRational(
        Mocks.RawDataset.recipeEntities[RecipeId.SteelChest],
      );
      expected.out = {
        [ItemId.SteelChest]: Rational.one,
      };
      expected.time = Rational.from([10, 3]);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(30);
      expected.pollution = Rational.from([1, 500]);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should use minimum 1/60 second time in Factorio', () => {
      const data = Mocks.getRawDataset();
      data.recipeEntities[RecipeId.SteelChest] = {
        ...data.recipeEntities[RecipeId.SteelChest],
        ...{ time: 0.0001 },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        Mocks.RecipesStateRationalInitial[RecipeId.SteelChest],
        Mocks.ItemsStateInitial,
        data,
      );
      expect(result.time).toEqual(Rational.from([1, 60]));
    });

    it('should find matching nonchemical fuel', () => {
      const result = RecipeUtility.adjustRecipe(
        RecipeId.UsedUpUraniumFuelCell,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        Mocks.RecipesStateRationalInitial[RecipeId.UsedUpUraniumFuelCell],
        Mocks.ItemsStateInitial,
        Mocks.RawDataset,
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(
        Rational.from([1, 200]),
      );
    });

    it('should find non-matching nonchemical fuel', () => {
      const data = {
        ...Mocks.RawDataset,
        ...{
          recipeEntities: {
            ...Mocks.RawDataset.recipeEntities,
            ...{
              [RecipeId.UsedUpUraniumFuelCell]: {
                ...Mocks.RawDataset.recipeEntities[
                  RecipeId.UsedUpUraniumFuelCell
                ],
                ...{ in: {}, out: {} },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.UsedUpUraniumFuelCell,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        Mocks.RecipesStateRationalInitial[RecipeId.UsedUpUraniumFuelCell],
        Mocks.ItemsStateInitial,
        data,
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(
        Rational.from([1, 200]),
      );
    });

    it('should adjust based on overclock', () => {
      const settings = { ...Mocks.RecipesStateRational[RecipeId.SteelChest] };
      settings.overclock = Rational.from(200);
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        Mocks.RawDataset,
      );
      const expected = new RecipeRational(
        Mocks.RawDataset.recipeEntities[RecipeId.SteelChest],
      );
      expected.out = { [ItemId.SteelChest]: Rational.one };
      expected.time = Rational.from([1, 3]);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from([136838616, 364903]);
      expected.pollution = Rational.from([1, 20]);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should adjust a power producer based on overclock', () => {
      const settings = { ...Mocks.RecipesStateRational[RecipeId.SteelChest] };
      settings.overclock = Rational.from(200);
      const data = Mocks.getRawDataset();
      data.machineEntities[ItemId.AssemblingMachine2].usage =
        Rational.from(-10);
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        data,
      );
      const expected = new RecipeRational(
        Mocks.RawDataset.recipeEntities[RecipeId.SteelChest],
      );
      expected.out = { [ItemId.SteelChest]: Rational.one };
      expected.time = Rational.from([1, 3]);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(-20);
      expected.pollution = Rational.from([1, 20]);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });

    it('should use a recipe specific usage', () => {
      const settings = { ...Mocks.RecipesStateRational[RecipeId.SteelChest] };
      const data = {
        ...Mocks.RawDataset,
        ...{
          recipeEntities: {
            ...Mocks.RawDataset.recipeEntities,
            ...{
              [RecipeId.SteelChest]: {
                ...Mocks.RawDataset.recipeEntities[RecipeId.SteelChest],
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
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        data,
      );
      const expected = new RecipeRational(
        Mocks.RawDataset.recipeEntities[RecipeId.SteelChest],
      );
      expected.out = { [ItemId.SteelChest]: Rational.one };
      expected.time = Rational.from([2, 3]);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(10000);
      expected.pollution = Rational.from([1, 20]);
      expected.productivity = Rational.one;
      expected.usage = Rational.from(10000);
      expect(result).toEqual(expected);
    });

    it('should calculate proliferator usage', () => {
      const settings = new RecipeSettingsRational({
        ...Mocks.RecipesStateInitial[ItemId.SteelChest],
        ...{ machineModuleIds: [ItemId.ProductivityModule3] },
      });
      const recipe = {
        ...Mocks.RawDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          in: {
            ...Mocks.RawDataset.recipeEntities[RecipeId.SteelChest].in,
            ...{ [ItemId.ProductivityModule]: 1 },
          },
        },
      };
      const data = {
        ...Mocks.RawDataset,
        ...{
          recipeEntities: {
            ...Mocks.RawDataset.recipeEntities,
            ...{
              [RecipeId.SteelChest]: recipe,
            },
          },
          moduleEntities: {
            ...Mocks.RawDataset.moduleEntities,
            ...{
              [ItemId.ProductivityModule3]: {
                ...Mocks.RawDataset.moduleEntities[ItemId.ProductivityModule3],
                ...{
                  sprays: Rational.ten,
                  proliferator: ItemId.ProductivityModule3,
                },
              },
              [ItemId.ProductivityModule]: {
                ...Mocks.RawDataset.moduleEntities[ItemId.ProductivityModule],
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
        ItemId.ProductivityModule,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        data,
      );
      const expected = new RecipeRational(recipe);
      expected.in[ItemId.ProductivityModule] = Rational.from([11, 10]);
      expected.in[ItemId.ProductivityModule3] = Rational.from([9, 10]);
      expected.out = { [ItemId.SteelChest]: Rational.from([11, 10]) };
      expected.time = Rational.from([8, 97]);
      expected.drain = Rational.from([25, 2]);
      expected.consumption = Rational.from(2775);
      expected.pollution = Rational.from([407, 1500]);
      expected.productivity = Rational.from([11, 10]);
      expect(result).toEqual(expected);
    });

    it('should ignore proliferator self-spray with no productivity bonus', () => {
      const settings = new RecipeSettingsRational({
        ...Mocks.RecipesStateInitial[ItemId.SteelChest],
        ...{ machineModuleIds: [ItemId.ProductivityModule3] },
      });
      const recipe = {
        ...Mocks.RawDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          in: {
            ...Mocks.RawDataset.recipeEntities[RecipeId.SteelChest].in,
            ...{ [ItemId.ProductivityModule]: 1 },
          },
        },
      };
      const data = {
        ...Mocks.RawDataset,
        ...{
          recipeEntities: {
            ...Mocks.RawDataset.recipeEntities,
            ...{
              [RecipeId.SteelChest]: recipe,
            },
          },
          moduleEntities: {
            ...Mocks.RawDataset.moduleEntities,
            ...{
              [ItemId.ProductivityModule3]: {
                ...Mocks.RawDataset.moduleEntities[ItemId.ProductivityModule3],
                ...{
                  sprays: Rational.ten,
                  proliferator: ItemId.ProductivityModule3,
                },
              },
              [ItemId.SpeedModule]: {
                ...Mocks.RawDataset.moduleEntities[ItemId.SpeedModule],
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
        ItemId.SpeedModule,
        Rational.zero,
        Rational.zero,
        false,
        settings,
        Mocks.ItemsStateInitial,
        data,
      );
      const expected = new RecipeRational(recipe);
      expected.in[ItemId.SpeedModule] = Rational.from([1, 10]);
      expected.in[ItemId.ProductivityModule3] = Rational.from([9, 10]);
      expected.out = { [ItemId.SteelChest]: Rational.from([11, 10]) };
      expected.time = Rational.from([8, 97]);
      expected.drain = Rational.from([25, 2]);
      expected.consumption = Rational.from(2775);
      expected.pollution = Rational.from([407, 1500]);
      expected.productivity = Rational.from([11, 10]);
      expect(result).toEqual(expected);
    });

    it('should add machine consumption', () => {
      const data = {
        ...Mocks.RawDataset,
        ...{
          machineEntities: {
            ...Mocks.RawDataset.machineEntities,
            ...{
              [ItemId.AssemblingMachine2]: {
                ...Mocks.RawDataset.machineEntities[ItemId.AssemblingMachine2],
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
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        Mocks.RecipesStateRational[RecipeId.CopperCable],
        Mocks.ItemsStateInitial,
        data,
      );
      const expected = new RecipeRational(
        Mocks.RawDataset.recipeEntities[RecipeId.CopperCable],
      );
      expected.time = Rational.from([2, 3]);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(150);
      expected.pollution = Rational.from([1, 20]);
      expected.productivity = Rational.one;
      expected.in[ItemId.Coal] = Rational.from([1, 90]);
      expect(result).toEqual(expected);
    });

    it('should reduce net production to output only', () => {
      const data = Mocks.getRawDataset();
      data.recipeEntities[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] = 1;
      data.recipeEntities[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] = 2;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CoalLiquefaction,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        true,
        Mocks.RecipesStateRational[RecipeId.CoalLiquefaction],
        Mocks.ItemsStateInitial,
        data,
      );
      expect(result.in[ItemId.HeavyOil]).toBeUndefined();
      expect(result.out[ItemId.HeavyOil]).toEqual(Rational.one);
    });

    it('should reduce net production to input only', () => {
      const data = Mocks.getRawDataset();
      data.recipeEntities[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] = 2;
      data.recipeEntities[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] = 1;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CoalLiquefaction,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        true,
        Mocks.RecipesStateRational[RecipeId.CoalLiquefaction],
        Mocks.ItemsStateInitial,
        data,
      );
      expect(result.in[ItemId.HeavyOil]).toEqual(Rational.one);
      expect(result.out[ItemId.HeavyOil]).toBeUndefined();
    });

    it('should reduce net production to no input/output', () => {
      const data = Mocks.getRawDataset();
      data.recipeEntities[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] = 1;
      data.recipeEntities[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] = 1;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CoalLiquefaction,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        true,
        Mocks.RecipesStateRational[RecipeId.CoalLiquefaction],
        Mocks.ItemsStateInitial,
        data,
      );
      expect(result.in[ItemId.HeavyOil]).toBeUndefined();
      expect(result.out[ItemId.HeavyOil]).toBeUndefined();
    });

    it('should calculate machine speed based on belt speed if undefined', () => {
      const data = Mocks.getRawDataset();
      data.machineEntities[ItemId.AssemblingMachine2].speed = undefined;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        ItemId.Module,
        Rational.zero,
        Rational.zero,
        false,
        Mocks.RecipesStateRational[RecipeId.SteelChest],
        Mocks.ItemsStateInitial,
        data,
      );
      const expected = new RecipeRational(
        Mocks.RawDataset.recipeEntities[RecipeId.SteelChest],
      );
      expected.out = { [ItemId.SteelChest]: Rational.one };
      expected.time = Rational.from([1, 30]);
      expected.drain = Rational.from(5);
      expected.consumption = Rational.from(150);
      expected.pollution = Rational.from([1, 20]);
      expected.productivity = Rational.one;
      expect(result).toEqual(expected);
    });
  });

  describe('adjustLaunchRecipeObjective', () => {
    it('should skip non-launch objectives', () => {
      const recipe = new RecipeRational(
        Mocks.Dataset.recipeEntities[RecipeId.IronPlate],
      );
      const time = recipe.time;

      // No recipe part
      RecipeUtility.adjustLaunchRecipeObjective(
        recipe,
        Mocks.RecipesStateRationalInitial,
        Mocks.Dataset,
      );
      expect(recipe.time).toEqual(time);

      // No silo
      recipe.part = ItemId.IronPlate;
      RecipeUtility.adjustLaunchRecipeObjective(
        recipe,
        Mocks.RecipesStateRationalInitial,
        Mocks.Dataset,
      );
      expect(recipe.time).toEqual(time);

      // No machine id
      const settings = Mocks.getRecipesStateRational();
      delete settings[RecipeId.IronPlate].machineId;
      RecipeUtility.adjustLaunchRecipeObjective(
        recipe,
        settings,
        Mocks.Dataset,
      );
      expect(recipe.time).toEqual(time);
    });

    it('should adjust a launch objective based on rocket part recipe', () => {
      const objective: Objective = {
        id: '0',
        targetId: RecipeId.SpaceSciencePack,
        value: '1',
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      };
      const recipe = RecipeUtility.adjustRecipe(
        objective.targetId,
        ItemId.Module,
        Rational.zero,
        Rational.one,
        false,
        new RecipeSettingsRational(objective),
        Mocks.ItemsStateInitial,
        Mocks.Dataset,
      );
      RecipeUtility.adjustLaunchRecipeObjective(
        recipe,
        Mocks.RecipesStateRationalInitial,
        Mocks.Dataset,
      );
      expect(recipe.time).toEqual(Rational.from([82499, 924]));
    });
  });

  describe('adjustSiloRecipes', () => {
    let recipeR: Entities<RecipeRational>;

    beforeEach(() => {
      recipeR = Mocks.Dataset.recipeIds.reduce(
        (e: Entities<RecipeRational>, i) => {
          e[i] = RecipeUtility.adjustRecipe(
            i,
            ItemId.Module,
            Rational.zero,
            Rational.one,
            false,
            Mocks.RecipesStateRationalInitial[i],
            Mocks.ItemsStateInitial,
            Mocks.RawDataset,
          );
          return e;
        },
        {},
      );
    });

    it('should adjust recipes', () => {
      const result = RecipeUtility.adjustSiloRecipes(
        recipeR,
        Mocks.RecipesStateRationalInitial,
        Mocks.Dataset,
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        Rational.from([82499, 924]),
      );
      expect(result[RecipeId.RocketPart].time).toEqual(
        Rational.from([82499, 66000]),
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
        Mocks.Dataset,
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        Rational.from([203, 5]),
      );
      expect(result[RecipeId.RocketPart].time).toEqual(
        Rational.from([82499, 66000]),
      );
    });

    it('should handle missing machine id', () => {
      const settings2 = {
        ...Mocks.RecipesStateRationalInitial,
        ...{
          [RecipeId.SpaceSciencePack]: {
            machineId: '',
          },
        },
      };
      const result = RecipeUtility.adjustSiloRecipes(
        recipeR,
        settings2,
        Mocks.Dataset,
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        Rational.from([203, 5]),
      );
      expect(result[RecipeId.RocketPart].time).toEqual(
        Rational.from([82499, 66000]),
      );
    });
  });

  describe('allowsModules', () => {
    it('should check machine and rocket recipes', () => {
      // Silo recipes
      expect(
        RecipeUtility.allowsModules(
          Mocks.RawDataset.recipeEntities[RecipeId.RocketPart],
          Mocks.RawDataset.machineEntities[ItemId.RocketSilo],
        ),
      ).toBeTrue();
      expect(
        RecipeUtility.allowsModules(
          Mocks.RawDataset.recipeEntities[RecipeId.SpaceSciencePack],
          Mocks.RawDataset.machineEntities[ItemId.RocketSilo],
        ),
      ).toBeFalse();
      // Normal recipes
      expect(
        RecipeUtility.allowsModules(
          Mocks.RawDataset.recipeEntities[ItemId.Coal],
          Mocks.RawDataset.machineEntities[ItemId.ElectricMiningDrill],
        ),
      ).toBeTrue();
      expect(
        RecipeUtility.allowsModules(
          Mocks.RawDataset.recipeEntities[ItemId.Coal],
          Mocks.RawDataset.machineEntities[ItemId.BurnerMiningDrill],
        ),
      ).toBeFalse();
    });
  });

  describe('adjustDataset', () => {
    it('should adjust recipes and silo recipes', () => {
      spyOn(RecipeUtility, 'adjustSiloRecipes').and.callThrough();
      spyOn(RecipeUtility, 'adjustRecipe').and.callThrough();
      const result = RecipeUtility.adjustDataset(
        Mocks.RawDataset.recipeIds,
        [],
        Mocks.RecipesStateRationalInitial,
        Mocks.ItemsStateInitial,
        ItemId.Module,
        Rational.zero,
        Rational.one,
        false,
        Mocks.CostRational,
        Mocks.RawDataset,
      );
      expect(result).toBeTruthy();
      expect(RecipeUtility.adjustSiloRecipes).toHaveBeenCalledTimes(1);
      expect(RecipeUtility.adjustRecipe).toHaveBeenCalledTimes(
        Mocks.RawDataset.recipeIds.length,
      );
    });
  });

  describe('adjustCost', () => {
    let recipeR: Entities<RecipeRational>;

    beforeEach(() => {
      recipeR = RecipeUtility.adjustRecipes(
        Mocks.RawDataset.recipeIds,
        Mocks.RecipesStateRationalInitial,
        Mocks.ItemsStateInitial,
        ItemId.Module,
        Rational.zero,
        Rational.one,
        false,
        Mocks.RawDataset,
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
        Mocks.RawDataset.recipeIds,
        recipeR,
        recipeSettings,
        Mocks.CostRational,
        Mocks.RawDataset,
      );
      expect(recipeR[RecipeId.Coal].cost).toEqual(Rational.two);
    });

    it('should apply normal recipe and machine costs', () => {
      RecipeUtility.adjustCost(
        Mocks.RawDataset.recipeIds,
        recipeR,
        Mocks.RecipesStateRationalInitial,
        Mocks.CostRational,
        Mocks.RawDataset,
      );
      expect(recipeR[RecipeId.Coal].cost).toEqual(Rational.from([1183, 4]));
      expect(recipeR[RecipeId.CopperCable].cost).toEqual(Rational.from(9));
    });
  });

  describe('adjustObjective', () => {
    it('should return an item objective unaltered', () => {
      expect(
        RecipeUtility.adjustObjective(
          Mocks.Objective1,
          Mocks.MachinesStateInitial,
          Mocks.RawDataset,
        ),
      ).toEqual(Mocks.Objective1);
    });

    it('should adjust a recipe objective based on settings', () => {
      const result = RecipeUtility.adjustObjective(
        {
          id: '1',
          targetId: RecipeId.IronPlate,
          value: '1',
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
        },
        Mocks.MachinesStateInitial,
        Mocks.RawDataset,
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
      const result = RecipeUtility.adjustObjective(
        {
          id: '1',
          targetId: RecipeId.IronPlate,
          value: '1',
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
        },
        machines,
        Mocks.RawDataset,
      );
      expect(result.machineId).toEqual(ItemId.StoneFurnace);
    });

    it('should handle nullish values', () => {
      spyOn(RecipeUtility, 'allowsModules').and.returnValue(true);
      const data = Mocks.getRawDataset();
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
      const result = RecipeUtility.adjustObjective(
        {
          id: '1',
          targetId: RecipeId.IronPlate,
          value: '1',
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          beacons: [{ id: ItemId.Beacon }],
        },
        machines,
        data,
      );
      expect(result.machineId).toEqual(ItemId.StoneFurnace);
      expect(result.machineModuleIds).toEqual([]);
      expect(result.beacons?.[0].moduleIds).toEqual([
        ItemId.Module,
        ItemId.Module,
      ]);
    });

    it('should use the correct fuel for a burn recipe objective', () => {
      const result = RecipeUtility.adjustObjective(
        {
          id: '1',
          targetId: RecipeId.UsedUpUraniumFuelCell,
          value: '1',
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          fuelId: ItemId.Coal,
        },
        Mocks.MachinesStateInitial,
        Mocks.RawDataset,
      );
      expect(result.fuelId).toEqual(ItemId.UraniumFuelCell);
    });
  });
});
