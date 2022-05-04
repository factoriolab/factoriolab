import { ItemId, Mocks, RecipeId } from 'src/tests';
import { ItemSettings, Rational, RecipeSettings, Step } from '~/models';
import * as Preferences from '~/store/preferences';
import { ExportUtility } from './export.utility';

describe('ExportUtility', () => {
  describe('saveAsCsv', () => {
    it('should save the csv', () => {
      spyOn(ExportUtility, 'saveAsCsv');
      ExportUtility.stepsToCsv(
        Mocks.Steps,
        Preferences.initialColumnsState,
        Mocks.ItemSettingsInitial,
        Mocks.RecipeSettingsInitial,
        Mocks.AdjustedData
      );
      expect(ExportUtility.saveAsCsv).toHaveBeenCalled();
    });
  });

  describe('stepToJson', () => {
    const itemId = ItemId.IronPlate;
    const recipeId = RecipeId.IronPlate;
    const inStep: Step = {
      id: '0',
      itemId: ItemId.IronOre,
      parents: { [recipeId]: Rational.one },
    };
    const fullStep: Step = {
      id: '1',
      itemId,
      items: Rational.from(3),
      surplus: Rational.two,
      belts: Rational.from(3),
      wagons: Rational.from(4),
      factories: Rational.from(5),
      power: Rational.from(6),
      pollution: Rational.from(7),
      outputs: { [itemId]: Rational.from(8) },
      parents: { [RecipeId.ElectronicCircuit]: Rational.from(9) },
      recipeId,
    };
    const minStep: Step = {
      id: '2',
      itemId: itemId,
      recipeId: recipeId,
    };
    const itemS: ItemSettings = {
      beltId: 'belt',
      wagonId: 'wagon',
    };
    const fullRecipe: RecipeSettings = {
      factoryId: ItemId.AssemblingMachine2,
      factoryModuleIds: ['a', 'b'],
      beaconCount: '8',
      beaconId: 'beacon',
      beaconModuleIds: ['c', 'd'],
    };

    it('should fill in all fields', () => {
      const result = ExportUtility.stepToJson(
        fullStep,
        [inStep, fullStep],
        Preferences.initialColumnsState,
        { [itemId]: itemS },
        { [recipeId]: fullRecipe },
        Mocks.AdjustedData
      );
      expect(result).toEqual({
        Item: itemId,
        Items: '=1',
        Surplus: '=2',
        Inputs: '"iron-ore:1"',
        Outputs: '"iron-plate:8"',
        Targets: '"electronic-circuit:9"',
        Belts: '=3',
        Belt: itemS.beltId,
        Wagons: '=4',
        Wagon: itemS.wagonId,
        Recipe: recipeId,
        Factories: '=5',
        Factory: fullRecipe.factoryId,
        FactoryModules: '"a,b"',
        Beacons: '8',
        Beacon: fullRecipe.beaconId,
        BeaconModules: '"c,d"',
        Power: '=6',
        Pollution: '=7',
      });
    });

    it('should handle empty fields', () => {
      const result = ExportUtility.stepToJson(
        minStep,
        [minStep],
        Preferences.initialColumnsState,
        { [itemId]: itemS },
        { [recipeId]: fullRecipe },
        Mocks.AdjustedData
      );
      expect(result).toEqual({
        Item: itemId,
        Belt: 'belt',
        Wagon: 'wagon',
        Recipe: recipeId,
        Factory: ItemId.AssemblingMachine2,
        FactoryModules: '"a,b"',
        Beacons: '8',
        Beacon: ItemId.Beacon,
        BeaconModules: '"c,d"',
      });
    });
  });
});
