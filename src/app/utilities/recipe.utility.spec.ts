import { spread } from '~/helpers';
import { AdjustedRecipe, Recipe } from '~/models/data/recipe';
import { Entities } from '~/models/entities';
import { Game } from '~/models/enum/game';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { Objective } from '~/models/objective';
import { rational } from '~/models/rational';
import { ModuleSettings } from '~/models/settings/module-settings';
import { ItemId, Mocks, RecipeId } from '~/tests';

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
        Mocks.adjustedDataset,
      );
      expect(result).toEqual([]);
    });

    it('should handle entity that specifies a fuel', () => {
      const result = RecipeUtility.fuelOptions(
        { fuel: ItemId.Coal } as any,
        Mocks.adjustedDataset,
      );
      expect(result).toEqual([{ value: ItemId.Coal, label: 'Coal' }]);
    });
  });

  describe('moduleOptions', () => {
    it('should filter disallowed effects', () => {
      const result = RecipeUtility.moduleOptions(
        spread(Mocks.dataset.beaconEntities[ItemId.Beacon], {
          disallowedEffects: ['speed', 'consumption'],
        }),
        Mocks.dataset,
      );
      expect(result).toHaveSize(1);
    });

    it('should disallow empty module in Satisfactory mining', () => {
      const result = RecipeUtility.moduleOptions(
        Mocks.dataset.machineEntities[ItemId.AssemblingMachine3],
        spread(Mocks.dataset, { game: Game.Satisfactory }),
        RecipeId.Coal,
      );
      expect(result).toHaveSize(6);
    });
  });

  describe('defaultModules', () => {
    it('should fill in modules list for machine', () => {
      const result = RecipeUtility.defaultModules(
        [{ value: ItemId.SpeedModule }],
        [ItemId.ProductivityModule, ItemId.SpeedModule],
        rational.one,
      );
      expect(result).toEqual([{ count: rational.one, id: ItemId.SpeedModule }]);
    });

    it('should handle unlimited modules', () => {
      const result = RecipeUtility.defaultModules(
        [{ value: ItemId.SpeedModule }],
        [ItemId.ProductivityModule, ItemId.SpeedModule],
        true,
      );
      expect(result).toEqual([
        { count: rational.zero, id: ItemId.SpeedModule },
      ]);
    });
  });

  describe('adjustRecipe', () => {
    it('should adjust a standard recipe', () => {
      const settings = { ...Mocks.recipesState[RecipeId.SteelChest] };
      settings.modules = undefined;
      settings.beacons = [
        {
          count: rational.zero,
          id: ItemId.Beacon,
          modules: [{ count: rational.one, id: ItemId.SpeedModule }],
        },
      ];
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.adjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(2n, 3n),
          drain: rational(5n),
          consumption: rational(150n),
          pollution: rational(1n, 20n),
          productivity: rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should handle recipes with declared outputs', () => {
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CopperCable,
        Mocks.recipesState[RecipeId.CopperCable],
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.adjustedDataset.recipeEntities[RecipeId.CopperCable],
        ...{
          time: rational(2n, 3n),
          drain: rational(5n),
          consumption: rational(150n),
          pollution: rational(1n, 20n),
          productivity: rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should handle research factor', () => {
      const settings = {
        ...Mocks.recipesState[RecipeId.MiningProductivity],
      };
      settings.machineId = ItemId.Lab;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.MiningProductivity,
        settings,
        Mocks.itemsStateInitial,
        spread(Mocks.settingsStateInitial, { researchBonus: rational(100n) }),
        Mocks.adjustedDataset,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.adjustedDataset.recipeEntities[RecipeId.MiningProductivity],
        ...{
          out: { [ItemId.MiningProductivity]: rational.one },
          time: rational(30n),
          drain: undefined,
          consumption: rational(60n),
          pollution: rational.zero,
          productivity: rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should handle mining productivity', () => {
      const settings = { ...Mocks.recipesState[RecipeId.IronOre] };
      settings.machineId = ItemId.ElectricMiningDrill;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.IronOre,
        settings,
        Mocks.itemsStateInitial,
        spread(Mocks.settingsStateInitial, { miningBonus: rational(200n) }),
        Mocks.adjustedDataset,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.adjustedDataset.recipeEntities[RecipeId.IronOre],
        ...{
          out: { [ItemId.IronOre]: rational(3n) },
          time: rational(2n),
          drain: undefined,
          consumption: rational(90n),
          pollution: rational(1n, 6n),
          productivity: rational(3n),
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should handle modules and beacons', () => {
      const settings = { ...Mocks.recipesState[RecipeId.SteelChest] };
      settings.modules = [
        { count: rational.one, id: ItemId.SpeedModule },
        { count: rational.one, id: ItemId.ProductivityModule },
        { count: rational.one, id: ItemId.EfficiencyModule },
        { id: ItemId.Module },
      ];
      settings.beacons = [
        {
          id: ItemId.Beacon,
          count: rational.one,
          modules: [
            { count: rational(2n), id: ItemId.SpeedModule },
            { id: ItemId.Module },
          ],
        },
      ];
      const data = {
        ...Mocks.adjustedDataset,
        ...{
          moduleEntities: {
            ...Mocks.adjustedDataset.moduleEntities,
            ...{
              // To verify all factors work in beacons
              [ItemId.SpeedModule]: {
                ...Mocks.adjustedDataset.moduleEntities[ItemId.SpeedModule],
                ...{ productivity: rational.one, pollution: rational.one },
              },
              // To verify null consumption works
              [ItemId.ProductivityModule]: {
                ...Mocks.adjustedDataset.moduleEntities[
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
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.adjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: rational(76n, 25n) },
          time: rational(40n, 81n),
          drain: rational(5n),
          consumption: rational(255n),
          pollution: rational(1037n, 4000n),
          productivity: rational(76n, 25n),
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should use minimum 20% effects', () => {
      const settings = { ...Mocks.recipesState[RecipeId.SteelChest] };
      settings.modules = [
        { count: rational(3n), id: ItemId.EfficiencyModule3 },
      ];
      // Set up efficiency module 3 to cause more than maximum effect in speed, consumption, and pollution
      const data = {
        ...Mocks.adjustedDataset,
        ...{
          moduleEntities: {
            ...Mocks.adjustedDataset.moduleEntities,
            ...{
              [ItemId.EfficiencyModule3]: {
                ...Mocks.adjustedDataset.moduleEntities[
                  ItemId.EfficiencyModule3
                ],
                ...{
                  speed:
                    Mocks.adjustedDataset.moduleEntities[
                      ItemId.EfficiencyModule3
                    ].consumption,
                  pollution:
                    Mocks.adjustedDataset.moduleEntities[
                      ItemId.EfficiencyModule3
                    ].consumption,
                },
              },
            },
          },
        },
      };
      settings.beacons = [
        {
          count: rational.zero,
          id: ItemId.Beacon,
          modules: [{ count: rational(2n), id: ItemId.Module }],
        },
      ];
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.adjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(10n, 3n),
          drain: rational(5n),
          consumption: rational(30n),
          pollution: rational(1n, 500n),
          productivity: rational.one,
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
        ...{ time: rational(1n, 10000n) },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        Mocks.recipesStateInitial[RecipeId.SteelChest],
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      expect(result.time).toEqual(rational(1n, 60n));
    });

    it('should find matching nonchemical fuel', () => {
      const result = RecipeUtility.adjustRecipe(
        RecipeId.UsedUpUraniumFuelCell,
        Mocks.recipesStateInitial[RecipeId.UsedUpUraniumFuelCell],
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(rational(1n, 200n));
    });

    it('should find non-matching nonchemical fuel', () => {
      const data = {
        ...Mocks.adjustedDataset,
        ...{
          recipeEntities: {
            ...Mocks.adjustedDataset.recipeEntities,
            ...{
              [RecipeId.UsedUpUraniumFuelCell]: {
                ...Mocks.adjustedDataset.recipeEntities[
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
        Mocks.recipesStateInitial[RecipeId.UsedUpUraniumFuelCell],
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(rational(1n, 200n));
    });

    it('should adjust based on overclock', () => {
      const settings = { ...Mocks.recipesState[RecipeId.SteelChest] };
      settings.overclock = rational(200n);
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.adjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(1n, 3n),
          drain: rational(5n),
          consumption: rational(136838616n, 364903n),
          pollution: rational(1n, 20n),
          productivity: rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should adjust a power producer based on overclock', () => {
      const settings = { ...Mocks.recipesState[RecipeId.SteelChest] };
      settings.overclock = rational(200n);
      const data = Mocks.getDataset();
      data.machineEntities[ItemId.AssemblingMachine2].usage = rational(-10n);
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.adjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(1n, 3n),
          drain: rational(5n),
          consumption: rational(-20n),
          pollution: rational(1n, 20n),
          productivity: rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should use a recipe specific usage', () => {
      const settings = { ...Mocks.recipesState[RecipeId.SteelChest] };
      const data = {
        ...Mocks.dataset,
        ...{
          recipeEntities: {
            ...Mocks.dataset.recipeEntities,
            ...{
              [RecipeId.SteelChest]: {
                ...Mocks.dataset.recipeEntities[RecipeId.SteelChest],
                ...{
                  usage: rational(10000n),
                },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.adjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(2n, 3n),
          drain: rational(5n),
          consumption: rational(10000n),
          pollution: rational(1n, 20n),
          productivity: rational.one,
          usage: rational(10000n),
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should calculate proliferator usage', () => {
      const settings = spread(Mocks.recipesStateInitial[ItemId.SteelChest], {
        modules: [{ count: rational.one, id: ItemId.ProductivityModule3 }],
      });
      const recipe = {
        ...Mocks.dataset.recipeEntities[RecipeId.SteelChest],
        ...{
          in: {
            ...Mocks.dataset.recipeEntities[RecipeId.SteelChest].in,
            ...{ [ItemId.ProductivityModule]: rational.one },
          },
        },
      };
      const data = {
        ...Mocks.dataset,
        ...{
          recipeEntities: {
            ...Mocks.dataset.recipeEntities,
            ...{
              [RecipeId.SteelChest]: recipe,
            },
          },
          moduleEntities: {
            ...Mocks.dataset.moduleEntities,
            ...{
              [ItemId.ProductivityModule3]: {
                ...Mocks.dataset.moduleEntities[ItemId.ProductivityModule3],
                ...{
                  sprays: rational(10n),
                  proliferator: ItemId.ProductivityModule3,
                },
              },
              [ItemId.ProductivityModule]: {
                ...Mocks.dataset.moduleEntities[ItemId.ProductivityModule],
                ...{
                  sprays: rational(10n),
                  proliferator: ItemId.ProductivityModule,
                },
              },
            },
          },
        },
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        spread(Mocks.settingsStateInitial, {
          proliferatorSprayId: ItemId.ProductivityModule,
        }),
        data,
      );
      const expected: AdjustedRecipe = {
        ...recipe,
        ...{
          in: {
            [ItemId.SteelPlate]: rational(8n),
            [ItemId.ProductivityModule]: rational(11n, 10n),
            [ItemId.ProductivityModule3]: rational(9n, 10n),
          },
          out: { [ItemId.SteelChest]: rational(11n, 10n) },
          time: rational(8n, 97n),
          drain: rational(25n, 2n),
          consumption: rational(2775n),
          pollution: rational(407n, 1500n),
          productivity: rational(11n, 10n),
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should add machine consumption', () => {
      const data = Mocks.getDataset();
      data.machineEntities[ItemId.AssemblingMachine2].consumption = {
        [ItemId.Coal]: rational.one,
      };
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CopperCable,
        Mocks.recipesState[RecipeId.CopperCable],
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.dataset.recipeEntities[RecipeId.CopperCable],
        ...{
          in: {
            [ItemId.CopperPlate]: rational.one,
            [ItemId.Coal]: rational(1n, 90n),
          },
          time: rational(2n, 3n),
          drain: rational(5n),
          consumption: rational(150n),
          pollution: rational(1n, 20n),
          productivity: rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should reduce net production to output only', () => {
      const data = Mocks.getDataset();
      data.recipeEntities[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] =
        rational.one;
      data.recipeEntities[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] =
        rational(2n);
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CoalLiquefaction,
        Mocks.recipesState[RecipeId.CoalLiquefaction],
        Mocks.itemsStateInitial,
        spread(Mocks.settingsStateInitial, { netProductionOnly: true }),
        data,
      );
      expect(result.in[ItemId.HeavyOil]).toBeUndefined();
      expect(result.out[ItemId.HeavyOil]).toEqual(rational.one);
    });

    it('should reduce net production to input only', () => {
      const data = Mocks.getDataset();
      data.recipeEntities[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] =
        rational(2n);
      data.recipeEntities[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] =
        rational.one;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CoalLiquefaction,
        Mocks.recipesState[RecipeId.CoalLiquefaction],
        Mocks.itemsStateInitial,
        spread(Mocks.settingsStateInitial, { netProductionOnly: true }),
        data,
      );
      expect(result.in[ItemId.HeavyOil]).toEqual(rational.one);
      expect(result.out[ItemId.HeavyOil]).toBeUndefined();
    });

    it('should reduce net production to no input/output', () => {
      const data = Mocks.getDataset();
      data.recipeEntities[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] =
        rational.one;
      data.recipeEntities[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] =
        rational.one;
      const result = RecipeUtility.adjustRecipe(
        RecipeId.CoalLiquefaction,
        Mocks.recipesState[RecipeId.CoalLiquefaction],
        Mocks.itemsStateInitial,
        spread(Mocks.settingsStateInitial, { netProductionOnly: true }),
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
        Mocks.recipesState[RecipeId.SteelChest],
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = {
        ...Mocks.adjustedDataset.recipeEntities[RecipeId.SteelChest],
        ...{
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(1n, 60n),
          drain: rational(5n),
          consumption: rational(150n),
          pollution: rational(1n, 20n),
          productivity: rational.one,
          produces: new Set(),
          output: {},
        },
      };
      expect(result).toEqual(expected);
    });

    it('should adjust based on number of Final Factory duplicators', () => {
      const data = Mocks.getDataset();
      data.game = Game.FinalFactory;
      const settings = spread(Mocks.recipesState[RecipeId.SteelChest], {
        overclock: undefined,
      });

      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      const expected: AdjustedRecipe = spread(
        Mocks.adjustedDataset.recipeEntities[
          RecipeId.SteelChest
        ] as unknown as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational(1n) },
          time: rational(2n, 3n),
          drain: rational(5n),
          consumption: rational(150n),
          pollution: rational(1n, 20n),
          productivity: rational.one,
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should adjust based on Satisfactory Somersloop implementation', () => {
      const data = Mocks.getDataset();
      data.game = Game.Satisfactory;
      data.moduleEntities[ItemId.Somersloop] = {
        productivity: rational(1n),
        consumption: rational(1n),
      };
      const settings = spread(Mocks.recipesState[RecipeId.SteelChest], {
        overclock: rational(100n),
        modules: [{ id: ItemId.Somersloop, count: rational(2n) }],
      });

      const result = RecipeUtility.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );

      const expected: AdjustedRecipe = spread(
        Mocks.adjustedDataset.recipeEntities[
          RecipeId.SteelChest
        ] as unknown as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational(2n) },
          time: rational(2n, 3n),
          drain: rational(5n),
          consumption: rational(600n),
          pollution: rational(1n, 5n),
          productivity: rational(2n),
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });
  });

  describe('adjustLaunchRecipeObjective', () => {
    it('should skip non-launch objectives', () => {
      const recipe = { ...Mocks.dataset.recipeEntities[RecipeId.IronPlate] };
      const time = recipe.time;

      // No recipe part
      RecipeUtility.adjustLaunchRecipeObjective(
        recipe,
        Mocks.recipesStateInitial,
        Mocks.adjustedDataset,
      );
      expect(recipe.time).toEqual(time);

      // No silo
      recipe.part = ItemId.IronPlate;
      RecipeUtility.adjustLaunchRecipeObjective(
        recipe,
        Mocks.recipesStateInitial,
        Mocks.adjustedDataset,
      );
      expect(recipe.time).toEqual(time);

      // No machine id
      const settings = Mocks.getRecipesState();
      delete settings[RecipeId.IronPlate].machineId;
      RecipeUtility.adjustLaunchRecipeObjective(
        recipe,
        settings,
        Mocks.adjustedDataset,
      );
      expect(recipe.time).toEqual(time);
    });

    it('should adjust a launch objective based on rocket part recipe', () => {
      const objective: Objective = {
        id: '0',
        targetId: RecipeId.SpaceSciencePack,
        value: rational.one,
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      };
      const recipe = RecipeUtility.adjustRecipe(
        objective.targetId,
        objective,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.dataset,
      );
      RecipeUtility.adjustLaunchRecipeObjective(
        recipe,
        Mocks.recipesStateInitial,
        Mocks.adjustedDataset,
      );
      expect(recipe.time).toEqual(rational(82499n, 924n));
    });
  });

  describe('adjustSiloRecipes', () => {
    let adjustedRecipe: Entities<AdjustedRecipe>;

    beforeEach(() => {
      adjustedRecipe = Mocks.dataset.recipeIds.reduce(
        (e: Entities<AdjustedRecipe>, i) => {
          e[i] = RecipeUtility.adjustRecipe(
            i,
            Mocks.recipesStateInitial[i],
            Mocks.itemsStateInitial,
            Mocks.settingsStateInitial,
            Mocks.dataset,
          );
          return e;
        },
        {},
      );
    });

    it('should adjust recipes', () => {
      const result = RecipeUtility.adjustSiloRecipes(
        adjustedRecipe,
        Mocks.recipesStateInitial,
        Mocks.dataset,
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        rational(82499n, 924n),
      );
      expect(result[RecipeId.RocketPart].time).toEqual(
        rational(82499n, 66000n),
      );
    });

    it('should handle invalid machine', () => {
      const settings2 = {
        ...Mocks.recipesStateInitial,
        ...{
          [RecipeId.SpaceSciencePack]: {
            machineId: 'id',
          },
        },
      };
      const result = RecipeUtility.adjustSiloRecipes(
        adjustedRecipe,
        settings2,
        Mocks.dataset,
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        rational(203n, 5n),
      );
      expect(result[RecipeId.RocketPart].time).toEqual(
        rational(82499n, 66000n),
      );
    });

    it('should handle missing machine id', () => {
      const settings2 = {
        ...Mocks.recipesStateInitial,
        ...{
          [RecipeId.SpaceSciencePack]: {
            machineId: '',
          },
        },
      };
      const result = RecipeUtility.adjustSiloRecipes(
        adjustedRecipe,
        settings2,
        Mocks.dataset,
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        rational(203n, 5n),
      );
      expect(result[RecipeId.RocketPart].time).toEqual(
        rational(82499n, 66000n),
      );
    });
  });

  describe('allowsModules', () => {
    it('should check machine and rocket recipes', () => {
      // Silo recipes
      expect(
        RecipeUtility.allowsModules(
          Mocks.adjustedDataset.recipeEntities[RecipeId.RocketPart],
          Mocks.adjustedDataset.machineEntities[ItemId.RocketSilo],
        ),
      ).toBeTrue();
      expect(
        RecipeUtility.allowsModules(
          Mocks.adjustedDataset.recipeEntities[RecipeId.SpaceSciencePack],
          Mocks.adjustedDataset.machineEntities[ItemId.RocketSilo],
        ),
      ).toBeFalse();
      // Normal recipes
      expect(
        RecipeUtility.allowsModules(
          Mocks.adjustedDataset.recipeEntities[ItemId.Coal],
          Mocks.adjustedDataset.machineEntities[ItemId.ElectricMiningDrill],
        ),
      ).toBeTrue();
      expect(
        RecipeUtility.allowsModules(
          Mocks.adjustedDataset.recipeEntities[ItemId.Coal],
          Mocks.adjustedDataset.machineEntities[ItemId.BurnerMiningDrill],
        ),
      ).toBeFalse();
    });
  });

  describe('adjustDataset', () => {
    it('should adjust recipes and silo recipes', () => {
      spyOn(RecipeUtility, 'adjustSiloRecipes').and.callThrough();
      spyOn(RecipeUtility, 'adjustRecipe').and.callThrough();
      const result = RecipeUtility.adjustDataset(
        Mocks.adjustedDataset.recipeIds,
        Mocks.recipesStateInitial,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(result).toBeTruthy();
      expect(RecipeUtility.adjustSiloRecipes).toHaveBeenCalledTimes(1);
      expect(RecipeUtility.adjustRecipe).toHaveBeenCalledTimes(
        Mocks.adjustedDataset.recipeIds.length,
      );
    });
  });

  describe('adjustCosts', () => {
    let adjustedRecipe: Entities<Recipe>;

    beforeEach(() => {
      adjustedRecipe = RecipeUtility.adjustRecipes(
        Mocks.adjustedDataset.recipeIds,
        Mocks.recipesStateInitial,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
    });

    it('should apply an overridden cost', () => {
      const recipeSettings = {
        ...Mocks.recipesStateInitial,
        ...{
          [RecipeId.Coal]: {
            ...Mocks.recipesStateInitial[RecipeId.Coal],
            ...{ cost: rational(2n) },
          },
        },
      };
      RecipeUtility.adjustCosts(
        Mocks.adjustedDataset.recipeIds,
        adjustedRecipe,
        recipeSettings,
        Mocks.costs,
        Mocks.adjustedDataset,
      );
      expect(adjustedRecipe[RecipeId.Coal].cost).toEqual(rational(2n));
    });

    it('should apply normal recipe and machine costs', () => {
      RecipeUtility.adjustCosts(
        Mocks.adjustedDataset.recipeIds,
        adjustedRecipe,
        Mocks.recipesStateInitial,
        Mocks.costs,
        Mocks.adjustedDataset,
      );
      expect(adjustedRecipe[RecipeId.Coal].cost).toEqual(rational(1183n, 4n));
      expect(adjustedRecipe[RecipeId.CopperCable].cost).toEqual(rational(9n));
    });
  });

  describe('adjustObjective', () => {
    it('should return an item objective unaltered', () => {
      expect(
        RecipeUtility.adjustObjective(
          Mocks.objective1,
          Mocks.itemsStateInitial,
          Mocks.recipesStateInitial,
          Mocks.machinesStateInitial,
          Mocks.settingsStateInitial,
          Mocks.adjustedDataset,
        ),
      ).toEqual(Mocks.objective1);
    });

    it('should adjust a recipe objective based on settings', () => {
      const result = RecipeUtility.adjustObjective(
        {
          id: '1',
          targetId: RecipeId.IronPlate,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
        },
        Mocks.itemsStateInitial,
        Mocks.recipesStateInitial,
        Mocks.machinesStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(result.machineId).toEqual(ItemId.ElectricFurnace);
      expect(result.moduleOptions?.length).toEqual(10);
      expect(result.modules).toEqual([
        { count: rational(2n), id: ItemId.ProductivityModule3 },
      ]);
      expect(result.beacons?.[0].count).toEqual(rational(8n));
      expect(result.beacons?.[0].id).toEqual(ItemId.Beacon);
      expect(result.beacons?.[0].modules).toEqual([
        { count: rational(2n), id: ItemId.SpeedModule3 },
      ]);
      expect(result.overclock).toBeUndefined();
    });

    it('should handle a machine with no modules', () => {
      const settings = spread(Mocks.settingsStateInitial, {
        machineRankIds: undefined,
      });
      const result = RecipeUtility.adjustObjective(
        {
          id: '1',
          targetId: RecipeId.IronPlate,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
        },
        Mocks.itemsStateInitial,
        Mocks.recipesStateInitial,
        Mocks.machinesStateInitial,
        settings,
        Mocks.adjustedDataset,
      );
      expect(result.machineId).toEqual(ItemId.StoneFurnace);
    });

    it('should handle nullish values', () => {
      spyOn(RecipeUtility, 'allowsModules').and.returnValue(true);
      const data = Mocks.getAdjustedDataset();
      data.machineEntities[ItemId.StoneFurnace].modules = undefined;
      const machines = spread(Mocks.machinesStateInitial, {
        [ItemId.ElectricFurnace]: spread(
          Mocks.machinesStateInitial[ItemId.ElectricFurnace],
          {
            modules: undefined,
            beacons: undefined,
          },
        ),
      });
      const settings = spread(Mocks.settingsStateInitial, {
        machineRankIds: undefined,
      });
      const result = RecipeUtility.adjustObjective(
        {
          id: '1',
          targetId: RecipeId.IronPlate,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          beacons: [{ id: ItemId.Beacon }],
        },
        Mocks.itemsStateInitial,
        Mocks.recipesStateInitial,
        machines,
        settings,
        data,
      );
      expect(result.machineId).toEqual(ItemId.StoneFurnace);
      expect(result.modules).toBeUndefined();
      expect(result.beacons?.[0].modules).toBeUndefined();
    });

    it('should use the correct fuel for a burn recipe objective', () => {
      const result = RecipeUtility.adjustObjective(
        {
          id: '1',
          targetId: RecipeId.UsedUpUraniumFuelCell,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          fuelId: ItemId.Coal,
        },
        Mocks.itemsStateInitial,
        Mocks.recipesStateInitial,
        Mocks.machinesStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(result.fuelId).toEqual(ItemId.UraniumFuelCell);
    });
  });

  describe('dehydrateModules', () => {
    it('should return undefined for default modules', () => {
      spyOn(RecipeUtility, 'defaultModules').and.returnValue([]);
      const result = RecipeUtility.dehydrateModules([], [], [], rational.one);
      expect(result).toBeUndefined();
    });

    it('should reduce to minimum id and count settings', () => {
      const modules: ModuleSettings[] = [
        { count: rational(3n), id: ItemId.ProductivityModule },
        { count: rational.one, id: ItemId.SpeedModule },
      ];
      const result = RecipeUtility.dehydrateModules(
        modules,
        [{ value: ItemId.ProductivityModule3 }],
        [ItemId.ProductivityModule3],
        rational(4n),
      );
      expect(result).toEqual(modules);
    });

    it('should default to zero module count', () => {
      const result = RecipeUtility.dehydrateModules(
        [{ count: rational.zero, id: ItemId.SpeedModule }],
        [{ value: ItemId.ProductivityModule3 }],
        [ItemId.ProductivityModule3],
        undefined,
      );
      expect(result).toEqual([{ id: ItemId.SpeedModule }]);
    });

    it('should filter out empty objects', () => {
      const result = RecipeUtility.dehydrateModules(
        [{ id: ItemId.Module }],
        [{ value: ItemId.SpeedModule3 }],
        [ItemId.SpeedModule3],
        rational(2n),
      );
      expect(result).toEqual([]);
    });
  });

  describe('hydrateModules', () => {
    it('should return default modules', () => {
      spyOn(RecipeUtility, 'defaultModules');
      RecipeUtility.hydrateModules(undefined, [], [], undefined);
      expect(RecipeUtility.defaultModules).toHaveBeenCalled();
    });

    it('should restore modules and empty entry', () => {
      const result = RecipeUtility.hydrateModules(
        [{ count: rational.one }],
        [{ value: ItemId.ProductivityModule3 }],
        [ItemId.ProductivityModule3],
        rational(4n),
      );
      expect(result).toEqual([
        { count: rational.one, id: ItemId.ProductivityModule3 },
        { count: rational(3n), id: ItemId.Module },
      ]);
    });

    it('should restore modules on unlimited entity', () => {
      const result = RecipeUtility.hydrateModules(
        [{}],
        [{ value: ItemId.ProductivityModule3 }],
        [ItemId.ProductivityModule3],
        true,
      );
      expect(result).toEqual([
        { count: rational.zero, id: ItemId.ProductivityModule3 },
      ]);
    });
  });

  describe('dehydrateBeacons', () => {
    it('should return undefined for default beacons', () => {
      expect(RecipeUtility.dehydrateBeacons([], [])).toBeUndefined();
    });

    it('should return value if default is empty/null', () => {
      expect(RecipeUtility.dehydrateBeacons([{}], [])).toEqual([{}]);
    });

    it('should reduce to minimum settings', () => {
      expect(
        RecipeUtility.dehydrateBeacons(
          [
            {
              count: rational(8n),
              id: ItemId.Beacon,
              modules: [{ count: rational.one, id: ItemId.SpeedModule3 }],
            },
            {
              count: rational.one,
              id: ItemId.AdvancedCircuit,
              modules: [{ count: rational(2n), id: ItemId.SpeedModule }],
              total: rational.one,
            },
          ],
          [
            {
              count: rational(8n),
              id: ItemId.Beacon,
              modules: [{ count: rational(2n), id: ItemId.SpeedModule3 }],
            },
          ],
        ),
      ).toEqual([
        {
          modules: [{ count: rational.one }],
        },
        {
          count: rational.one,
          id: ItemId.AdvancedCircuit,
          modules: [{ id: ItemId.SpeedModule }],
          total: rational.one,
        },
      ]);
    });

    it('should filter out empty objects', () => {
      const result = RecipeUtility.dehydrateBeacons(
        [{ count: rational(2n) }],
        [{ count: rational(2n), id: ItemId.Beacon }],
      );
      expect(result).toEqual([]);
    });
  });

  describe('hydrateBeacons', () => {
    it('should return default beacons if empty', () => {
      expect(RecipeUtility.hydrateBeacons([{}], [])).toEqual([]);
    });

    it('should restore beacons', () => {
      expect(
        RecipeUtility.hydrateBeacons(
          [
            {
              modules: [{ count: rational.one }],
            },
          ],
          [
            {
              count: rational(8n),
              id: ItemId.Beacon,
              modules: [{ count: rational(2n), id: ItemId.SpeedModule3 }],
            },
          ],
        ),
      ).toEqual([
        {
          count: rational(8n),
          id: ItemId.Beacon,
          modules: [
            { count: rational.one, id: ItemId.SpeedModule3 },
            { count: rational.one, id: ItemId.Module },
          ],
          total: undefined,
        },
      ]);
    });

    it('should skip restoring empty slots if defaults have no module count', () => {
      expect(
        RecipeUtility.hydrateBeacons(
          [
            {
              modules: [{ count: rational.one }],
            },
          ],
          [
            {
              count: rational(8n),
              id: ItemId.Beacon,
              modules: [{ id: ItemId.SpeedModule3 }],
            },
          ],
        ),
      ).toEqual([
        {
          count: rational(8n),
          id: ItemId.Beacon,
          modules: [{ count: rational.one, id: ItemId.SpeedModule3 }],
          total: undefined,
        },
      ]);
    });
  });
});
