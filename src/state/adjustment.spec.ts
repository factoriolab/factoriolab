import { TestBed } from '@angular/core/testing';

import { AdjustedRecipe, Recipe, RecipeFlag } from '~/data/schema/recipe';
import { rational } from '~/rational/rational';
import { ItemId } from '~/tests/item-id';
import { Mocks } from '~/tests/mocks/mocks';
import { mockModuleEffects } from '~/tests/mocks/module';
import { mockObjective1 } from '~/tests/mocks/objective';
import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';
import { spread } from '~/utils/object';

import { Adjustment } from './adjustment';
import { ItemsStore } from './items/items-store';
import { MachinesStore } from './machines/machines-store';
import { ObjectiveState } from './objectives/objective';
import { ObjectiveType } from './objectives/objective-type';
import { ObjectiveUnit } from './objectives/objective-unit';
import { RecipeSettings } from './recipes/recipe-settings';
import { RecipesStore } from './recipes/recipes-store';
import { initialSettingsState } from './settings/settings-state';
import { SettingsStore } from './settings/settings-store';

describe('Adjustment', () => {
  let service: Adjustment;
  let recipesStore: RecipesStore;
  let itemsStore: ItemsStore;
  let settingsStore: SettingsStore;
  let machinesStore: MachinesStore;
  let mocks: Mocks;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(Adjustment);
    recipesStore = TestBed.inject(RecipesStore);
    itemsStore = TestBed.inject(ItemsStore);
    settingsStore = TestBed.inject(SettingsStore);
    machinesStore = TestBed.inject(MachinesStore);
    mocks = TestBed.inject(Mocks);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('adjustRecipe', () => {
    it('should adjust a standard recipe', () => {
      const settings = spread(mocks.recipeSettings()[RecipeId.SteelChest]);
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
        itemsStore.settings(),
        settingsStore.settings(),
        recipesStore.adjustedDataset(),
      );
      const expected = spread(
        recipesStore.adjustedDataset().recipeRecord[
          RecipeId.SteelChest
        ] as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(2n, 3n),
          drain: rational(5n),
          consumption: rational(150n),
          pollution: rational(1n, 20n),
          effects: mockModuleEffects,
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should handle recipes with declared outputs', () => {
      const result = service.adjustRecipe(
        RecipeId.CopperCable,
        mocks.recipeSettings()[RecipeId.CopperCable],
        itemsStore.settings(),
        settingsStore.settings(),
        recipesStore.adjustedDataset(),
      );
      const expected = spread(
        recipesStore.adjustedDataset().recipeRecord[
          RecipeId.CopperCable
        ] as AdjustedRecipe,
        {
          time: rational(2n, 3n),
          drain: rational(5n),
          consumption: rational(150n),
          pollution: rational(1n, 20n),
          effects: mockModuleEffects,
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should handle research factor', () => {
      const settings = spread(
        mocks.recipeSettings()[RecipeId.MiningProductivity],
      );
      settings.machineId = ItemId.Lab;
      const result = service.adjustRecipe(
        RecipeId.MiningProductivity,
        settings,
        itemsStore.settings(),
        spread(settingsStore.settings(), { researchBonus: rational(100n) }),
        recipesStore.adjustedDataset(),
      );
      const expected = spread(
        recipesStore.adjustedDataset().recipeRecord[
          RecipeId.MiningProductivity
        ] as AdjustedRecipe,
        {
          out: { [ItemId.MiningProductivity]: rational.one },
          time: rational(30n),
          drain: undefined,
          consumption: rational(60n),
          pollution: rational.zero,
          effects: mockModuleEffects,
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should handle mining productivity', () => {
      const settings = spread(mocks.recipeSettings()[RecipeId.IronOre]);
      settings.machineId = ItemId.ElectricMiningDrill;
      const result = service.adjustRecipe(
        RecipeId.IronOre,
        settings,
        itemsStore.settings(),
        spread(settingsStore.settings(), { miningBonus: rational(200n) }),
        recipesStore.adjustedDataset(),
      );
      const expected = spread(
        recipesStore.adjustedDataset().recipeRecord[
          RecipeId.IronOre
        ] as AdjustedRecipe,
        {
          out: { [ItemId.IronOre]: rational(3n) },
          time: rational(2n),
          drain: undefined,
          consumption: rational(90n),
          pollution: rational(1n, 6n),
          effects: spread(mockModuleEffects, { productivity: rational(3n) }),
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should handle modules and beacons', () => {
      const settings = spread(mocks.recipeSettings()[RecipeId.SteelChest]);
      settings.modules = [
        { count: rational.one, id: ItemId.SpeedModule },
        { count: rational.one, id: ItemId.ProductivityModule },
        { count: rational.one, id: ItemId.EfficiencyModule },
        { id: '' },
      ];
      settings.beacons = [
        {
          id: ItemId.Beacon,
          count: rational.one,
          modules: [
            { count: rational(2n), id: ItemId.SpeedModule },
            { id: '' },
          ],
        },
      ];
      const data = mocks.getAdjustedDataset();
      data.moduleRecord[ItemId.SpeedModule].productivity = rational.one;
      data.moduleRecord[ItemId.SpeedModule].pollution = rational.one;
      data.moduleRecord[ItemId.ProductivityModule].consumption = undefined;
      data.beaconRecord[ItemId.Beacon].profile = undefined;
      data.beaconRecord[ItemId.Beacon].effectivity = rational(1n, 2n);
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        itemsStore.settings(),
        settingsStore.settings(),
        data,
      );
      const expected = spread(
        recipesStore.adjustedDataset().recipeRecord[
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
            quality: rational(-1n, 50n),
          },
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should handle modules and diminishing beacons', () => {
      const settings = spread(mocks.recipeSettings()[RecipeId.SteelChest]);
      settings.modules = [
        { count: rational.one, id: ItemId.SpeedModule },
        { count: rational.one, id: ItemId.ProductivityModule },
        { count: rational.one, id: ItemId.EfficiencyModule },
        { id: '' },
      ];
      settings.beacons = [
        {
          id: ItemId.Beacon,
          count: rational(8n),
          modules: [
            { count: rational(2n), id: ItemId.SpeedModule },
            { count: rational.one, id: ItemId.SpeedModule2 },
          ],
        },
      ];
      const data = mocks.getAdjustedDataset();
      data.moduleRecord[ItemId.SpeedModule].productivity = rational.one;
      data.moduleRecord[ItemId.SpeedModule].pollution = rational.one;
      data.moduleRecord[ItemId.ProductivityModule].consumption = undefined;
      data.beaconRecord[ItemId.Beacon].effectivity = rational(1n, 2n);
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        itemsStore.settings(),
        settingsStore.settings(),
        data,
      );
      const expected = spread(
        recipesStore.adjustedDataset().recipeRecord[
          RecipeId.SteelChest
        ] as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational(4n) },
          time: rational(100n, 321n),
          drain: rational(5n),
          consumption: rational(519n),
          pollution: rational(10553n, 12500n),
          effects: {
            consumption: rational(173n, 50n),
            pollution: rational(122n, 25n),
            productivity: rational(4n),
            speed: rational(107n, 50n),
            quality: rational(-29n, 500n),
          },
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should use minimum 20% effects', () => {
      const settings = spread(mocks.recipeSettings()[RecipeId.SteelChest]);
      settings.modules = [
        { count: rational(3n), id: ItemId.EfficiencyModule3 },
      ];
      // Set up efficiency module 3 to cause more than maximum effect in speed, consumption, and pollution
      const data = mocks.getAdjustedDataset();
      data.moduleRecord[ItemId.EfficiencyModule3].speed =
        data.moduleRecord[ItemId.EfficiencyModule3].consumption;
      data.moduleRecord[ItemId.EfficiencyModule3].pollution =
        data.moduleRecord[ItemId.EfficiencyModule3].consumption;
      settings.beacons = [
        {
          count: rational.zero,
          id: ItemId.Beacon,
          modules: [{ count: rational(2n), id: '' }],
        },
      ];
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        itemsStore.settings(),
        settingsStore.settings(),
        data,
      );
      const expected = spread(
        recipesStore.adjustedDataset().recipeRecord[
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
      const data = mocks.getAdjustedDataset();
      data.flags.add('minimumRecipeTime');
      data.recipeRecord[RecipeId.SteelChest] = spread(
        data.recipeRecord[RecipeId.SteelChest],
        { time: rational(1n, 10000n) },
      );
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        recipesStore.settings()[RecipeId.SteelChest],
        itemsStore.settings(),
        settingsStore.settings(),
        data,
      );
      expect(result.time).toEqual(rational(1n, 60n));
    });

    it('should find matching nonchemical fuel', () => {
      const result = service.adjustRecipe(
        RecipeId.DepletedUraniumFuelCell,
        recipesStore.settings()[RecipeId.DepletedUraniumFuelCell],
        itemsStore.settings(),
        settingsStore.settings(),
        recipesStore.adjustedDataset(),
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(rational(1n, 200n));
    });

    it('should find non-matching nonchemical fuel', () => {
      const data = spread(recipesStore.adjustedDataset(), {
        recipeRecord: spread(recipesStore.adjustedDataset().recipeRecord, {
          [RecipeId.DepletedUraniumFuelCell]: spread(
            recipesStore.adjustedDataset().recipeRecord[
              RecipeId.DepletedUraniumFuelCell
            ],
            { in: {}, out: {} },
          ),
        }),
      });
      const result = service.adjustRecipe(
        RecipeId.DepletedUraniumFuelCell,
        recipesStore.settings()[RecipeId.DepletedUraniumFuelCell],
        itemsStore.settings(),
        settingsStore.settings(),
        data,
      );
      expect(result.in[ItemId.UraniumFuelCell]).toEqual(rational(1n, 200n));
    });

    it('should adjust based on overclock', () => {
      const settings = spread(mocks.recipeSettings()[RecipeId.SteelChest]);
      settings.overclock = rational(200n);
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        itemsStore.settings(),
        settingsStore.settings(),
        recipesStore.adjustedDataset(),
      );
      const expected = spread(
        recipesStore.adjustedDataset().recipeRecord[
          RecipeId.SteelChest
        ] as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(1n, 3n),
          drain: rational(5n),
          consumption: rational(136838616n, 364903n),
          pollution: rational(1n, 20n),
          effects: spread(mockModuleEffects, { speed: rational(2n) }),
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should adjust a power producer based on overclock', () => {
      const settings = spread(mocks.recipeSettings()[RecipeId.SteelChest]);
      settings.overclock = rational(200n);
      const data = mocks.getDataset();
      data.machineRecord[ItemId.AssemblingMachine2].usage = rational(-10n);
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        itemsStore.settings(),
        settingsStore.settings(),
        data,
      );
      const expected = spread(
        recipesStore.adjustedDataset().recipeRecord[
          RecipeId.SteelChest
        ] as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(1n, 3n),
          drain: rational(5n),
          consumption: rational(-20n),
          pollution: rational(1n, 20n),
          effects: spread(mockModuleEffects, { speed: rational(2n) }),
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should use a recipe specific usage', () => {
      const settings = spread(mocks.recipeSettings()[RecipeId.SteelChest]);
      const data = mocks.getDataset();
      data.recipeRecord[RecipeId.SteelChest].usage = rational(10000n);
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        itemsStore.settings(),
        settingsStore.settings(),
        data,
      );
      const expected = spread(
        recipesStore.adjustedDataset().recipeRecord[
          RecipeId.SteelChest
        ] as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational.one },
          time: rational(2n, 3n),
          drain: rational(5n),
          consumption: rational(10000n),
          pollution: rational(1n, 20n),
          effects: mockModuleEffects,
          usage: rational(10000n),
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should calculate proliferator usage', () => {
      const settings = spread(recipesStore.settings()[ItemId.SteelChest], {
        modules: [{ count: rational.one, id: ItemId.ProductivityModule3 }],
      });
      const data = mocks.getDataset();
      const recipe = data.recipeRecord[RecipeId.SteelChest];
      recipe.in[ItemId.ProductivityModule] = rational.one;
      data.moduleRecord[ItemId.ProductivityModule3].sprays = rational(10n);
      data.moduleRecord[ItemId.ProductivityModule3].proliferator =
        ItemId.ProductivityModule3;
      data.moduleRecord[ItemId.ProductivityModule].sprays = rational(10n);
      data.moduleRecord[ItemId.ProductivityModule].proliferator =
        ItemId.ProductivityModule;
      data.beaconRecord[ItemId.Beacon].profile = undefined;
      data.beaconRecord[ItemId.Beacon].effectivity = rational(1n, 2n);
      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        itemsStore.settings(),
        spread(settingsStore.settings(), {
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
          quality: rational(-1n, 5n),
        },
        produces: new Set(),
        output: {},
      });
      expect(result).toEqual(expected);
    });

    it('should add machine consumption', () => {
      const data = mocks.getDataset();
      data.machineRecord[ItemId.AssemblingMachine2].consumption = {
        [ItemId.Coal]: rational.one,
      };
      const result = service.adjustRecipe(
        RecipeId.CopperCable,
        mocks.recipeSettings()[RecipeId.CopperCable],
        itemsStore.settings(),
        settingsStore.settings(),
        data,
      );
      const expected = spread(
        settingsStore.dataset().recipeRecord[
          RecipeId.CopperCable
        ] as AdjustedRecipe,
        {
          in: {
            [ItemId.CopperPlate]: rational.one,
            [ItemId.Coal]: rational(1n, 90n),
          },
          time: rational(2n, 3n),
          drain: rational(5n),
          consumption: rational(150n),
          pollution: rational(1n, 20n),
          effects: mockModuleEffects,
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should reduce net production to output only', () => {
      const data = mocks.getDataset();
      data.recipeRecord[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] =
        rational.one;
      data.recipeRecord[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] =
        rational(2n);
      const result = service.adjustRecipe(
        RecipeId.CoalLiquefaction,
        mocks.recipeSettings()[RecipeId.CoalLiquefaction],
        itemsStore.settings(),
        spread(settingsStore.settings(), { netProductionOnly: true }),
        data,
      );
      expect(result.in[ItemId.HeavyOil]).toBeUndefined();
      expect(result.out[ItemId.HeavyOil]).toEqual(rational.one);
    });

    it('should reduce net production to input only', () => {
      const data = mocks.getDataset();
      data.recipeRecord[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] =
        rational(2n);
      data.recipeRecord[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] =
        rational.one;
      const result = service.adjustRecipe(
        RecipeId.CoalLiquefaction,
        mocks.recipeSettings()[RecipeId.CoalLiquefaction],
        itemsStore.settings(),
        spread(settingsStore.settings(), { netProductionOnly: true }),
        data,
      );
      expect(result.in[ItemId.HeavyOil]).toEqual(rational.one);
      expect(result.out[ItemId.HeavyOil]).toBeUndefined();
    });

    it('should reduce net production to no input/output', () => {
      const data = mocks.getDataset();
      data.recipeRecord[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] =
        rational.one;
      data.recipeRecord[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] =
        rational.one;
      const result = service.adjustRecipe(
        RecipeId.CoalLiquefaction,
        mocks.recipeSettings()[RecipeId.CoalLiquefaction],
        itemsStore.settings(),
        spread(settingsStore.settings(), { netProductionOnly: true }),
        data,
      );
      expect(result.in[ItemId.HeavyOil]).toBeUndefined();
      expect(result.out[ItemId.HeavyOil]).toBeUndefined();
    });

    it('should calculate machine speed based on belt speed if undefined', () => {
      const data = mocks.getDataset();
      data.machineRecord[ItemId.AssemblingMachine2].speed = undefined;
      const itemsState = spread(itemsStore.settings(), {
        [ItemId.ElectronicCircuit]: spread(
          itemsStore.settings()[ItemId.ElectronicCircuit],
          { beltId: undefined },
        ),
      });
      const result = service.adjustRecipe(
        RecipeId.ElectronicCircuit,
        mocks.recipeSettings()[RecipeId.ElectronicCircuit],
        itemsState,
        settingsStore.settings(),
        data,
      );
      const expected = spread(
        recipesStore.adjustedDataset().recipeRecord[
          RecipeId.ElectronicCircuit
        ] as AdjustedRecipe,
        {
          out: { [ItemId.ElectronicCircuit]: rational.one },
          time: rational(1n, 90n),
          drain: rational(5n),
          consumption: rational(150n),
          pollution: rational(1n, 20n),
          effects: mockModuleEffects,
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    it('should adjust based on Satisfactory Somersloop implementation', () => {
      const data = mocks.getDataset();
      data.flags = new Set([
        'consumptionAsDrain',
        'overclock',
        'power',
        'resourcePurity',
        'somersloop',
      ]);
      data.moduleRecord[ItemId.Somersloop] = {
        productivity: rational(1n),
        consumption: rational(1n),
      };
      const settings = spread(mocks.recipeSettings()[RecipeId.SteelChest], {
        overclock: rational(100n),
        modules: [{ id: ItemId.Somersloop, count: rational(2n) }],
      });

      const result = service.adjustRecipe(
        RecipeId.SteelChest,
        settings,
        itemsStore.settings(),
        settingsStore.settings(),
        data,
      );

      const expected: AdjustedRecipe = spread(
        recipesStore.adjustedDataset().recipeRecord[
          RecipeId.SteelChest
        ] as unknown as AdjustedRecipe,
        {
          out: { [ItemId.SteelChest]: rational(2n) },
          time: rational(2n, 3n),
          drain: rational(600n),
          pollution: rational(1n, 5n),
          effects: spread(mockModuleEffects, {
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
      const data = mocks.getDataset();
      data.machineRecord[ItemId.AssemblingMachine2].baseEffect = {
        consumption: rational(1n, 2n),
        pollution: rational(1n, 2n),
        productivity: rational(1n, 2n),
        quality: rational(1n, 2n),
        speed: rational(1n, 2n),
      };
      const result = service.adjustRecipe(
        RecipeId.CopperCable,
        mocks.recipeSettings()[RecipeId.CopperCable],
        itemsStore.settings(),
        settingsStore.settings(),
        data,
      );
      const expected = spread(
        settingsStore.dataset().recipeRecord[
          RecipeId.CopperCable
        ] as AdjustedRecipe,
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
      const data = mocks.getDataset();
      data.moduleRecord[ItemId.SpeedModule3].speed = rational.zero;
      data.moduleRecord[ItemId.SpeedModule3].quality = rational(1n, 40n);
      data.qualityIds = [
        'negative',
        'normal',
        'uncommon',
        'rare',
        'epic',
        'legendary',
      ];
      data.qualityRecord = {
        negative: { id: 'negative', name: 'Negative', level: -1 },
        normal: { id: 'normal', name: 'Normal', level: 0 },
        uncommon: { id: 'uncommon', name: 'Uncommon', level: 1 },
        rare: { id: 'rare', name: 'Rare', level: 2 },
        epic: { id: 'epic', name: 'Epic', level: 3 },
        legendary: { id: 'legendary', name: 'Legendary', level: 5 },
      };
      const recipeSettings = spread(
        recipesStore.settings()[RecipeId.FirearmMagazine],
        { beacons: undefined },
      );
      const settings = spread(settingsStore.settings(), {
        quality: { id: 'legendary', name: 'Legendary', level: 5 },
      });
      const result = service.adjustRecipe(
        RecipeId.FirearmMagazine,
        recipeSettings,
        itemsStore.settings(),
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
      const data = mocks.getDataset();
      data.qualityIds = ['normal', 'uncommon', 'rare', 'epic', 'legendary'];
      data.qualityRecord = {
        normal: { id: 'normal', name: 'Normal', level: 0 },
        uncommon: { id: 'uncommon', name: 'Uncommon', level: 1 },
        rare: { id: 'rare', name: 'Rare', level: 2 },
        epic: { id: 'epic', name: 'Epic', level: 3 },
        legendary: { id: 'legendary', name: 'Legendary', level: 5 },
      };
      data.moduleRecord[ItemId.ProductivityModule3].quality = rational.one;
      data.moduleRecord[ItemId.SpeedModule3].quality = rational.one;
      const settings = spread(settingsStore.settings(), {
        quality: { id: 'legendary', name: 'Legendary', level: 5 },
      });
      const result = service.adjustRecipe(
        RecipeId.BasicOilProcessing,
        recipesStore.settings()[RecipeId.BasicOilProcessing],
        itemsStore.settings(),
        settings,
        data,
      );
      expect(Object.keys(result.out).length).toEqual(1);
    });

    it('should adjust for ingredientUsage', () => {
      const data = mocks.getDataset();
      data.machineRecord[ItemId.Lab].ingredientUsage = rational(1n, 2n);
      const result = service.adjustRecipe(
        RecipeId.ArtilleryShellRange,
        recipesStore.settings()[RecipeId.ArtilleryShellRange],
        itemsStore.settings(),
        settingsStore.settings(),
        data,
      );
      expect(result.in[ItemId.SpaceSciencePack]).toEqual(rational(1n, 2n));
    });

    it('should adjust for recipe productivity', () => {
      const recipeSettings = spread(
        recipesStore.settings()[RecipeId.SteelPlate],
        { productivity: rational(50n) },
      );
      const result = service.adjustRecipe(
        RecipeId.SteelPlate,
        recipeSettings,
        itemsStore.settings(),
        settingsStore.settings(),
        settingsStore.dataset(),
      );
      expect(result.out[ItemId.SteelPlate]).toEqual(rational(17n, 10n));
    });
  });

  describe('adjustLaunchRecipeObjective', () => {
    it('should skip non-launch objectives', () => {
      const recipe = spread(
        settingsStore.dataset().recipeRecord[RecipeId.IronPlate],
      );
      const time = recipe.time;

      // No recipe part
      service.adjustLaunchRecipeObjective(
        recipe,
        recipesStore.settings(),
        recipesStore.adjustedDataset(),
      );
      expect(recipe.time).toEqual(time);

      // No silo
      recipe.part = ItemId.IronPlate;
      service.adjustLaunchRecipeObjective(
        recipe,
        recipesStore.settings(),
        recipesStore.adjustedDataset(),
      );
      expect(recipe.time).toEqual(time);

      // No machine id
      const settings = mocks.getRecipesState();
      delete settings[RecipeId.IronPlate].machineId;
      service.adjustLaunchRecipeObjective(
        recipe,
        settings,
        recipesStore.adjustedDataset(),
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
        itemsStore.settings(),
        settingsStore.settings(),
        settingsStore.dataset(),
      );
      service.adjustLaunchRecipeObjective(
        recipe,
        recipesStore.settings(),
        recipesStore.adjustedDataset(),
      );
      expect(recipe.time).toEqual(rational(9375n, 203n));
    });
  });

  describe('adjustSiloRecipes', () => {
    let adjustedRecipe: Record<string, AdjustedRecipe>;

    beforeEach(() => {
      adjustedRecipe = settingsStore
        .dataset()
        .recipeIds.reduce((e: Record<string, AdjustedRecipe>, i) => {
          e[i] = service.adjustRecipe(
            i,
            recipesStore.settings()[i],
            itemsStore.settings(),
            settingsStore.settings(),
            settingsStore.dataset(),
          );
          return e;
        }, {});
    });

    it('should adjust recipes', () => {
      const result = service.adjustSiloRecipes(
        adjustedRecipe,
        recipesStore.settings(),
        settingsStore.dataset(),
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        rational(9375n, 203n),
      );
      expect(result[RecipeId.RocketPart].time).toEqual(rational(75n, 116n));
    });

    it('should handle invalid machine', () => {
      const settings2 = spread(recipesStore.settings(), {
        [RecipeId.SpaceSciencePack]: {
          machineId: 'id',
        },
      });
      const result = service.adjustSiloRecipes(
        adjustedRecipe,
        settings2,
        settingsStore.dataset(),
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        rational(203n, 5n),
      );
      expect(result[RecipeId.RocketPart].time).toEqual(rational(75n, 116n));
    });

    it('should handle missing machine id', () => {
      const settings2 = spread(recipesStore.settings(), {
        [RecipeId.SpaceSciencePack]: {
          machineId: '',
        },
      });
      const result = service.adjustSiloRecipes(
        adjustedRecipe,
        settings2,
        settingsStore.dataset(),
      );
      expect(result[RecipeId.SpaceSciencePack].time).toEqual(
        rational(203n, 5n),
      );
      expect(result[RecipeId.RocketPart].time).toEqual(rational(75n, 116n));
    });
  });

  describe('allowsModules', () => {
    it('should check machine and rocket recipes', () => {
      // Silo recipes
      expect(
        service.allowsModules(
          recipesStore.adjustedDataset().recipeRecord[RecipeId.RocketPart],
          recipesStore.adjustedDataset().machineRecord[ItemId.RocketSilo],
        ),
      ).toBeTrue();
      expect(
        service.allowsModules(
          recipesStore.adjustedDataset().recipeRecord[
            RecipeId.SpaceSciencePack
          ],
          recipesStore.adjustedDataset().machineRecord[ItemId.RocketSilo],
        ),
      ).toBeFalse();
      // Normal recipes
      expect(
        service.allowsModules(
          recipesStore.adjustedDataset().recipeRecord[ItemId.Coal],
          recipesStore.adjustedDataset().machineRecord[
            ItemId.ElectricMiningDrill
          ],
        ),
      ).toBeTrue();
      expect(
        service.allowsModules(
          recipesStore.adjustedDataset().recipeRecord[ItemId.Coal],
          recipesStore.adjustedDataset().machineRecord[
            ItemId.BurnerMiningDrill
          ],
        ),
      ).toBeFalse();
    });
  });

  describe('adjustDataset', () => {
    it('should adjust recipes and silo recipes', () => {
      const data = recipesStore.adjustedDataset();
      spyOn(service, 'adjustSiloRecipes').and.callThrough();
      spyOn(service, 'adjustRecipe').and.callThrough();
      const result = service.adjustDataset(
        recipesStore.settings(),
        itemsStore.settings(),
        settingsStore.settings(),
        data,
      );
      expect(result).toBeTruthy();
      expect(service.adjustSiloRecipes).toHaveBeenCalledTimes(1);
      expect(service.adjustRecipe).toHaveBeenCalledTimes(
        recipesStore.adjustedDataset().recipeIds.length,
      );
    });
  });

  describe('adjustCosts', () => {
    let adjustedRecipe: Record<string, Recipe>;

    beforeEach(() => {
      adjustedRecipe = service.adjustRecipes(
        recipesStore.settings(),
        itemsStore.settings(),
        settingsStore.settings(),
        recipesStore.adjustedDataset(),
      );
    });

    it('should apply an overridden cost', () => {
      const recipeSettings = spread(recipesStore.settings(), {
        [RecipeId.Coal]: spread(recipesStore.settings()[RecipeId.Coal], {
          cost: rational(2n),
        }),
      });
      service.adjustCosts(
        adjustedRecipe,
        recipeSettings,
        initialSettingsState.costs,
        recipesStore.adjustedDataset(),
      );
      expect(adjustedRecipe[RecipeId.Coal].cost).toEqual(rational(2n));
    });

    it('should apply normal recipe and machine costs', () => {
      service.adjustCosts(
        adjustedRecipe,
        recipesStore.settings(),
        initialSettingsState.costs,
        recipesStore.adjustedDataset(),
      );
      expect(adjustedRecipe[RecipeId.Coal].cost).toEqual(rational(8143n, 20n));
      expect(adjustedRecipe[RecipeId.CopperCable].cost).toEqual(rational(9n));
    });

    it('should adjust recycling cost', () => {
      adjustedRecipe[RecipeId.Coal] = spread(adjustedRecipe[RecipeId.Coal], {
        flags: new Set<RecipeFlag>(['recycling']),
      });
      service.adjustCosts(
        adjustedRecipe,
        recipesStore.settings(),
        spread(initialSettingsState.costs, { recycling: rational.zero }),
        recipesStore.adjustedDataset(),
      );
      expect(adjustedRecipe[RecipeId.Coal].cost).toEqual(rational.zero);
    });
  });

  describe('finalizeData', () => {
    it('should filter out recipe ids that are not viable', () => {
      const adjustedRecipe = mocks.getAdjustedDataset().adjustedRecipe;
      adjustedRecipe[RecipeId.IronOre].output = {
        [ItemId.IronPlate]: rational(-50n),
        [ItemId.Concrete]: rational(-50n),
      };
      adjustedRecipe[RecipeId.IronPlate].output = {
        [ItemId.ElectronicCircuit]: rational(-50n),
        [ItemId.IronPlate]: rational.one,
      };
      const keepSet = new Set<string>([
        RecipeId.ElectronicCircuit,
        RecipeId.IronOre,
        RecipeId.IronPlate,
        RecipeId.Concrete,
      ]);
      Object.keys(adjustedRecipe).forEach((k) => {
        if (!keepSet.has(k)) delete adjustedRecipe[k];
      });
      const data = mocks.getDataset();
      data.itemIds = data.itemIds.filter((i) => i !== ItemId.ElectronicCircuit);
      data.itemIds.unshift(ItemId.ElectronicCircuit);
      const result = service.finalizeData(
        {},
        adjustedRecipe,
        settingsStore.settings(),
        data,
      );
      expect(result.itemAvailableRecipeIds[ItemId.IronPlate].length).toEqual(0);
      expect(result.itemAvailableRecipeIds[ItemId.Concrete].length).toEqual(0);
      expect(
        result.itemAvailableRecipeIds[ItemId.ElectronicCircuit].length,
      ).toEqual(1);
    });
  });

  describe('computeRecipeSettings', () => {
    it('should remove the total field if no beacons are present', () => {
      const settings: RecipeSettings = {
        beacons: [{ total: rational.one, count: rational.zero }],
        machineId: ItemId.AssemblingMachine3,
      };
      service.computeRecipeSettings(
        settings,
        settingsStore.dataset().recipeRecord[RecipeId.ElectronicCircuit],
        machinesStore.settings(),
        settingsStore.settings(),
        settingsStore.dataset(),
      );
      expect(settings.beacons?.[0].total).toBeUndefined();
    });
  });

  describe('adjustObjective', () => {
    it('should return an item objective unaltered', () => {
      expect(
        service.adjustObjective(
          mockObjective1,
          itemsStore.settings(),
          recipesStore.settings(),
          machinesStore.settings(),
          settingsStore.settings(),
          recipesStore.adjustedDataset(),
        ),
      ).toEqual(mockObjective1);
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
        itemsStore.settings(),
        recipesStore.settings(),
        machinesStore.settings(),
        settingsStore.settings(),
        recipesStore.adjustedDataset(),
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
          targetId: RecipeId.DepletedUraniumFuelCell,
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          fuelId: ItemId.Coal,
        },
        itemsStore.settings(),
        recipesStore.settings(),
        machinesStore.settings(),
        settingsStore.settings(),
        recipesStore.adjustedDataset(),
      );
      expect(result.fuelId).toEqual(ItemId.UraniumFuelCell);
    });
  });
});
