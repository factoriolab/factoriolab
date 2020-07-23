import { Mocks, ItemId, RecipeId } from 'src/tests';
import { Rational, ResearchSpeed, EmptyMod } from '~/models';
import * as Selectors from './settings.selectors';

describe('Settings Selectors', () => {
  describe('getRationalMiningBonus', () => {
    it('should convert the numeric value to a percent Rational', () => {
      const result = Selectors.getRationalMiningBonus.projector(100);
      expect(result).toEqual(Rational.one);
    });
  });

  describe('getResearchFactor', () => {
    it('should look up the Rational from the dictionary', () => {
      const result = Selectors.getResearchFactor.projector(
        ResearchSpeed.Speed0
      );
      expect(result).toEqual(Rational.one);
    });
  });

  describe('getRationalFlowRate', () => {
    it('should convert the numeric value to a Rational', () => {
      const result = Selectors.getRationalFlowRate.projector(1);
      expect(result).toEqual(Rational.one);
    });
  });

  describe('getBase', () => {
    it('should get the base dataset', () => {
      const result = Selectors.getBase.projector('test', { test: Mocks.Base });
      expect(result).toEqual(Mocks.Base);
    });

    it('should return the empty mod for an invalid dataset', () => {
      const result = Selectors.getBase.projector('test', {});
      expect(result).toEqual(EmptyMod);
    });
  });

  describe('getMods', () => {
    it('should map to mod entities', () => {
      const result = Selectors.getMods.projector(
        Mocks.DataState.modIds,
        Mocks.DataState.modEntities
      );
      expect(result).toEqual(
        Mocks.DataState.modIds.map((i) => Mocks.DataState.modEntities[i])
      );
    });

    it('should filter out invalid mods', () => {
      const result = Selectors.getMods.projector(
        ['test'],
        Mocks.DataState.modEntities
      );
      expect(result).toEqual([]);
    });
  });

  describe('getDefaults', () => {
    it('should get the defaults from the current base mod', () => {
      const result = Selectors.getDefaults.projector(Mocks.Base);
      expect(result).toEqual(Mocks.Base.defaults);
    });
  });

  describe('getNormalDataset', () => {
    it('should return a complete dataset for the base and mods', () => {
      const result = Selectors.getNormalDataset.projector(
        Mocks.Base,
        Mocks.Mods
      );
      expect(result.categoryIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.categoryEntities).length).toEqual(
        result.categoryIds.length
      );
      expect(Object.keys(result.categoryItemRows).length).toEqual(
        result.categoryIds.length
      );
      expect(result.iconIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.iconEntities).length).toEqual(
        result.iconIds.length
      );
      expect(result.itemIds.length).toBeGreaterThan(0);
      expect(result.beltIds.length).toBeGreaterThan(0);
      expect(result.fuelIds.length).toBeGreaterThan(0);
      expect(result.factoryIds.length).toBeGreaterThan(0);
      expect(result.moduleIds.length).toBeGreaterThan(0);
      expect(result.beaconModuleIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.itemEntities).length).toEqual(
        result.itemIds.length
      );
      expect(Object.keys(result.itemR).length).toEqual(result.itemIds.length);
      expect(Object.keys(result.itemRecipeIds).length).toBeGreaterThan(0);
      expect(Object.keys(result.itemRecipeIds).length).toBeLessThan(
        result.itemIds.length
      );
      expect(result.recipeIds.length).toBeGreaterThan(0);
      expect(Object.keys(result.recipeEntities).length).toEqual(
        result.recipeIds.length
      );
      expect(Object.keys(result.recipeR).length).toEqual(
        result.recipeIds.length
      );
      expect(Object.keys(result.recipeModuleIds).length).toEqual(
        result.recipeIds.length
      );
      expect(Object.keys(result.limitations).length).toBeGreaterThan(0);
    });
  });

  describe('getDataset', () => {
    it('should handle null/empty inputs', () => {
      const result = Selectors.getDataset.projector({}, null);
      expect(result).toEqual({} as any);
    });

    it('should return default dataset if expensive is false', () => {
      const result = Selectors.getDataset.projector(Mocks.Data, false);
      expect(result).toEqual(Mocks.Data);
    });

    it('should return expensive recipes if expensive is true', () => {
      const result = Selectors.getDataset.projector(Mocks.Data, true);
      expect(result.recipeEntities[RecipeId.ElectronicCircuit]).not.toEqual(
        Mocks.Data[RecipeId.ElectronicCircuit]
      );
    });
  });

  describe('getBeltSpeed', () => {
    it('should handle null/empty inputs', () => {
      const result = Selectors.getBeltSpeed.projector({}, null);
      expect(Object.keys(result).length).toEqual(1); // Always includes pipe
    });

    it('should return the map of belt speeds', () => {
      const beltId = 'transport-belt';
      const flowRate = new Rational(BigInt(2000));
      const result = Selectors.getBeltSpeed.projector(Mocks.Data, flowRate);
      expect(result[beltId]).toEqual(Mocks.Data.itemR[beltId].belt.speed);
      expect(result[ItemId.Pipe]).toEqual(flowRate);
    });
  });

  describe('getEntities', () => {
    it('should combine base and mods list', () => {
      const result = Selectors.getEntities(Mocks.Base.categories, [
        Mocks.Mods[0].categories,
      ]);
      expect(Object.keys(result).length).toEqual(
        Mocks.Base.categories.length + Mocks.Mods[0].categories.length
      );
    });
  });

  describe('getArrayEntities', () => {
    it('should combine base and mods list arrays', () => {
      const result = Selectors.getArrayEntities(Mocks.Base.limitations, [
        Mocks.Mods[0].limitations,
        { test: [] },
      ]);
      expect(Object.keys(result).length).toEqual(
        Object.keys(Mocks.Base.limitations).length + 1
      );
    });
  });
});
