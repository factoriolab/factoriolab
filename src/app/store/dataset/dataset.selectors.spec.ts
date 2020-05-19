import Fraction from 'fraction.js';

import * as Mocks from 'src/mocks';
import { ItemId, RecipeId } from '~/models';
import * as Selectors from './dataset.selectors';

describe('Dataset Selectors', () => {
  describe('getDatasetState', () => {
    it('should handle null/empty inputs', () => {
      const result = Selectors.getDatasetState.projector({}, null);
      expect(result).toEqual({} as any);
    });

    it('should return default dataset if expensive is false', () => {
      const result = Selectors.getDatasetState.projector(Mocks.Data, false);
      expect(result).toEqual(Mocks.Data);
    });

    it('should return expensive recipes if expensive is true', () => {
      const result = Selectors.getDatasetState.projector(Mocks.Data, true);
      expect(result.recipeEntities[RecipeId.ElectronicCircuit]).not.toEqual(
        Mocks.Data[RecipeId.ElectronicCircuit]
      );
    });
  });

  describe('getBeltSpeed', () => {
    it('should handle null/empty inputs', () => {
      const result = Selectors.getBeltSpeed.projector({}, null);
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the map of belt speeds', () => {
      const beltId = 'transport-belt';
      const flowRate = 2000;
      const result = Selectors.getBeltSpeed.projector(Mocks.Data, flowRate);
      expect(result[beltId]).toEqual(
        new Fraction(Mocks.Data.itemEntities[beltId].belt.speed)
      );
      expect(result[ItemId.Pipe]).toEqual(new Fraction(flowRate));
    });
  });
});
