import Fraction from 'fraction.js';

import * as mocks from 'src/mocks';
import { ItemId } from '~/models';
import * as selectors from './dataset.selectors';

describe('Dataset Selectors', () => {
  describe('getLaneSpeed', () => {
    it('should handle null/empty inputs', () => {
      const result = selectors.getLaneSpeed.projector({}, null);
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the map of lane speeds', () => {
      const beltId = 'transport-belt';
      const flowRate = 2000;
      const result = selectors.getLaneSpeed.projector(mocks.Data, flowRate);
      expect(result[beltId]).toEqual(
        new Fraction(mocks.Data.itemEntities[beltId].belt.speed)
      );
      expect(result[ItemId.Pipe]).toEqual(new Fraction(flowRate));
    });
  });
});
