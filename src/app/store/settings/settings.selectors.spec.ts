import { Mocks, ItemId, RecipeId } from 'src/tests';
import { Rational } from '~/models';
import * as Selectors from './settings.selectors';

describe('Settings Selectors', () => {
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
});
