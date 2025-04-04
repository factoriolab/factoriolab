import { TestBed } from '@angular/core/testing';

import { spread } from '~/helpers';
import { AdjustedRecipe, Recipe, RecipeFlag } from '~/models/data/recipe';
import { Game } from '~/models/enum/game';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { Quality } from '~/models/enum/quality';
import { flags } from '~/models/flags';
import { ObjectiveState } from '~/models/objective';
import { rational } from '~/models/rational';
import { ModuleSettings } from '~/models/settings/module-settings';
import { Entities } from '~/models/utils';
import { ItemId, Mocks, RecipeId, TestModule } from '~/tests';

import { RecipeService } from './recipe.service';

describe('RecipeService', () => {
  let service: RecipeService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(RecipeService);
  });

  describe('bestMatch', () => {
    it('should pick the first option if list only contains one', () => {
      const value = 'value';
      const result = service.bestMatch([{ value }], []);
      expect(result).toEqual(value);
    });

    it('should pick the first match from rank', () => {
      const value = 'value';
      const result = service.bestMatch(
        [{ value: 'test1' }, { value }],
        ['test2', value],
      );
      expect(result).toEqual(value);
    });
  });

  describe('machineOptions', () => {
    it('should filter the list of producers', () => {
      const result = service.machineOptions(
        Mocks.dataset.recipeEntities[RecipeId.Coal],
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(result.length).toEqual(2);
    });

    it('should fall back to full list of producers if none available', () => {
      const settings = spread(Mocks.settingsStateInitial, {
        availableItemIds: new Set(),
      });
      const result = service.machineOptions(
        Mocks.dataset.recipeEntities[RecipeId.Coal],
        settings,
        Mocks.adjustedDataset,
      );
      expect(result.length).toEqual(2);
    });

    it('should filter for producers allowed at the current locations', () => {
      const data = Mocks.getDataset();
      data.machineEntities[ItemId.BurnerMiningDrill].locations = ['id2'];
      data.machineEntities[ItemId.ElectricMiningDrill].locations = ['id'];
      const recipe = data.recipeEntities[RecipeId.Coal];
      const result = service.machineOptions(
        recipe,
        Mocks.settingsStateInitial,
        data,
      );
      expect(result.length).toEqual(1);
    });
  });

  describe('fuelOptions', () => {
    it('should handle entities with no fuel categories', () => {
      const result = service.fuelOptions(
        {} as any,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(result).toEqual([]);
    });

    it('should handle entity that specifies a fuel', () => {
      const result = service.fuelOptions(
        { fuel: ItemId.Coal } as any,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(result).toEqual([{ value: ItemId.Coal, label: 'Coal' }]);
    });
  });

  describe('moduleOptions', () => {
    it('should filter disallowed effects', () => {
      const result = service.moduleOptions(
        spread(Mocks.dataset.beaconEntities[ItemId.Beacon], {
          disallowedEffects: ['speed', 'consumption'],
        }),
        Mocks.settingsStateInitial,
        Mocks.dataset,
      );
      expect(result).toHaveSize(4);
    });

    it('should filter recipe disallowed effects', () => {
      const data = Mocks.getDataset();
      data.recipeEntities[RecipeId.Coal].disallowedEffects = [
        'speed',
        'consumption',
      ];
      const result = service.moduleOptions(
        data.beaconEntities[ItemId.Beacon],
        Mocks.settingsStateInitial,
        data,
        RecipeId.Coal,
      );
      expect(result).toHaveSize(1);
    });

    it('should disallow empty module in Satisfactory mining', () => {
      const result = service.moduleOptions(
        Mocks.dataset.machineEntities[ItemId.AssemblingMachine3],
        Mocks.settingsStateInitial,
        spread(Mocks.dataset, { flags: flags.sfy }),
        RecipeId.Coal,
      );
      expect(result).toHaveSize(6);
    });
  });

  describe('defaultModules', () => {
    it('should fill in modules list for machine', () => {
      const result = service.defaultModules(
        [{ value: ItemId.SpeedModule }],
        [ItemId.ProductivityModule, ItemId.SpeedModule],
        rational.one,
      );
      expect(result).toEqual([{ count: rational.one, id: ItemId.SpeedModule }]);
    });

    it('should handle unlimited modules', () => {
      const result = service.defaultModules(
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
      const settings = spread(Mocks.recipesState[RecipeId.SteelChest]);
      settings.modules = undefined;
      settings.beacons = [
        {
          count: rational.zero,
          id: ItemId.Beacon,
          modules: [{ count: rational.one, id: ItemId.SpeedModule }],
        },
      ];
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      const expected = spread(
        Mocks.adjustedDataset.recipeEntities[
          RecipeId.SteelChest
        ] as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(2n, 3n),
          drain: rational(5n),
          consumption: rational(150n),
          pollution: rational(1n, 20n),
          effects: Mocks.ModuleEffects,
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should handle recipes with declared outputs', () => {
      const result = service.adjustRecipe(
        RecipeId.CopperCable,
        Mocks.recipesState[RecipeId.CopperCable],
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      const expected = spread(
        Mocks.adjustedDataset.recipeEntities[
          RecipeId.CopperCable
        ] as AdjustedRecipe,
        {
          time: rational(2n, 3n),
          drain: rational(5n),
          consumption: rational(150n),
          pollution: rational(1n, 20n),
          effects: Mocks.ModuleEffects,
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should handle research factor', () => {
      const settings = spread(Mocks.recipesState[RecipeId.MiningProductivity]);
      settings.machineId = ItemId.Lab;
      const result = service.adjustRecipe(
        RecipeId.MiningProductivity,
        settings,
        Mocks.itemsStateInitial,
        spread(Mocks.settingsStateInitial, { researchBonus: rational(100n) }),
        Mocks.adjustedDataset,
      );
      const expected = spread(
        Mocks.adjustedDataset.recipeEntities[
          RecipeId.MiningProductivity
        ] as AdjustedRecipe,
        {
          out: { [ItemId.MiningProductivity]: rational.one },
          time: rational(30n),
          drain: undefined,
          consumption: rational(60n),
          pollution: rational.zero,
          effects: Mocks.ModuleEffects,
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should handle mining productivity', () => {
      const settings = spread(Mocks.recipesState[RecipeId.IronOre]);
      settings.machineId = ItemId.ElectricMiningDrill;
      const result = service.adjustRecipe(
        RecipeId.IronOre,
        settings,
        Mocks.itemsStateInitial,
        spread(Mocks.settingsStateInitial, { miningBonus: rational(200n) }),
        Mocks.adjustedDataset,
      );
      const expected = spread(
        Mocks.adjustedDataset.recipeEntities[
          RecipeId.IronOre
        ] as AdjustedRecipe,
        {
          out: { [ItemId.IronOre]: rational(3n) },
          time: rational(2n),
          drain: undefined,
          consumption: rational(90n),
          pollution: rational(1n, 6n),
          effects: spread(Mocks.ModuleEffects, { productivity: rational(3n) }),
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should handle modules and beacons', () => {
      const settings = spread(Mocks.recipesState[RecipeId.SteelChest]);
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
      const data = spread(Mocks.adjustedDataset, {
        moduleEntities: spread(Mocks.adjustedDataset.moduleEntities, {
          // To verify all factors work in beacons
          [ItemId.SpeedModule]: spread(
            Mocks.adjustedDataset.moduleEntities[ItemId.SpeedModule],
            { productivity: rational.one, pollution: rational.one },
          ),
          // To verify null consumption works
          [ItemId.ProductivityModule]: spread(
            Mocks.adjustedDataset.moduleEntities[ItemId.ProductivityModule],
            { consumption: undefined },
          ),
        }),
      });
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      const expected = spread(
        Mocks.adjustedDataset.recipeEntities[
          RecipeId.SteelChest
        ] as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational(76n, 25n) },
          time: rational(40n, 81n),
          drain: rational(5n),
          consumption: rational(255n),
          pollution: rational(1037n, 4000n),
          effects: {
            consumption: rational(17n, 10n),
            pollution: rational(61n, 20n),
            productivity: rational(76n, 25n),
            speed: rational(27n, 20n),
            quality: rational.zero,
          },
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should handle modules and diminishing beacons', () => {
      const settings = spread(Mocks.recipesState[RecipeId.SteelChest]);
      settings.modules = [
        { count: rational.one, id: ItemId.SpeedModule },
        { count: rational.one, id: ItemId.ProductivityModule },
        { count: rational.one, id: ItemId.EfficiencyModule },
        { id: ItemId.Module },
      ];
      settings.beacons = [
        {
          id: ItemId.Beacon,
          count: rational(8n),
          modules: [
            { count: rational(2n), id: ItemId.SpeedModule },
            { id: ItemId.Module },
          ],
        },
      ];
      const data = spread(Mocks.adjustedDataset, {
        flags: flags['2.0'],
        beaconEntities: spread(Mocks.adjustedDataset.beaconEntities, {
          [ItemId.Beacon]: spread(
            Mocks.adjustedDataset.beaconEntities[ItemId.Beacon],
            {
              profile: [
                rational(1),
                rational(0.7071),
                rational(0.5773),
                rational(0.5),
                rational(0.4472),
                rational(0.4082),
                rational(0.3779),
                rational(0.3535),
              ],
            },
          ),
        }),
        moduleEntities: spread(Mocks.adjustedDataset.moduleEntities, {
          // To verify all factors work in beacons
          [ItemId.SpeedModule]: spread(
            Mocks.adjustedDataset.moduleEntities[ItemId.SpeedModule],
            { productivity: rational.one, pollution: rational.one },
          ),
          // To verify null consumption works
          [ItemId.ProductivityModule]: spread(
            Mocks.adjustedDataset.moduleEntities[ItemId.ProductivityModule],
            { consumption: undefined },
          ),
        }),
      });
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      const expected = spread(
        Mocks.adjustedDataset.recipeEntities[
          RecipeId.SteelChest
        ] as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational(4n) },
          time: rational(200n, 513n),
          drain: rational(5n),
          consumption: rational(384n),
          pollution: rational(388n, 625n),
          effects: {
            consumption: rational(64n, 25n),
            pollution: rational(97n, 20n),
            productivity: rational(4n),
            speed: rational(171n, 100n),
            quality: rational.zero,
          },
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should use minimum 20% effects', () => {
      const settings = spread(Mocks.recipesState[RecipeId.SteelChest]);
      settings.modules = [
        { count: rational(3n), id: ItemId.EfficiencyModule3 },
      ];
      // Set up efficiency module 3 to cause more than maximum effect in speed, consumption, and pollution
      const data = spread(Mocks.adjustedDataset, {
        moduleEntities: spread(Mocks.adjustedDataset.moduleEntities, {
          [ItemId.EfficiencyModule3]: spread(
            Mocks.adjustedDataset.moduleEntities[ItemId.EfficiencyModule3],
            {
              speed:
                Mocks.adjustedDataset.moduleEntities[ItemId.EfficiencyModule3]
                  .consumption,
              pollution:
                Mocks.adjustedDataset.moduleEntities[ItemId.EfficiencyModule3]
                  .consumption,
            },
          ),
        }),
      });
      settings.beacons = [
        {
          count: rational.zero,
          id: ItemId.Beacon,
          modules: [{ count: rational(2n), id: ItemId.Module }],
        },
      ];
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      const expected = spread(
        Mocks.adjustedDataset.recipeEntities[
          RecipeId.SteelChest
        ] as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(10n, 3n),
          drain: rational(5n),
          consumption: rational(30n),
          pollution: rational(1n, 500n),
          effects: {
            consumption: rational(1n, 5n),
            pollution: rational(1n, 5n),
            productivity: rational.one,
            speed: rational(1n, 5n),
            quality: rational.zero,
          },
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should use minimum 1/60 second time in Factorio', () => {
      const data = Mocks.getAdjustedDataset();
      data.recipeEntities[RecipeId.SteelChest] = spread(
        data.recipeEntities[RecipeId.SteelChest],
        { time: rational(1n, 10000n) },
      );
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        Mocks.recipesStateInitial[RecipeId.SteelChest],
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      expect(result.time).toEqual(rational(1n, 60n));
    });

    it('should find matching nonchemical fuel', () => {
      const result = service.adjustRecipe(
        RecipeId.UsedUpUraniumFuelCell,
        Mocks.recipesStateInitial[RecipeId.UsedUpUraniumFuelCell],
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(rational(1n, 200n));
    });

    it('should find non-matching nonchemical fuel', () => {
      const data = spread(Mocks.adjustedDataset, {
        recipeEntities: spread(Mocks.adjustedDataset.recipeEntities, {
          [RecipeId.UsedUpUraniumFuelCell]: spread(
            Mocks.adjustedDataset.recipeEntities[
              RecipeId.UsedUpUraniumFuelCell
            ],
            { in: {}, out: {} },
          ),
        }),
      });
      const result = service.adjustRecipe(
        RecipeId.UsedUpUraniumFuelCell,
        Mocks.recipesStateInitial[RecipeId.UsedUpUraniumFuelCell],
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(rational(1n, 200n));
    });

    it('should adjust based on overclock', () => {
      const settings = spread(Mocks.recipesState[RecipeId.SteelChest]);
      settings.overclock = rational(200n);
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      const expected = spread(
        Mocks.adjustedDataset.recipeEntities[
          RecipeId.SteelChest
        ] as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(1n, 3n),
          drain: rational(5n),
          consumption: rational(136838616n, 364903n),
          pollution: rational(1n, 20n),
          effects: spread(Mocks.ModuleEffects, { speed: rational(2n) }),
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should adjust a power producer based on overclock', () => {
      const settings = spread(Mocks.recipesState[RecipeId.SteelChest]);
      settings.overclock = rational(200n);
      const data = Mocks.getDataset();
      data.machineEntities[ItemId.AssemblingMachine2].usage = rational(-10n);
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      const expected = spread(
        Mocks.adjustedDataset.recipeEntities[
          RecipeId.SteelChest
        ] as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(1n, 3n),
          drain: rational(5n),
          consumption: rational(-20n),
          pollution: rational(1n, 20n),
          effects: spread(Mocks.ModuleEffects, { speed: rational(2n) }),
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should use a recipe specific usage', () => {
      const settings = spread(Mocks.recipesState[RecipeId.SteelChest]);
      const data = spread(Mocks.dataset, {
        recipeEntities: spread(Mocks.dataset.recipeEntities, {
          [RecipeId.SteelChest]: spread(
            Mocks.dataset.recipeEntities[RecipeId.SteelChest],
            { usage: rational(10000n) },
          ),
        }),
      });
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      const expected = spread(
        Mocks.adjustedDataset.recipeEntities[
          RecipeId.SteelChest
        ] as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(2n, 3n),
          drain: rational(5n),
          consumption: rational(10000n),
          pollution: rational(1n, 20n),
          effects: Mocks.ModuleEffects,
          usage: rational(10000n),
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should calculate proliferator usage', () => {
      const settings = spread(Mocks.recipesStateInitial[ItemId.SteelChest], {
        modules: [{ count: rational.one, id: ItemId.ProductivityModule3 }],
      });
      const recipe = spread(Mocks.dataset.recipeEntities[RecipeId.SteelChest], {
        in: spread(Mocks.dataset.recipeEntities[RecipeId.SteelChest].in, {
          [ItemId.ProductivityModule]: rational.one,
        }),
      });
      const data = spread(Mocks.dataset, {
        recipeEntities: spread(Mocks.dataset.recipeEntities, {
          [RecipeId.SteelChest]: recipe,
        }),
        moduleEntities: spread(Mocks.dataset.moduleEntities, {
          [ItemId.ProductivityModule3]: spread(
            Mocks.dataset.moduleEntities[ItemId.ProductivityModule3],
            {
              sprays: rational(10n),
              proliferator: ItemId.ProductivityModule3,
            },
          ),
          [ItemId.ProductivityModule]: spread(
            Mocks.dataset.moduleEntities[ItemId.ProductivityModule],
            {
              sprays: rational(10n),
              proliferator: ItemId.ProductivityModule,
            },
          ),
        }),
      });
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        Mocks.itemsStateInitial,
        spread(Mocks.settingsStateInitial, {
          proliferatorSprayId: ItemId.ProductivityModule,
        }),
        data,
      );
      const expected = spread(recipe as AdjustedRecipe, {
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
        effects: {
          consumption: rational(37n, 5n),
          pollution: rational(11n, 10n),
          productivity: rational(11n, 10n),
          speed: rational(97n, 20n),
          quality: rational.zero,
        },
        produces: new Set(),
        output: {},
      });
      expect(result).toEqual(expected);
    });

    it('should add machine consumption', () => {
      const data = Mocks.getDataset();
      data.machineEntities[ItemId.AssemblingMachine2].consumption = {
        [ItemId.Coal]: rational.one,
      };
      const result = service.adjustRecipe(
        RecipeId.CopperCable,
        Mocks.recipesState[RecipeId.CopperCable],
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      const expected = spread(
        Mocks.dataset.recipeEntities[RecipeId.CopperCable] as AdjustedRecipe,
        {
          in: {
            [ItemId.CopperPlate]: rational.one,
            [ItemId.Coal]: rational(1n, 90n),
          },
          time: rational(2n, 3n),
          drain: rational(5n),
          consumption: rational(150n),
          pollution: rational(1n, 20n),
          effects: Mocks.ModuleEffects,
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should reduce net production to output only', () => {
      const data = Mocks.getDataset();
      data.recipeEntities[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] =
        rational.one;
      data.recipeEntities[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] =
        rational(2n);
      const result = service.adjustRecipe(
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
      const result = service.adjustRecipe(
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
      const result = service.adjustRecipe(
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
      const itemsState = spread(Mocks.itemsStateInitial, {
        [ItemId.ElectronicCircuit]: spread(
          Mocks.itemsStateInitial[ItemId.ElectronicCircuit],
          { beltId: undefined },
        ),
      });
      const result = service.adjustRecipe(
        RecipeId.ElectronicCircuit,
        Mocks.recipesState[RecipeId.ElectronicCircuit],
        itemsState,
        Mocks.settingsStateInitial,
        data,
      );
      const expected = spread(
        Mocks.adjustedDataset.recipeEntities[
          RecipeId.ElectronicCircuit
        ] as AdjustedRecipe,
        {
          out: { [ItemId.ElectronicCircuit]: rational.one },
          time: rational(1n, 60n),
          drain: rational(5n),
          consumption: rational(150n),
          pollution: rational(1n, 20n),
          effects: Mocks.ModuleEffects,
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should adjust based on number of Final Factory duplicators', () => {
      const data = Mocks.getDataset();
      data.game = Game.FinalFactory;
      const settings = spread(Mocks.recipesState[RecipeId.SteelChest], {
        overclock: undefined,
      });

      const result = service.adjustRecipe(
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
          effects: Mocks.ModuleEffects,
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should adjust based on Satisfactory Somersloop implementation', () => {
      const data = Mocks.getDataset();
      data.flags = flags.sfy;
      data.moduleEntities[ItemId.Somersloop] = {
        productivity: rational(1n),
        consumption: rational(1n),
      };
      const settings = spread(Mocks.recipesState[RecipeId.SteelChest], {
        overclock: rational(100n),
        modules: [{ id: ItemId.Somersloop, count: rational(2n) }],
      });

      const result = service.adjustRecipe(
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
          drain: rational(600n),
          pollution: rational(1n, 5n),
          effects: spread(Mocks.ModuleEffects, {
            consumption: rational(4n),
            productivity: rational(2n),
          }),
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should add machine base effects', () => {
      const data = Mocks.getDataset();
      data.machineEntities[ItemId.AssemblingMachine2].baseEffect = {
        consumption: rational(1n, 2n),
        pollution: rational(1n, 2n),
        productivity: rational(1n, 2n),
        quality: rational(1n, 2n),
        speed: rational(1n, 2n),
      };
      const result = service.adjustRecipe(
        RecipeId.CopperCable,
        Mocks.recipesState[RecipeId.CopperCable],
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      const expected = spread(
        Mocks.dataset.recipeEntities[RecipeId.CopperCable] as AdjustedRecipe,
        {
          out: { [ItemId.CopperCable]: rational(3n) },
          time: rational(4n, 9n),
          drain: rational(5n),
          consumption: rational(225n),
          pollution: rational(9n, 80n),
          effects: {
            consumption: rational(3n, 2n),
            pollution: rational(3n, 2n),
            productivity: rational(3n, 2n),
            quality: rational(1n, 2n),
            speed: rational(3n, 2n),
          },
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should handle quality', () => {
      const data = Mocks.getDataset();
      data.flags = flags.spa;
      data.moduleEntities[ItemId.SpeedModule3].speed = rational.zero;
      data.moduleEntities[ItemId.SpeedModule3].quality = rational(1n, 40n);
      const recipeSettings = spread(
        Mocks.recipesStateInitial[RecipeId.FirearmMagazine],
        { beacons: undefined },
      );
      const settings = spread(Mocks.settingsStateInitial, {
        quality: Quality.Legendary,
      });
      const result = service.adjustRecipe(
        RecipeId.FirearmMagazine,
        recipeSettings,
        Mocks.itemsStateInitial,
        settings,
        data,
      );
      expect(result.out).toEqual({
        ['firearm-magazine']: rational(9n, 10n),
        ['firearm-magazine(1)']: rational(9n, 100n),
        ['firearm-magazine(2)']: rational(9n, 1000n),
        ['firearm-magazine(3)']: rational(9n, 10000n),
        ['firearm-magazine(5)']: rational(1n, 10000n),
      });
    });

    it('should ignore fluid quality', () => {
      const data = Mocks.getDataset();
      data.flags = flags.spa;
      data.moduleEntities[ItemId.ProductivityModule3].quality = rational.one;
      data.moduleEntities[ItemId.SpeedModule3].quality = rational.one;
      const settings = spread(Mocks.settingsStateInitial, {
        quality: Quality.Legendary,
      });
      const result = service.adjustRecipe(
        RecipeId.BasicOilProcessing,
        Mocks.recipesStateInitial[RecipeId.BasicOilProcessing],
        Mocks.itemsStateInitial,
        settings,
        data,
      );
      expect(Object.keys(result.out).length).toEqual(1);
    });

    it('should adjust for ingredientUsage', () => {
      const data = Mocks.getDataset();
      data.machineEntities[ItemId.Lab].ingredientUsage = rational(1n, 2n);
      const result = service.adjustRecipe(
        RecipeId.ArtilleryShellRange,
        Mocks.recipesStateInitial[RecipeId.ArtilleryShellRange],
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        data,
      );
      expect(result.in[ItemId.SpaceSciencePack]).toEqual(rational(1n, 2n));
    });

    it('should adjust for recipe productivity', () => {
      const recipeSettings = spread(
        Mocks.recipesStateInitial[RecipeId.SteelPlate],
        { productivity: rational(50n) },
      );
      const result = service.adjustRecipe(
        RecipeId.SteelPlate,
        recipeSettings,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.dataset,
      );
      expect(result.out[ItemId.SteelPlate]).toEqual(rational(17n, 10n));
    });
  });

  describe('adjustLaunchRecipeObjective', () => {
    it('should skip non-launch objectives', () => {
      const recipe = spread(Mocks.dataset.recipeEntities[RecipeId.IronPlate]);
      const time = recipe.time;

      // No recipe part
      service.adjustLaunchRecipeObjective(
        recipe,
        Mocks.recipesStateInitial,
        Mocks.adjustedDataset,
      );
      expect(recipe.time).toEqual(time);

      // No silo
      recipe.part = ItemId.IronPlate;
      service.adjustLaunchRecipeObjective(
        recipe,
        Mocks.recipesStateInitial,
        Mocks.adjustedDataset,
      );
      expect(recipe.time).toEqual(time);

      // No machine id
      const settings = Mocks.getRecipesState();
      delete settings[RecipeId.IronPlate].machineId;
      service.adjustLaunchRecipeObjective(
        recipe,
        settings,
        Mocks.adjustedDataset,
      );
      expect(recipe.time).toEqual(time);
    });

    it('should adjust a launch objective based on rocket part recipe', () => {
      const objective: ObjectiveState = {
        id: '0',
        targetId: RecipeId.SpaceSciencePack,
        value: rational.one,
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      };
      const recipe = service.adjustRecipe(
        objective.targetId,
        objective,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.dataset,
      );
      service.adjustLaunchRecipeObjective(
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
          e[i] = service.adjustRecipe(
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
      const result = service.adjustSiloRecipes(
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
      const settings2 = spread(Mocks.recipesStateInitial, {
        [RecipeId.SpaceSciencePack]: {
          machineId: 'id',
        },
      });
      const result = service.adjustSiloRecipes(
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
      const settings2 = spread(Mocks.recipesStateInitial, {
        [RecipeId.SpaceSciencePack]: {
          machineId: '',
        },
      });
      const result = service.adjustSiloRecipes(
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
        service.allowsModules(
          Mocks.adjustedDataset.recipeEntities[RecipeId.RocketPart],
          Mocks.adjustedDataset.machineEntities[ItemId.RocketSilo],
        ),
      ).toBeTrue();
      expect(
        service.allowsModules(
          Mocks.adjustedDataset.recipeEntities[RecipeId.SpaceSciencePack],
          Mocks.adjustedDataset.machineEntities[ItemId.RocketSilo],
        ),
      ).toBeFalse();
      // Normal recipes
      expect(
        service.allowsModules(
          Mocks.adjustedDataset.recipeEntities[ItemId.Coal],
          Mocks.adjustedDataset.machineEntities[ItemId.ElectricMiningDrill],
        ),
      ).toBeTrue();
      expect(
        service.allowsModules(
          Mocks.adjustedDataset.recipeEntities[ItemId.Coal],
          Mocks.adjustedDataset.machineEntities[ItemId.BurnerMiningDrill],
        ),
      ).toBeFalse();
    });
  });

  describe('adjustDataset', () => {
    it('should adjust recipes and silo recipes', () => {
      spyOn(service, 'adjustSiloRecipes').and.callThrough();
      spyOn(service, 'adjustRecipe').and.callThrough();
      const result = service.adjustDataset(
        Mocks.recipesStateInitial,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
      expect(result).toBeTruthy();
      expect(service.adjustSiloRecipes).toHaveBeenCalledTimes(1);
      expect(service.adjustRecipe).toHaveBeenCalledTimes(
        Mocks.adjustedDataset.recipeIds.length,
      );
    });
  });

  describe('adjustCosts', () => {
    let adjustedRecipe: Entities<Recipe>;

    beforeEach(() => {
      adjustedRecipe = service.adjustRecipes(
        Mocks.adjustedDataset.recipeIds,
        Mocks.recipesStateInitial,
        Mocks.itemsStateInitial,
        Mocks.settingsStateInitial,
        Mocks.adjustedDataset,
      );
    });

    it('should apply an overridden cost', () => {
      const recipeSettings = spread(Mocks.recipesStateInitial, {
        [RecipeId.Coal]: spread(Mocks.recipesStateInitial[RecipeId.Coal], {
          cost: rational(2n),
        }),
      });
      service.adjustCosts(
        Mocks.adjustedDataset.recipeIds,
        adjustedRecipe,
        recipeSettings,
        Mocks.costs,
        Mocks.adjustedDataset,
      );
      expect(adjustedRecipe[RecipeId.Coal].cost).toEqual(rational(2n));
    });

    it('should apply normal recipe and machine costs', () => {
      service.adjustCosts(
        Mocks.adjustedDataset.recipeIds,
        adjustedRecipe,
        Mocks.recipesStateInitial,
        Mocks.costs,
        Mocks.adjustedDataset,
      );
      expect(adjustedRecipe[RecipeId.Coal].cost).toEqual(rational(1183n, 4n));
      expect(adjustedRecipe[RecipeId.CopperCable].cost).toEqual(rational(9n));
    });

    it('should adjust recycling cost', () => {
      adjustedRecipe[RecipeId.Coal] = spread(adjustedRecipe[RecipeId.Coal], {
        flags: new Set<RecipeFlag>(['recycling']),
      });
      service.adjustCosts(
        [RecipeId.Coal],
        adjustedRecipe,
        Mocks.recipesStateInitial,
        spread(Mocks.costs, { recycling: rational.zero }),
        Mocks.adjustedDataset,
      );
      expect(adjustedRecipe[RecipeId.Coal].cost).toEqual(rational.zero);
    });
  });

  describe('finalizeData', () => {
    it('should filter out recipe ids that are not viable', () => {
      const adjustedRecipe = spread(Mocks.adjustedDataset.adjustedRecipe, {
        [RecipeId.IronOre]: spread(
          Mocks.adjustedDataset.adjustedRecipe[RecipeId.IronOre],
          {
            output: {
              [ItemId.IronPlate]: rational(-5n),
              [ItemId.Concrete]: rational(-50n),
            },
          },
        ),
        [RecipeId.IronPlate]: spread(
          Mocks.adjustedDataset.adjustedRecipe[RecipeId.IronPlate],
          {
            output: {
              [ItemId.ElectronicCircuit]: rational(-5n),
              [ItemId.IronPlate]: rational.one,
            },
          },
        ),
      });

      const data = Mocks.getDataset();
      data.itemIds = data.itemIds.filter((i) => i !== ItemId.ElectronicCircuit);
      data.itemIds.unshift(ItemId.ElectronicCircuit);
      const result = service.finalizeData(
        [
          RecipeId.ElectronicCircuit,
          RecipeId.IronOre,
          RecipeId.IronPlate,
          RecipeId.Concrete,
        ],
        adjustedRecipe,
        Mocks.settingsStateInitial,
        data,
      );
      expect(result.itemAvailableRecipeIds[ItemId.IronPlate].length).toEqual(0);
      expect(result.itemAvailableRecipeIds[ItemId.Concrete].length).toEqual(0);
      expect(
        result.itemAvailableRecipeIds[ItemId.ElectronicCircuit].length,
      ).toEqual(1);
    });
  });

  describe('adjustObjective', () => {
    it('should return an item objective unaltered', () => {
      expect(
        service.adjustObjective(
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
      const result = service.adjustObjective(
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

    it('should use the correct fuel for a burn recipe objective', () => {
      const result = service.adjustObjective(
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
      spyOn(service, 'defaultModules').and.returnValue([]);
      const result = service.dehydrateModules([], [], [], rational.one);
      expect(result).toBeUndefined();
    });

    it('should reduce to minimum id and count settings', () => {
      const modules: ModuleSettings[] = [
        { count: rational(3n), id: ItemId.ProductivityModule },
        { count: rational.one, id: ItemId.SpeedModule },
      ];
      const result = service.dehydrateModules(
        modules,
        [{ value: ItemId.ProductivityModule3 }],
        [ItemId.ProductivityModule3],
        rational(4n),
      );
      expect(result).toEqual(modules);
    });

    it('should default to zero module count', () => {
      const result = service.dehydrateModules(
        [{ count: rational.zero, id: ItemId.SpeedModule }],
        [{ value: ItemId.ProductivityModule3 }],
        [ItemId.ProductivityModule3],
        undefined,
      );
      expect(result).toEqual([{ id: ItemId.SpeedModule }]);
    });

    it('should filter out empty objects', () => {
      const result = service.dehydrateModules(
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
      spyOn(service, 'defaultModules');
      service.hydrateModules(undefined, [], [], undefined);
      expect(service.defaultModules).toHaveBeenCalled();
    });

    it('should restore modules and empty entry', () => {
      const result = service.hydrateModules(
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
      const result = service.hydrateModules(
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
      expect(service.dehydrateBeacons([], [])).toBeUndefined();
    });

    it('should return value if default is empty/null', () => {
      expect(service.dehydrateBeacons([{}], [])).toEqual([{}]);
    });

    it('should reduce to minimum settings', () => {
      expect(
        service.dehydrateBeacons(
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
      const result = service.dehydrateBeacons(
        [{ count: rational(2n) }],
        [{ count: rational(2n), id: ItemId.Beacon }],
      );
      expect(result).toEqual([]);
    });
  });

  describe('hydrateBeacons', () => {
    it('should return default beacons if empty', () => {
      expect(service.hydrateBeacons([{}], [])).toEqual([]);
    });

    it('should restore beacons', () => {
      expect(
        service.hydrateBeacons(
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
        service.hydrateBeacons(
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
