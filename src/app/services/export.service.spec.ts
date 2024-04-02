import { TestBed } from '@angular/core/testing';

import { ItemId, Mocks, RecipeId, TestModule } from 'src/tests';
import { Rational, Step } from '~/models';
import { ExportService } from './export.service';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('saveAsCsv', () => {
    it('should save the csv', () => {
      spyOn(service, 'saveAsCsv');
      service.stepsToCsv(Mocks.Steps);
      expect(service.saveAsCsv).toHaveBeenCalled();
    });
  });

  describe('stepToJson', () => {
    const itemId = ItemId.IronPlate;
    const recipeId = RecipeId.IronPlate;
    const inStep: Step = {
      id: '0',
      itemId: ItemId.IronOre,
      recipeId: RecipeId.IronPlate,
      parents: { ['1']: Rational.one },
    };
    const fullStep: Step = {
      id: '1',
      itemId,
      items: Rational.from(3),
      surplus: Rational.two,
      belts: Rational.from(3),
      wagons: Rational.from(4),
      machines: Rational.from(5),
      power: Rational.from(6),
      pollution: Rational.from(7),
      outputs: { [itemId]: Rational.from(8) },
      parents: { ['1']: Rational.from(9) },
      recipeId,
    };
    const minStep: Step = {
      id: '2',
      itemId: itemId,
      recipeId: recipeId,
    };

    it('should fill in all fields', () => {
      const result = service.stepToJson(fullStep, [inStep, fullStep]);
      expect(result).toEqual({
        Item: itemId,
        Items: '=1',
        Surplus: '=2',
        Inputs: '"iron-ore:1"',
        Outputs: '"iron-plate:8"',
        Targets: '"iron-plate:9"',
        Belts: '=3',
        Belt: ItemId.TransportBelt,
        Wagons: '=4',
        Wagon: ItemId.CargoWagon,
        Recipe: recipeId,
        Machines: '=5',
        Machine: ItemId.ElectricFurnace,
        Modules: '"module,module"',
        Beacons: '"0"',
        Beacon: '"beacon"',
        BeaconModules: '"module|module"',
        Power: '=6',
        Pollution: '=7',
      });
    });

    it('should handle empty fields', () => {
      const result = service.stepToJson(minStep, [minStep]);
      expect(result).toEqual({
        Item: itemId,
        Belt: ItemId.TransportBelt,
        Wagon: ItemId.CargoWagon,
        Recipe: recipeId,
        Machine: ItemId.ElectricFurnace,
        Modules: '"module,module"',
        Beacons: '"0"',
        Beacon: '"beacon"',
        BeaconModules: '"module|module"',
      });
    });
  });
});
