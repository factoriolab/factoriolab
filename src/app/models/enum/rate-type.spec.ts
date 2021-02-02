import { DisplayRate } from './display-rate';
import { rateTypeOptions } from './rate-type';

describe('RateType', () => {
  describe('rateTypeOptions', () => {
    it('should return the correct options for Factorio', () => {
      expect(rateTypeOptions(DisplayRate.PerMinute, false).length).toEqual(4);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(rateTypeOptions(DisplayRate.PerMinute, true).length).toEqual(3);
    });
  });
});
