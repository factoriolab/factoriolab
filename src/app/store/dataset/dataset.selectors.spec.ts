import Fraction from 'fraction.js';

import * as Mocks from 'src/mocks';
import { ItemId } from '~/models';
import * as Selectors from './dataset.selectors';

describe('Dataset Selectors', () => {
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
