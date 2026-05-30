import { TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { Step } from '~/solver/step';
import { initialColumnsState } from '~/state/preferences/columns-state';
import { ItemId } from '~/tests/item-id';
import { Mocks } from '~/tests/mocks/mocks';
import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';

import { Exporter } from './exporter';

describe('Exporter', () => {
  let service: Exporter;
  let mocks: Mocks;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(Exporter);
    mocks = TestBed.inject(Mocks);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('stepsToCsv', () => {
    it('should save the csv', () => {
      spyOn<any>(service, 'saveAsCsv');
      service.stepsToCsv(mocks.steps());
      expect(service['saveAsCsv']).toHaveBeenCalled();
    });
  });

  describe('flowToJson', () => {
    it('should save the json', () => {
      spyOn<any>(service, 'saveAsJson');
      service.flowToJson(mocks.flow());
      expect(service['saveAsJson']).toHaveBeenCalled();
    });
  });

  describe('stepToJson', () => {
    const itemId = ItemId.IronPlate;
    const recipeId = RecipeId.IronPlate;
    const inStep: Step = {
      id: '0',
      itemId: ItemId.IronOre,
      recipeId: RecipeId.IronPlate,
      parents: { ['1']: rational.one },
    };
    const fullStep: Step = {
      id: '1',
      itemId,
      items: rational(3n),
      surplus: rational(2n),
      belts: rational(3n),
      wagons: rational(4n),
      rockets: rational(1n, 2n),
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
      spyOn<any>(service, 'columnsState').and.returnValue({
        ...initialColumnsState,
        rockets: { show: true },
      });
      const result = service['stepToJson'](fullStep, [inStep, fullStep]);
      expect(result).toEqual({
        Item: itemId,
        Items: '=1',
        Surplus: '=2',
        Inputs: '"iron-ore:1"',
        Outputs: '"iron-plate:8"',
        Targets: '"iron-plate:9"',
        Belts: '=3',
        Belt: ItemId.ExpressTransportBelt,
        Wagons: '=4',
        Wagon: ItemId.CargoWagon,
        Rockets: '=0.5',
        Recipe: recipeId,
        Machines: '=5',
        Machine: ItemId.ElectricFurnace,
        Modules: `"2 ${ItemId.ProductivityModule3}"`,
        Beacons: `"2 ${ItemId.Beacon} (2 ${ItemId.SpeedModule3})"`,
        Power: '=6',
        Pollution: '=7',
      });
    });

    it('should handle empty fields', () => {
      const result = service['stepToJson'](minStep, [minStep]);
      expect(result).toEqual({
        Item: itemId,
        Belt: ItemId.ExpressTransportBelt,
        Wagon: ItemId.CargoWagon,
        Recipe: recipeId,
        Machine: ItemId.ElectricFurnace,
        Modules: `"2 ${ItemId.ProductivityModule3}"`,
        Beacons: `"2 ${ItemId.Beacon} (2 ${ItemId.SpeedModule3})"`,
      });
    });
  });
});
