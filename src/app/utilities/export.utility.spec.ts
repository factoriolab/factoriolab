import { ItemId, Mocks, RecipeId } from 'src/tests';
import {
  Step,
  Rational,
  ItemSettings,
  RecipeSettings,
  AllColumns,
} from '~/models';
import { initialColumnsState, ColumnsState } from '~/store/preferences';
import { ExportUtility } from './export.utility';

describe('ExportUtility', () => {
  const noCols = AllColumns.reduce((e: ColumnsState, c) => {
    e[c] = { show: false, precision: 1 };
    return e;
  }, {});

  describe('saveAsCsv', () => {
    it('should save the csv', () => {
      spyOn(ExportUtility, 'saveAsCsv');
      ExportUtility.stepsToCsv(
        Mocks.Steps,
        initialColumnsState,
        Mocks.ItemSettingsInitial,
        Mocks.RecipeSettingsInitial,
        Mocks.AdjustedData
      );
      expect(ExportUtility.saveAsCsv).toHaveBeenCalled();
    });
  });

  describe('stepToJson', () => {
    const itemId = ItemId.Coal;
    const recipeId = RecipeId.Coal;
    const fullStep: Step = {
      itemId,
      items: Rational.one,
      surplus: Rational.two,
      belts: new Rational(BigInt(3)),
      wagons: new Rational(BigInt(4)),
      factories: new Rational(BigInt(5)),
      power: new Rational(BigInt(6)),
      pollution: new Rational(BigInt(7)),
      recipeId,
    };
    const minStep: Step = {
      itemId,
      items: Rational.one,
      recipeId,
    };
    const itemS: ItemSettings = {
      belt: 'belt',
      wagon: 'wagon',
    };
    const fullRecipe: RecipeSettings = {
      factory: ItemId.AssemblingMachine2,
      factoryModules: ['a', 'b'],
      beaconCount: 8,
      beacon: 'beacon',
      beaconModules: ['c', 'd'],
    };
    const minRecipe: RecipeSettings = {
      factory: ItemId.AssemblingMachine1,
      beaconCount: 8,
      beacon: 'beacon',
    };

    it('should fill in all fields', () => {
      const result = ExportUtility.stepToJson(
        fullStep,
        [fullStep],
        initialColumnsState,
        { [itemId]: itemS },
        { [recipeId]: fullRecipe },
        Mocks.AdjustedData
      );
      expect(result).toEqual({
        Item: itemId,
        Items: '=1',
        Surplus: '=2',
        Inputs: '',
        Outputs: '',
        Targets: '',
        Belts: '=3',
        Belt: itemS.belt,
        Wagons: '=4',
        Wagon: itemS.wagon,
        Recipe: recipeId,
        Factories: '=5',
        Factory: fullRecipe.factory,
        FactoryModules: '"a,b"',
        Beacons: '8',
        Beacon: fullRecipe.beacon,
        BeaconModules: '"c,d"',
        Power: '=6',
        Pollution: '=7',
      });
    });

    it('should handle empty fields', () => {
      const result = ExportUtility.stepToJson(
        minStep,
        [minStep],
        initialColumnsState,
        { [itemId]: itemS },
        { [recipeId]: minRecipe },
        Mocks.AdjustedData
      );
      expect(result).toEqual({
        Item: itemId,
        Items: '=1',
        Surplus: '',
        Inputs: '',
        Outputs: '',
        Targets: '',
        Belts: '',
        Belt: itemS.belt,
        Wagons: '',
        Wagon: itemS.wagon,
        Recipe: recipeId,
        Factories: '',
        Factory: minRecipe.factory,
        Power: '',
        Pollution: '',
      });
    });

    it('should handle minimum columns', () => {
      const result = ExportUtility.stepToJson(
        fullStep,
        [fullStep],
        noCols,
        { [itemId]: itemS },
        { [recipeId]: fullRecipe },
        Mocks.AdjustedData
      );
      expect(result).toEqual({
        Item: itemId,
        Items: '=1',
        Surplus: '=2',
        Inputs: '',
        Outputs: '',
        Targets: '',
        Recipe: recipeId,
      });
    });

    it('should handle no recipe', () => {
      const step = { ...fullStep, ...{ recipeId: null } };
      const result = ExportUtility.stepToJson(
        step,
        [step],
        noCols,
        { [itemId]: itemS },
        { [recipeId]: fullRecipe },
        Mocks.AdjustedData
      );
      expect(result).toEqual({
        Item: itemId,
        Items: '=1',
        Surplus: '=2',
        Inputs: '',
        Outputs: '',
        Targets: '',
      });
    });

    it('should handle no items', () => {
      const step = { ...minStep, ...{ items: null } };
      const result = ExportUtility.stepToJson(
        step,
        [step],
        noCols,
        { [itemId]: itemS },
        { [recipeId]: fullRecipe },
        Mocks.AdjustedData
      );
      expect(result).toEqual({
        Item: itemId,
        Items: '',
        Surplus: '',
        Inputs: '',
        Outputs: '',
        Targets: '',
        Recipe: recipeId,
      });
    });

    it('should handle outputs and targets', () => {
      const step: Step = {
        itemId: ItemId.PlasticBar,
        items: Rational.one,
        recipeId: RecipeId.PlasticBar,
        outputs: { [ItemId.PlasticBar]: Rational.one },
        parents: { [RecipeId.AdvancedCircuit]: Rational.one },
      };
      const inStep: Step = {
        itemId: ItemId.Coal,
        items: Rational.one,
        parents: { [RecipeId.PlasticBar]: Rational.one },
      };
      const result = ExportUtility.stepToJson(
        step,
        [step, inStep],
        noCols,
        { [itemId]: itemS },
        { [RecipeId.PlasticBar]: fullRecipe },
        Mocks.AdjustedData
      );
      expect(result).toEqual({
        Item: ItemId.PlasticBar,
        Items: '=1',
        Surplus: '',
        Inputs: `"${ItemId.Coal}:1,${ItemId.PetroleumGas}:"`,
        Outputs: `"${ItemId.PlasticBar}:1"`,
        Targets: `"${ItemId.AdvancedCircuit}:1"`,
        Recipe: RecipeId.PlasticBar,
      });
    });
  });
});
