import { TestBed } from '@angular/core/testing';

import { AdjustedRecipe } from '~/data/schema/recipe';
import { rational } from '~/rational/rational';
import { ItemId } from '~/tests/item-id';
import { Mocks } from '~/tests/mocks/mocks';
import { mockModuleEffects } from '~/tests/mocks/module';
import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';
import { spread } from '~/utils/object';

import { Adjustment } from './adjustment';
import { ItemsStore } from './items/items-store';
import { RecipesStore } from './recipes/recipes-store';
import { SettingsStore } from './settings/settings-store';

describe('Adjustment', () => {
  let service: Adjustment;
  let recipesStore: RecipesStore;
  let itemsStore: ItemsStore;
  let settingsStore: SettingsStore;
  let mocks: Mocks;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(Adjustment);
    recipesStore = TestBed.inject(RecipesStore);
    itemsStore = TestBed.inject(ItemsStore);
    settingsStore = TestBed.inject(SettingsStore);
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

    xit('should handle modules and beacons', () => {
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
            quality: rational.zero,
          },
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    xit('should handle modules and diminishing beacons', () => {
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
      const data = spread(recipesStore.adjustedDataset(), {
        beaconRecord: spread(recipesStore.adjustedDataset().beaconRecord, {
          [ItemId.Beacon]: spread(
            recipesStore.adjustedDataset().beaconRecord[ItemId.Beacon],
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
        moduleRecord: spread(recipesStore.adjustedDataset().moduleRecord, {
          // To verify all factors work in beacons
          [ItemId.SpeedModule]: spread(
            recipesStore.adjustedDataset().moduleRecord[ItemId.SpeedModule],
            { productivity: rational.one, pollution: rational.one },
          ),
          // To verify null consumption works
          [ItemId.ProductivityModule]: spread(
            recipesStore.adjustedDataset().moduleRecord[
              ItemId.ProductivityModule
            ],
            { consumption: undefined },
          ),
        }),
      });
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
            quality: rational.zero,
          },
          produces: new Set(),
          output: {},
        },
      );
      expect(result).toEqual(expected);
    });

    // it('should use minimum 20% effects', () => {
    //   const settings = spread(mocks.recipeSettings()[RecipeId.SteelChest]);
    //   settings.modules = [
    //     { count: rational(3n), id: ItemId.EfficiencyModule3 },
    //   ];
    //   // Set up efficiency module 3 to cause more than maximum effect in speed, consumption, and pollution
    //   const data = spread(recipesStore.adjustedDataset(), {
    //     moduleEntities: spread(recipesStore.adjustedDataset().moduleEntities, {
    //       [ItemId.EfficiencyModule3]: spread(
    //         recipesStore.adjustedDataset().moduleEntities[ItemId.EfficiencyModule3],
    //         {
    //           speed:
    //             recipesStore.adjustedDataset().moduleEntities[ItemId.EfficiencyModule3]
    //               .consumption,
    //           pollution:
    //             recipesStore.adjustedDataset().moduleEntities[ItemId.EfficiencyModule3]
    //               .consumption,
    //         },
    //       ),
    //     }),
    //   });
    //   settings.beacons = [
    //     {
    //       count: rational.zero,
    //       id: ItemId.Beacon,
    //       modules: [{ count: rational(2n), id: ItemId.Module }],
    //     },
    //   ];
    //   const result = service.adjustRecipe(
    //     RecipeId.SteelChest,
    //     settings,
    //     itemsStore.settings(),
    //     settingsStore.settings(),
    //     data,
    //   );
    //   const expected = spread(
    //     recipesStore.adjustedDataset().recipeRecord[
    //       RecipeId.SteelChest
    //     ] as AdjustedRecipe,
    //     {
    //       out: { [ItemId.SteelChest]: rational.one },
    //       time: rational(10n, 3n),
    //       drain: rational(5n),
    //       consumption: rational(30n),
    //       pollution: rational(1n, 500n),
    //       effects: {
    //         consumption: rational(1n, 5n),
    //         pollution: rational(1n, 5n),
    //         productivity: rational.one,
    //         speed: rational(1n, 5n),
    //         quality: rational.zero,
    //       },
    //       produces: new Set(),
    //       output: {},
    //     },
    //   );
    //   expect(result).toEqual(expected);
    // });

    // it('should use minimum 1/60 second time in Factorio', () => {
    //   const data = Mocks.getAdjustedDataset();
    //   data.recipeRecord[RecipeId.SteelChest] = spread(
    //     data.recipeRecord[RecipeId.SteelChest],
    //     { time: rational(1n, 10000n) },
    //   );
    //   const result = service.adjustRecipe(
    //     RecipeId.SteelChest,
    //     mocks.recipeSettings()Initial[RecipeId.SteelChest],
    //     itemsStore.settings(),
    //     settingsStore.settings(),
    //     data,
    //   );
    //   expect(result.time).toEqual(rational(1n, 60n));
    // });

    // it('should find matching nonchemical fuel', () => {
    //   const result = service.adjustRecipe(
    //     RecipeId.UsedUpUraniumFuelCell,
    //     mocks.recipeSettings()Initial[RecipeId.UsedUpUraniumFuelCell],
    //     itemsStore.settings(),
    //     settingsStore.settings(),
    //     recipesStore.adjustedDataset(),
    //   );
    //   expect(result.in[ItemId.UraniumFuelCell]).toEqual(rational(1n, 200n));
    // });

    // it('should find non-matching nonchemical fuel', () => {
    //   const data = spread(recipesStore.adjustedDataset(), {
    //     recipeRecord: spread(recipesStore.adjustedDataset().recipeRecord, {
    //       [RecipeId.UsedUpUraniumFuelCell]: spread(
    //         recipesStore.adjustedDataset().recipeRecord[
    //           RecipeId.UsedUpUraniumFuelCell
    //         ],
    //         { in: {}, out: {} },
    //       ),
    //     }),
    //   });
    //   const result = service.adjustRecipe(
    //     RecipeId.UsedUpUraniumFuelCell,
    //     mocks.recipeSettings()Initial[RecipeId.UsedUpUraniumFuelCell],
    //     itemsStore.settings(),
    //     settingsStore.settings(),
    //     data,
    //   );
    //   expect(result.in[ItemId.UraniumFuelCell]).toEqual(rational(1n, 200n));
    // });

    // it('should adjust based on overclock', () => {
    //   const settings = spread(mocks.recipeSettings()[RecipeId.SteelChest]);
    //   settings.overclock = rational(200n);
    //   const result = service.adjustRecipe(
    //     RecipeId.SteelChest,
    //     settings,
    //     itemsStore.settings(),
    //     settingsStore.settings(),
    //     recipesStore.adjustedDataset(),
    //   );
    //   const expected = spread(
    //     recipesStore.adjustedDataset().recipeRecord[
    //       RecipeId.SteelChest
    //     ] as AdjustedRecipe,
    //     {
    //       out: { [ItemId.SteelChest]: rational.one },
    //       time: rational(1n, 3n),
    //       drain: rational(5n),
    //       consumption: rational(136838616n, 364903n),
    //       pollution: rational(1n, 20n),
    //       effects: spread(mockModuleEffects, { speed: rational(2n) }),
    //       produces: new Set(),
    //       output: {},
    //     },
    //   );
    //   expect(result).toEqual(expected);
    // });

    // it('should adjust a power producer based on overclock', () => {
    //   const settings = spread(mocks.recipeSettings()[RecipeId.SteelChest]);
    //   settings.overclock = rational(200n);
    //   const data = Mocks.getDataset();
    //   data.machineEntities[ItemId.AssemblingMachine2].usage = rational(-10n);
    //   const result = service.adjustRecipe(
    //     RecipeId.SteelChest,
    //     settings,
    //     itemsStore.settings(),
    //     settingsStore.settings(),
    //     data,
    //   );
    //   const expected = spread(
    //     recipesStore.adjustedDataset().recipeRecord[
    //       RecipeId.SteelChest
    //     ] as AdjustedRecipe,
    //     {
    //       out: { [ItemId.SteelChest]: rational.one },
    //       time: rational(1n, 3n),
    //       drain: rational(5n),
    //       consumption: rational(-20n),
    //       pollution: rational(1n, 20n),
    //       effects: spread(mockModuleEffects, { speed: rational(2n) }),
    //       produces: new Set(),
    //       output: {},
    //     },
    //   );
    //   expect(result).toEqual(expected);
    // });

    // it('should use a recipe specific usage', () => {
    //   const settings = spread(mocks.recipeSettings()[RecipeId.SteelChest]);
    //   const data = spread(Mocks.dataset, {
    //     recipeRecord: spread(Mocks.dataset.recipeRecord, {
    //       [RecipeId.SteelChest]: spread(
    //         Mocks.dataset.recipeRecord[RecipeId.SteelChest],
    //         { usage: rational(10000n) },
    //       ),
    //     }),
    //   });
    //   const result = service.adjustRecipe(
    //     RecipeId.SteelChest,
    //     settings,
    //     itemsStore.settings(),
    //     settingsStore.settings(),
    //     data,
    //   );
    //   const expected = spread(
    //     recipesStore.adjustedDataset().recipeRecord[
    //       RecipeId.SteelChest
    //     ] as AdjustedRecipe,
    //     {
    //       out: { [ItemId.SteelChest]: rational.one },
    //       time: rational(2n, 3n),
    //       drain: rational(5n),
    //       consumption: rational(10000n),
    //       pollution: rational(1n, 20n),
    //       effects: mockModuleEffects,
    //       usage: rational(10000n),
    //       produces: new Set(),
    //       output: {},
    //     },
    //   );
    //   expect(result).toEqual(expected);
    // });

    // it('should calculate proliferator usage', () => {
    //   const settings = spread(mocks.recipeSettings()Initial[ItemId.SteelChest], {
    //     modules: [{ count: rational.one, id: ItemId.ProductivityModule3 }],
    //   });
    //   const recipe = spread(Mocks.dataset.recipeRecord[RecipeId.SteelChest], {
    //     in: spread(Mocks.dataset.recipeRecord[RecipeId.SteelChest].in, {
    //       [ItemId.ProductivityModule]: rational.one,
    //     }),
    //   });
    //   const data = spread(Mocks.dataset, {
    //     recipeRecord: spread(Mocks.dataset.recipeRecord, {
    //       [RecipeId.SteelChest]: recipe,
    //     }),
    //     moduleEntities: spread(Mocks.dataset.moduleEntities, {
    //       [ItemId.ProductivityModule3]: spread(
    //         Mocks.dataset.moduleEntities[ItemId.ProductivityModule3],
    //         {
    //           sprays: rational(10n),
    //           proliferator: ItemId.ProductivityModule3,
    //         },
    //       ),
    //       [ItemId.ProductivityModule]: spread(
    //         Mocks.dataset.moduleEntities[ItemId.ProductivityModule],
    //         {
    //           sprays: rational(10n),
    //           proliferator: ItemId.ProductivityModule,
    //         },
    //       ),
    //     }),
    //   });
    //   const result = service.adjustRecipe(
    //     RecipeId.SteelChest,
    //     settings,
    //     itemsStore.settings(),
    //     spread(settingsStore.settings(), {
    //       proliferatorSprayId: ItemId.ProductivityModule,
    //     }),
    //     data,
    //   );
    //   const expected = spread(recipe as AdjustedRecipe, {
    //     in: {
    //       [ItemId.SteelPlate]: rational(8n),
    //       [ItemId.ProductivityModule]: rational(11n, 10n),
    //       [ItemId.ProductivityModule3]: rational(9n, 10n),
    //     },
    //     out: { [ItemId.SteelChest]: rational(11n, 10n) },
    //     time: rational(8n, 97n),
    //     drain: rational(25n, 2n),
    //     consumption: rational(2775n),
    //     pollution: rational(407n, 1500n),
    //     effects: {
    //       consumption: rational(37n, 5n),
    //       pollution: rational(11n, 10n),
    //       productivity: rational(11n, 10n),
    //       speed: rational(97n, 20n),
    //       quality: rational.zero,
    //     },
    //     produces: new Set(),
    //     output: {},
    //   });
    //   expect(result).toEqual(expected);
    // });

    // it('should add machine consumption', () => {
    //   const data = Mocks.getDataset();
    //   data.machineEntities[ItemId.AssemblingMachine2].consumption = {
    //     [ItemId.Coal]: rational.one,
    //   };
    //   const result = service.adjustRecipe(
    //     RecipeId.CopperCable,
    //     mocks.recipeSettings()[RecipeId.CopperCable],
    //     itemsStore.settings(),
    //     settingsStore.settings(),
    //     data,
    //   );
    //   const expected = spread(
    //     Mocks.dataset.recipeRecord[RecipeId.CopperCable] as AdjustedRecipe,
    //     {
    //       in: {
    //         [ItemId.CopperPlate]: rational.one,
    //         [ItemId.Coal]: rational(1n, 90n),
    //       },
    //       time: rational(2n, 3n),
    //       drain: rational(5n),
    //       consumption: rational(150n),
    //       pollution: rational(1n, 20n),
    //       effects: mockModuleEffects,
    //       produces: new Set(),
    //       output: {},
    //     },
    //   );
    //   expect(result).toEqual(expected);
    // });

    // it('should reduce net production to output only', () => {
    //   const data = Mocks.getDataset();
    //   data.recipeRecord[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] =
    //     rational.one;
    //   data.recipeRecord[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] =
    //     rational(2n);
    //   const result = service.adjustRecipe(
    //     RecipeId.CoalLiquefaction,
    //     mocks.recipeSettings()[RecipeId.CoalLiquefaction],
    //     itemsStore.settings(),
    //     spread(settingsStore.settings(), { netProductionOnly: true }),
    //     data,
    //   );
    //   expect(result.in[ItemId.HeavyOil]).toBeUndefined();
    //   expect(result.out[ItemId.HeavyOil]).toEqual(rational.one);
    // });

    // it('should reduce net production to input only', () => {
    //   const data = Mocks.getDataset();
    //   data.recipeRecord[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] =
    //     rational(2n);
    //   data.recipeRecord[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] =
    //     rational.one;
    //   const result = service.adjustRecipe(
    //     RecipeId.CoalLiquefaction,
    //     mocks.recipeSettings()[RecipeId.CoalLiquefaction],
    //     itemsStore.settings(),
    //     spread(settingsStore.settings(), { netProductionOnly: true }),
    //     data,
    //   );
    //   expect(result.in[ItemId.HeavyOil]).toEqual(rational.one);
    //   expect(result.out[ItemId.HeavyOil]).toBeUndefined();
    // });

    // it('should reduce net production to no input/output', () => {
    //   const data = Mocks.getDataset();
    //   data.recipeRecord[RecipeId.CoalLiquefaction].in[ItemId.HeavyOil] =
    //     rational.one;
    //   data.recipeRecord[RecipeId.CoalLiquefaction].out[ItemId.HeavyOil] =
    //     rational.one;
    //   const result = service.adjustRecipe(
    //     RecipeId.CoalLiquefaction,
    //     mocks.recipeSettings()[RecipeId.CoalLiquefaction],
    //     itemsStore.settings(),
    //     spread(settingsStore.settings(), { netProductionOnly: true }),
    //     data,
    //   );
    //   expect(result.in[ItemId.HeavyOil]).toBeUndefined();
    //   expect(result.out[ItemId.HeavyOil]).toBeUndefined();
    // });

    // it('should calculate machine speed based on belt speed if undefined', () => {
    //   const data = Mocks.getDataset();
    //   data.machineEntities[ItemId.AssemblingMachine2].speed = undefined;
    //   const itemsState = spread(itemsStore.settings(), {
    //     [ItemId.ElectronicCircuit]: spread(
    //       itemsStore.settings()[ItemId.ElectronicCircuit],
    //       { beltId: undefined },
    //     ),
    //   });
    //   const result = service.adjustRecipe(
    //     RecipeId.ElectronicCircuit,
    //     mocks.recipeSettings()[RecipeId.ElectronicCircuit],
    //     itemsState,
    //     settingsStore.settings(),
    //     data,
    //   );
    //   const expected = spread(
    //     recipesStore.adjustedDataset().recipeRecord[
    //       RecipeId.ElectronicCircuit
    //     ] as AdjustedRecipe,
    //     {
    //       out: { [ItemId.ElectronicCircuit]: rational.one },
    //       time: rational(1n, 60n),
    //       drain: rational(5n),
    //       consumption: rational(150n),
    //       pollution: rational(1n, 20n),
    //       effects: mockModuleEffects,
    //       produces: new Set(),
    //       output: {},
    //     },
    //   );
    //   expect(result).toEqual(expected);
    // });

    // it('should adjust based on number of Final Factory duplicators', () => {
    //   const data = Mocks.getDataset();
    //   data.game = Game.FinalFactory;
    //   const settings = spread(mocks.recipeSettings()[RecipeId.SteelChest], {
    //     overclock: undefined,
    //   });

    //   const result = service.adjustRecipe(
    //     RecipeId.SteelChest,
    //     settings,
    //     itemsStore.settings(),
    //     settingsStore.settings(),
    //     data,
    //   );
    //   const expected: AdjustedRecipe = spread(
    //     recipesStore.adjustedDataset().recipeRecord[
    //       RecipeId.SteelChest
    //     ] as unknown as AdjustedRecipe,
    //     {
    //       out: { [ItemId.SteelChest]: rational(1n) },
    //       time: rational(2n, 3n),
    //       drain: rational(5n),
    //       consumption: rational(150n),
    //       pollution: rational(1n, 20n),
    //       effects: mockModuleEffects,
    //       produces: new Set(),
    //       output: {},
    //     },
    //   );
    //   expect(result).toEqual(expected);
    // });

    // it('should adjust based on Satisfactory Somersloop implementation', () => {
    //   const data = Mocks.getDataset();
    //   data.flags = flags.sfy;
    //   data.moduleEntities[ItemId.Somersloop] = {
    //     productivity: rational(1n),
    //     consumption: rational(1n),
    //   };
    //   const settings = spread(mocks.recipeSettings()[RecipeId.SteelChest], {
    //     overclock: rational(100n),
    //     modules: [{ id: ItemId.Somersloop, count: rational(2n) }],
    //   });

    //   const result = service.adjustRecipe(
    //     RecipeId.SteelChest,
    //     settings,
    //     itemsStore.settings(),
    //     settingsStore.settings(),
    //     data,
    //   );

    //   const expected: AdjustedRecipe = spread(
    //     recipesStore.adjustedDataset().recipeRecord[
    //       RecipeId.SteelChest
    //     ] as unknown as AdjustedRecipe,
    //     {
    //       out: { [ItemId.SteelChest]: rational(2n) },
    //       time: rational(2n, 3n),
    //       drain: rational(600n),
    //       pollution: rational(1n, 5n),
    //       effects: spread(mockModuleEffects, {
    //         consumption: rational(4n),
    //         productivity: rational(2n),
    //       }),
    //       produces: new Set(),
    //       output: {},
    //     },
    //   );
    //   expect(result).toEqual(expected);
    // });

    // it('should add machine base effects', () => {
    //   const data = Mocks.getDataset();
    //   data.machineEntities[ItemId.AssemblingMachine2].baseEffect = {
    //     consumption: rational(1n, 2n),
    //     pollution: rational(1n, 2n),
    //     productivity: rational(1n, 2n),
    //     quality: rational(1n, 2n),
    //     speed: rational(1n, 2n),
    //   };
    //   const result = service.adjustRecipe(
    //     RecipeId.CopperCable,
    //     mocks.recipeSettings()[RecipeId.CopperCable],
    //     itemsStore.settings(),
    //     settingsStore.settings(),
    //     data,
    //   );
    //   const expected = spread(
    //     Mocks.dataset.recipeRecord[RecipeId.CopperCable] as AdjustedRecipe,
    //     {
    //       out: { [ItemId.CopperCable]: rational(3n) },
    //       time: rational(4n, 9n),
    //       drain: rational(5n),
    //       consumption: rational(225n),
    //       pollution: rational(9n, 80n),
    //       effects: {
    //         consumption: rational(3n, 2n),
    //         pollution: rational(3n, 2n),
    //         productivity: rational(3n, 2n),
    //         quality: rational(1n, 2n),
    //         speed: rational(3n, 2n),
    //       },
    //       produces: new Set(),
    //       output: {},
    //     },
    //   );
    //   expect(result).toEqual(expected);
    // });

    // it('should handle quality', () => {
    //   const data = Mocks.getDataset();
    //   data.flags = flags.spa;
    //   data.moduleEntities[ItemId.SpeedModule3].speed = rational.zero;
    //   data.moduleEntities[ItemId.SpeedModule3].quality = rational(1n, 40n);
    //   const recipeSettings = spread(
    //     mocks.recipeSettings()Initial[RecipeId.FirearmMagazine],
    //     { beacons: undefined },
    //   );
    //   const settings = spread(settingsStore.settings(), {
    //     quality: Quality.Legendary,
    //   });
    //   const result = service.adjustRecipe(
    //     RecipeId.FirearmMagazine,
    //     recipeSettings,
    //     itemsStore.settings(),
    //     settings,
    //     data,
    //   );
    //   expect(result.out).toEqual({
    //     ['firearm-magazine']: rational(9n, 10n),
    //     ['firearm-magazine(1)']: rational(9n, 100n),
    //     ['firearm-magazine(2)']: rational(9n, 1000n),
    //     ['firearm-magazine(3)']: rational(9n, 10000n),
    //     ['firearm-magazine(5)']: rational(1n, 10000n),
    //   });
    // });

    // it('should ignore fluid quality', () => {
    //   const data = Mocks.getDataset();
    //   data.flags = flags.spa;
    //   data.moduleEntities[ItemId.ProductivityModule3].quality = rational.one;
    //   data.moduleEntities[ItemId.SpeedModule3].quality = rational.one;
    //   const settings = spread(settingsStore.settings(), {
    //     quality: Quality.Legendary,
    //   });
    //   const result = service.adjustRecipe(
    //     RecipeId.BasicOilProcessing,
    //     mocks.recipeSettings()Initial[RecipeId.BasicOilProcessing],
    //     itemsStore.settings(),
    //     settings,
    //     data,
    //   );
    //   expect(Object.keys(result.out).length).toEqual(1);
    // });

    // it('should adjust for ingredientUsage', () => {
    //   const data = Mocks.getDataset();
    //   data.machineEntities[ItemId.Lab].ingredientUsage = rational(1n, 2n);
    //   const result = service.adjustRecipe(
    //     RecipeId.ArtilleryShellRange,
    //     mocks.recipeSettings()Initial[RecipeId.ArtilleryShellRange],
    //     itemsStore.settings(),
    //     settingsStore.settings(),
    //     data,
    //   );
    //   expect(result.in[ItemId.SpaceSciencePack]).toEqual(rational(1n, 2n));
    // });

    // it('should adjust for recipe productivity', () => {
    //   const recipeSettings = spread(
    //     mocks.recipeSettings()Initial[RecipeId.SteelPlate],
    //     { productivity: rational(50n) },
    //   );
    //   const result = service.adjustRecipe(
    //     RecipeId.SteelPlate,
    //     recipeSettings,
    //     itemsStore.settings(),
    //     settingsStore.settings(),
    //     Mocks.dataset,
    //   );
    //   expect(result.out[ItemId.SteelPlate]).toEqual(rational(17n, 10n));
    // });
  });
});
