import { ItemId, Mocks, RecipeId } from 'src/tests';
import { spread } from '~/helpers';
import {
  AdjustedRecipe,
  Entities,
  Game,
  Objective,
  ObjectiveType,
  ObjectiveUnit,
  Rational,
  Recipe,
  RecipeSettings,
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
      const result = RecipeUtility.fuelOptions(
        {} as any,
        Mocks.AdjustedDataset,
      );
      expect(result).toEqual([]);
    });

    it('should handle entity that specifies a fuel', () => {
      const result = RecipeUtility.fuelOptions(
        { fuel: ItemId.Coal } as any,
        Mocks.AdjustedDataset,
      );
      expect(result).toEqual([{ value: ItemId.Coal, label: 'Coal' }]);
    });
  });

  describe('defaultModules', () => {
    it('should fill in modules list for machine', () => {
      const result = RecipeUtility.defaultModules(
        [{ value: ItemId.SpeedModule }],
        [ItemId.ProductivityModule, ItemId.SpeedModule],
        Rational.one,
      );
      expect(result).toEqual([ItemId.SpeedModule]);
    });
  });

  describe('adjustRecipe', () => {
    it('should adjust a standard recipe', () => {
      const settings = { ...Mocks.RecipesState[RecipeId.SteelChest] };
      settings.moduleIds = undefined;
      settings.beacons = [{ moduleIds: [ItemId.SpeedModule] }];
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        Mocks.AdjustmentData,
        settings,
        Mocks.ItemsStateInitial,
        Mocks.AdjustedDataset,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.AdjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: Rational.one },
          time: Rational.from(2, 3),
          drain: Rational.from(5),
          consumption: Rational.from(150),
          pollution: Rational.from(1, 20),
          productivity: Rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should handle recipes with declared outputs', () => {
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CopperCable,
        Mocks.AdjustmentData,
        Mocks.RecipesState[RecipeId.CopperCable],
        Mocks.ItemsStateInitial,
        Mocks.AdjustedDataset,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.AdjustedDataset.recipeEntities[RecipeId.CopperCable],
        ...{
          time: Rational.from(2, 3),
          drain: Rational.from(5),
          consumption: Rational.from(150),
          pollution: Rational.from(1, 20),
          productivity: Rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should handle research factor', () => {
      const settings = {
        ...Mocks.RecipesState[RecipeId.MiningProductivity],
      };
      settings.machineId = ItemId.Lab;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.MiningProductivity,
        {
          ...Mocks.AdjustmentData,
          ...{ researchBonus: Rational.two },
        },
        settings,
        Mocks.ItemsStateInitial,
        Mocks.AdjustedDataset,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.AdjustedDataset.recipeEntities[RecipeId.MiningProductivity],
        ...{
          out: { [ItemId.MiningProductivity]: Rational.one },
          time: Rational.from(30),
          drain: undefined,
          consumption: Rational.from(60),
          pollution: Rational.zero,
          productivity: Rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should handle mining productivity', () => {
      const settings = { ...Mocks.RecipesState[RecipeId.IronOre] };
      settings.machineId = ItemId.ElectricMiningDrill;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.IronOre,
        {
          ...Mocks.AdjustmentData,
          ...{ miningBonus: Rational.two },
        },
        settings,
        Mocks.ItemsStateInitial,
        Mocks.AdjustedDataset,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.AdjustedDataset.recipeEntities[RecipeId.IronOre],
        ...{
          out: { [ItemId.IronOre]: new Rational(3n) },
          time: new Rational(2n),
          drain: undefined,
          consumption: new Rational(90n),
          pollution: new Rational(1n, 6n),
          productivity: new Rational(3n),
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should handle modules and beacons', () => {
      const settings = { ...Mocks.RecipesState[RecipeId.SteelChest] };
      settings.moduleIds = [
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
        ...Mocks.AdjustedDataset,
        ...{
          moduleEntities: {
            ...Mocks.AdjustedDataset.moduleEntities,
            ...{
              // To verify all factors work in beacons
              [ItemId.SpeedModule]: {
                ...Mocks.AdjustedDataset.moduleEntities[ItemId.SpeedModule],
                ...{ productivity: Rational.one, pollution: Rational.one },
              },
              // To verify null consumption works
              [ItemId.ProductivityModule]: {
                ...Mocks.AdjustedDataset.moduleEntities[
                  ItemId.ProductivityModule
                ],
                ...{ consumption: undefined },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        Mocks.AdjustmentData,
        settings,
        Mocks.ItemsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.AdjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: new Rational(76n, 25n) },
          time: new Rational(40n, 81n),
          drain: new Rational(5n),
          consumption: new Rational(255n),
          pollution: new Rational(1037n, 4000n),
          productivity: new Rational(76n, 25n),
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should use minimum 20% effects', () => {
      const settings = { ...Mocks.RecipesState[RecipeId.SteelChest] };
      settings.moduleIds = [
        ItemId.EfficiencyModule3,
        ItemId.EfficiencyModule3,
        ItemId.EfficiencyModule3,
      ];
      // Set up efficiency module 3 to cause more than maximum effect in speed, consumption, and pollution
      const data = {
        ...Mocks.AdjustedDataset,
        ...{
          moduleEntities: {
            ...Mocks.AdjustedDataset.moduleEntities,
            ...{
              [ItemId.EfficiencyModule3]: {
                ...Mocks.AdjustedDataset.moduleEntities[
                  ItemId.EfficiencyModule3
                ],
                ...{
                  speed:
                    Mocks.AdjustedDataset.moduleEntities[
                      ItemId.EfficiencyModule3
                    ].consumption,
                  pollution:
                    Mocks.AdjustedDataset.moduleEntities[
                      ItemId.EfficiencyModule3
                    ].consumption,
                },
              },
            },
          },
        },
      };
      settings.beacons = [{ count: Rational.zero, moduleIds: [ItemId.Module] }];
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        Mocks.AdjustmentData,
        settings,
        Mocks.ItemsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.AdjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: Rational.one },
          time: new Rational(10n, 3n),
          drain: new Rational(5n),
          consumption: new Rational(30n),
          pollution: new Rational(1n, 500n),
          productivity: Rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should use minimum 1/60 second time in Factorio', () => {
      const data = Mocks.getAdjustedDataset();
      data.recipeEntities[RecipeId.SteelChest] = {
        ...data.recipeEntities[RecipeId.SteelChest],
        ...{ time: new Rational(1n, 10000n) },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        Mocks.AdjustmentData,
        Mocks.RecipesStateInitial[RecipeId.SteelChest],
        Mocks.ItemsStateInitial,
        data,
      );
      expect(result.time).toEqual(Rational.from(1, 60));
    });

    it('should find matching nonchemical fuel', () => {
      const result = RecipeUtility.adjustRecipe(
        RecipeId.UsedUpUraniumFuelCell,
        Mocks.AdjustmentData,
        Mocks.RecipesStateInitial[RecipeId.UsedUpUraniumFuelCell],
        Mocks.ItemsStateInitial,
        Mocks.AdjustedDataset,
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(Rational.from(1, 200));
    });

    it('should find non-matching nonchemical fuel', () => {
      const data = {
        ...Mocks.AdjustedDataset,
        ...{
          recipeEntities: {
            ...Mocks.AdjustedDataset.recipeEntities,
            ...{
              [RecipeId.UsedUpUraniumFuelCell]: {
                ...Mocks.AdjustedDataset.recipeEntities[
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
        Mocks.AdjustmentData,
        Mocks.RecipesStateInitial[RecipeId.UsedUpUraniumFuelCell],
        Mocks.ItemsStateInitial,
        data,
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(Rational.from(1, 200));
    });

    it('should adjust based on overclock', () => {
      const settings = { ...Mocks.RecipesState[RecipeId.SteelChest] };
      settings.overclock = Rational.from(200);
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        Mocks.AdjustmentData,
        settings,
        Mocks.ItemsStateInitial,
        Mocks.AdjustedDataset,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.AdjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: Rational.one },
          time: new Rational(1n, 3n),
          drain: new Rational(5n),
          consumption: new Rational(136838616n, 364903n),
          pollution: new Rational(1n, 20n),
          productivity: Rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should adjust a power producer based on overclock', () => {
      const settings = { ...Mocks.RecipesState[RecipeId.SteelChest] };
      settings.overclock = Rational.from(200);
      const data = Mocks.getDataset();
      data.machineEntities[ItemId.AssemblingMachine2].usage =
        Rational.from(-10);
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        Mocks.AdjustmentData,
        settings,
        Mocks.ItemsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.AdjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: Rational.one },
          time: new Rational(1n, 3n),
          drain: new Rational(5n),
          consumption: new Rational(-20n),
          pollution: new Rational(1n, 20n),
          productivity: Rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should use a recipe specific usage', () => {
      const settings = { ...Mocks.RecipesState[RecipeId.SteelChest] };
      const data = {
        ...Mocks.Dataset,
        ...{
          recipeEntities: {
            ...Mocks.Dataset.recipeEntities,
            ...{
              [RecipeId.SteelChest]: {
                ...Mocks.Dataset.recipeEntities[RecipeId.SteelChest],
                ...{
                  usage: new Rational(10000n),
                },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        Mocks.AdjustmentData,
        settings,
        Mocks.ItemsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.AdjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: Rational.one },
          time: new Rational(2n, 3n),
          drain: new Rational(5n),
          consumption: new Rational(10000n),
          pollution: new Rational(1n, 20n),
          productivity: Rational.one,
          usage: new Rational(10000n),
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should calculate proliferator usage', () => {
      const settings: RecipeSettings = spread(
        Mocks.RecipesStateInitial[ItemId.SteelChest],
        { moduleIds: [ItemId.ProductivityModule3] },
      );
      const recipe = {
        ...Mocks.Dataset.recipeEntities[RecipeId.SteelChest],
        ...{
          in: {
            ...Mocks.Dataset.recipeEntities[RecipeId.SteelChest].in,
            ...{ [ItemId.ProductivityModule]: Rational.one },
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
        {
          ...Mocks.AdjustmentData,
          ...{ proliferatorSprayId: ItemId.ProductivityModule },
        },
        settings,
        Mocks.ItemsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = {
        ...recipe,
        ...{
          in: {
            [ItemId.SteelPlate]: new Rational(8n),
            [ItemId.ProductivityModule]: new Rational(11n, 10n),
            [ItemId.ProductivityModule3]: new Rational(9n, 10n),
          },
          out: { [ItemId.SteelChest]: new Rational(11n, 10n) },
          time: new Rational(8n, 97n),
          drain: new Rational(25n, 2n),
          consumption: new Rational(2775n),
          pollution: new Rational(407n, 1500n),
          productivity: new Rational(11n, 10n),
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should add machine consumption', () => {
      const data = Mocks.getDataset();
      data.machineEntities[ItemId.AssemblingMachine2].consumption = {
        [ItemId.Coal]: Rational.one,
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CopperCable,
        Mocks.AdjustmentData,
        Mocks.RecipesState[RecipeId.CopperCable],
        Mocks.ItemsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.Dataset.recipeEntities[RecipeId.CopperCable],
        ...{
          in: {
            [ItemId.CopperPlate]: Rational.one,
            [ItemId.Coal]: new Rational(1n, 90n),
          },
          time: new Rational(2n, 3n),
          drain: new Rational(5n),
          consumption: new Rational(150n),
          pollution: new Rational(1n, 20n),
          productivity: Rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should reduce net production to output only', () => {
      const data = Mocks.getDataset();
      data.recipeEntities[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] =
        Rational.one;
      data.recipeEntities[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] =
        Rational.two;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CoalLiquefaction,
        {
          ...Mocks.AdjustmentData,
          ...{ netProductionOnly: true },
        },
        Mocks.RecipesState[RecipeId.CoalLiquefaction],
        Mocks.ItemsStateInitial,
        data,
      );
      expect(result.in[ItemId.HeavyOil]).toBeUndefined();
      expect(result.out[ItemId.HeavyOil]).toEqual(Rational.one);
    });

    it('should reduce net production to input only', () => {
      const data = Mocks.getDataset();
      data.recipeEntities[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] =
        Rational.two;
      data.recipeEntities[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] =
        Rational.one;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CoalLiquefaction,
        {
          ...Mocks.AdjustmentData,
          ...{ netProductionOnly: true },
        },
        Mocks.RecipesState[RecipeId.CoalLiquefaction],
        Mocks.ItemsStateInitial,
        data,
      );
      expect(result.in[ItemId.HeavyOil]).toEqual(Rational.one);
      expect(result.out[ItemId.HeavyOil]).toBeUndefined();
    });

    it('should reduce net production to no input/output', () => {
      const data = Mocks.getDataset();
      data.recipeEntities[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] =
        Rational.one;
      data.recipeEntities[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] =
        Rational.one;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CoalLiquefaction,
        {
          ...Mocks.AdjustmentData,
          ...{ netProductionOnly: true },
        },
        Mocks.RecipesState[RecipeId.CoalLiquefaction],
        Mocks.ItemsStateInitial,
        data,
      );
      expect(result.in[ItemId.HeavyOil]).toBeUndefined();
      expect(result.out[ItemId.HeavyOil]).toBeUndefined();
    });

    it('should calculate machine speed based on belt speed if undefined', () => {
      const data = Mocks.getDataset();
      data.machineEntities[ItemId.AssemblingMachine2].speed = undefined;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        Mocks.AdjustmentData,
        Mocks.RecipesState[RecipeId.SteelChest],
        Mocks.ItemsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.AdjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: Rational.one },
          time: new Rational(1n, 30n),
          drain: new Rational(5n),
          consumption: new Rational(150n),
          pollution: new Rational(1n, 20n),
          productivity: Rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should adjust based on number of Final Factory duplicators', () => {
      const data = Mocks.getDataset();
      data.game = Game.FinalFactory;
      const settings = {
        ...Mocks.RecipesState[RecipeId.SteelChest],
        ...{ overclock: undefined },
      };

      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        Mocks.AdjustmentData,
        settings,
        Mocks.ItemsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.AdjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: Rational.one },
          time: new Rational(2n, 3n),
          drain: new Rational(5n),
          consumption: new Rational(150n),
          pollution: new Rational(1n, 20n),
          productivity: Rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });
  });

  describe('adjustLaunchRecipeObjective', () => {
    it('should skip non-launch objectives', () => {
      const recipe = { ...Mocks.Dataset.recipeEntities[RecipeId.IronPlate] };
      const time = recipe.time;

      // No recipe part
      RecipeUtility.adjustLaunchRecipeObjective(
        recipe,
        Mocks.RecipesStateInitial,
        Mocks.AdjustedDataset,
      );
      expect(recipe.time).toEqual(time);

      // No silo
      recipe.part = ItemId.IronPlate;
      RecipeUtility.adjustLaunchRecipeObjective(
        recipe,
        Mocks.RecipesStateInitial,
        Mocks.AdjustedDataset,
      );
      expect(recipe.time).toEqual(time);

      // No machine id
      const settings = Mocks.getRecipesState();
      delete settings[RecipeId.IronPlate].machineId;
      RecipeUtility.adjustLaunchRecipeObjective(
        recipe,
        settings,
        Mocks.AdjustedDataset,
      );
      expect(recipe.time).toEqual(time);
    });

    it('should adjust a launch objective based on rocket part recipe', () => {
      const objective: Objective = {
        id: '0',
        targetId: RecipeId.SpaceSciencePack,
        value: Rational.one,
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      };
      const recipe = RecipeUtility.adjustRecipe(
        objective.targetId,
        Mocks.AdjustmentData,
        objective,
        Mocks.ItemsStateInitial,
        Mocks.Dataset,
      );
      RecipeUtility.adjustLaunchRecipeObjective(
        recipe,
        Mocks.RecipesStateInitial,
        Mocks.AdjustedDataset,
      );
      expect(recipe.time).toEqual(new Rational(82499n, 924n));
    });
  });

  describe('adjustSiloRecipes', () => {
    let adjustedRecipe: Entities<AdjustedRecipe>;

    beforeEach(() => {
      adjustedRecipe = Mocks.Dataset.recipeIds.reduce(
        (e: Entities<AdjustedRecipe>, i) => {
          e[i] = RecipeUtility.adjustRecipe(
            i,
            Mocks.AdjustmentData,
            Mocks.RecipesStateInitial[i],
            Mocks.ItemsStateInitial,
            Mocks.Dataset,
          );
          return e;
        },
        {},
      );
    });

    it('should adjust recipes', () => {
      const result = RecipeUtility.adjustSiloRecipes(
        adjustedRecipe,
        Mocks.RecipesStateInitial,
        Mocks.Dataset,
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        Rational.from(82499, 924),
      );
      expect(result[RecipeId.RocketPart].time).toEqual(
        Rational.from(82499, 66000),
      );
    });

    it('should handle invalid machine', () => {
      const settings2 = {
        ...Mocks.RecipesStateInitial,
        ...{
          [RecipeId.SpaceSciencePack]: {
            machineId: 'id',
          },
        },
      };
      const result = RecipeUtility.adjustSiloRecipes(
        adjustedRecipe,
        settings2,
        Mocks.Dataset,
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        Rational.from(203, 5),
      );
      expect(result[RecipeId.RocketPart].time).toEqual(
        Rational.from(82499, 66000),
      );
    });

    it('should handle missing machine id', () => {
      const settings2 = {
        ...Mocks.RecipesStateInitial,
        ...{
          [RecipeId.SpaceSciencePack]: {
            machineId: '',
          },
        },
      };
      const result = RecipeUtility.adjustSiloRecipes(
        adjustedRecipe,
        settings2,
        Mocks.Dataset,
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        Rational.from(203, 5),
      );
      expect(result[RecipeId.RocketPart].time).toEqual(
        Rational.from(82499, 66000),
      );
    });
  });

  describe('allowsModules', () => {
    it('should check machine and rocket recipes', () => {
      // Silo recipes
      expect(
        RecipeUtility.allowsModules(
          Mocks.AdjustedDataset.recipeEntities[RecipeId.RocketPart],
          Mocks.AdjustedDataset.machineEntities[ItemId.RocketSilo],
        ),
      ).toBeTrue();
      expect(
        RecipeUtility.allowsModules(
          Mocks.AdjustedDataset.recipeEntities[RecipeId.SpaceSciencePack],
          Mocks.AdjustedDataset.machineEntities[ItemId.RocketSilo],
        ),
      ).toBeFalse();
      // Normal recipes
      expect(
        RecipeUtility.allowsModules(
          Mocks.AdjustedDataset.recipeEntities[ItemId.Coal],
          Mocks.AdjustedDataset.machineEntities[ItemId.ElectricMiningDrill],
        ),
      ).toBeTrue();
      expect(
        RecipeUtility.allowsModules(
          Mocks.AdjustedDataset.recipeEntities[ItemId.Coal],
          Mocks.AdjustedDataset.machineEntities[ItemId.BurnerMiningDrill],
        ),
      ).toBeFalse();
    });
  });

  describe('adjustDataset', () => {
    it('should adjust recipes and silo recipes', () => {
      spyOn(RecipeUtility, 'adjustSiloRecipes').and.callThrough();
      spyOn(RecipeUtility, 'adjustRecipe').and.callThrough();
      const result = RecipeUtility.adjustDataset(
        Mocks.AdjustedDataset.recipeIds,
        [],
        Mocks.RecipesStateInitial,
        Mocks.ItemsStateInitial,
        Mocks.AdjustmentData,
        Mocks.Costs,
        Mocks.AdjustedDataset,
      );
      expect(result).toBeTruthy();
      expect(RecipeUtility.adjustSiloRecipes).toHaveBeenCalledTimes(1);
      expect(RecipeUtility.adjustRecipe).toHaveBeenCalledTimes(
        Mocks.AdjustedDataset.recipeIds.length,
      );
    });
  });

  describe('adjustCost', () => {
    let recipeR: Entities<Recipe>;

    beforeEach(() => {
      recipeR = RecipeUtility.adjustRecipes(
        Mocks.AdjustedDataset.recipeIds,
        Mocks.RecipesStateInitial,
        Mocks.ItemsStateInitial,
        Mocks.AdjustmentData,
        Mocks.AdjustedDataset,
      );
    });

    it('should apply an overridden cost', () => {
      const recipeSettings = {
        ...Mocks.RecipesStateInitial,
        ...{
          [RecipeId.Coal]: {
            ...Mocks.RecipesStateInitial[RecipeId.Coal],
            ...{ cost: Rational.two },
          },
        },
      };
      RecipeUtility.adjustCost(
        Mocks.AdjustedDataset.recipeIds,
        recipeR,
        recipeSettings,
        Mocks.Costs,
        Mocks.AdjustedDataset,
      );
      expect(recipeR[RecipeId.Coal].cost).toEqual(Rational.two);
    });

    it('should apply normal recipe and machine costs', () => {
      RecipeUtility.adjustCost(
        Mocks.AdjustedDataset.recipeIds,
        recipeR,
        Mocks.RecipesStateInitial,
        Mocks.Costs,
        Mocks.AdjustedDataset,
      );
      expect(recipeR[RecipeId.Coal].cost).toEqual(Rational.from(1183, 4));
      expect(recipeR[RecipeId.CopperCable].cost).toEqual(Rational.from(9));
    });
  });

  describe('adjustObjective', () => {
    it('should return an item objective unaltered', () => {
      expect(
        RecipeUtility.adjustObjective(
          Mocks.Objective1,
          Mocks.ItemsStateInitial,
          Mocks.RecipesStateInitial,
          Mocks.MachinesStateInitial,
          Mocks.AdjustmentData,
          Mocks.AdjustedDataset,
        ),
      ).toEqual(Mocks.Objective1);
    });

    it('should adjust a recipe objective based on settings', () => {
      const result = RecipeUtility.adjustObjective(
        {
          id: '1',
          targetId: RecipeId.IronPlate,
          value: Rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
        },
        Mocks.ItemsStateInitial,
        Mocks.RecipesStateInitial,
        Mocks.MachinesStateInitial,
        Mocks.AdjustmentData,
        Mocks.AdjustedDataset,
      );
      expect(result.machineId).toEqual(ItemId.ElectricFurnace);
      expect(result.moduleOptions?.length).toEqual(10);
      expect(result.moduleIds).toEqual([
        ItemId.ProductivityModule3,
        ItemId.ProductivityModule3,
      ]);
      expect(result.beacons?.[0].count).toEqual(new Rational(8n));
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
          value: Rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
        },
        Mocks.ItemsStateInitial,
        Mocks.RecipesStateInitial,
        machines,
        Mocks.AdjustmentData,
        Mocks.AdjustedDataset,
      );
      expect(result.machineId).toEqual(ItemId.StoneFurnace);
    });

    it('should handle nullish values', () => {
      spyOn(RecipeUtility, 'allowsModules').and.returnValue(true);
      const data = Mocks.getAdjustedDataset();
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
          value: Rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          beacons: [{ id: ItemId.Beacon }],
        },
        Mocks.ItemsStateInitial,
        Mocks.RecipesStateInitial,
        machines,
        Mocks.AdjustmentData,
        data,
      );
      expect(result.machineId).toEqual(ItemId.StoneFurnace);
      expect(result.moduleIds).toEqual([]);
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
          value: Rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          fuelId: ItemId.Coal,
        },
        Mocks.ItemsStateInitial,
        Mocks.RecipesStateInitial,
        Mocks.MachinesStateInitial,
        Mocks.AdjustmentData,
        Mocks.AdjustedDataset,
      );
      expect(result.fuelId).toEqual(ItemId.UraniumFuelCell);
    });
  });
});
