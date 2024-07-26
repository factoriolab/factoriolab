import { TestBed } from '@angular/core/testing';

import { ItemId, Mocks, RecipeId, TestModule } from 'src/tests';
import { rational, Step } from '~/models';
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

  describe('stepsToCsv', () => {
    it('should save the csv', () => {
      spyOn(service, 'saveAsCsv');
      service.stepsToCsv(Mocks.Steps);
      expect(service.saveAsCsv).toHaveBeenCalled();
    });
  });

  describe('flowToJson', () => {
    it('should save the json', () => {
      spyOn(service, 'saveAsJson');
      service.flowToJson(Mocks.Flow);
      expect(service.saveAsJson).toHaveBeenCalled();
    });
  });

  describe('stepToJson', () => {
    const itemId = ItemId.IronPlate;
    const recipeId = RecipeId.IronPlate;
    const inStep: Step = {
      id: '0',
      itemId: ItemId.IronOre,
      recipeId: RecipeId.IronPlate,
      parents: { ['1']: rational(1n) },
    };
    const fullStep: Step = {
      id: '1',
      itemId,
      items: rational(3n),
      surplus: rational(2n),
      belts: rational(3n),
      wagons: rational(4n),
      machines: rational(5n),
      power: rational(6n),
      pollution: rational(7n),
      outputs: { [itemId]: rational(8n) },
      parents: { ['1']: rational(9n) },
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
        Modules: '"2 module"',
        Beacons: '"0 beacon (2 speed-module-3)"',
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
        Modules: '"2 module"',
        Beacons: '"0 beacon (2 speed-module-3)"',
      });
    });
  });
});
