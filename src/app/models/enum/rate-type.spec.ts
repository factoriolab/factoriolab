import { DisplayRate } from './display-rate';
import { Game } from './game';
import { rateTypeOptions } from './rate-type';

describe('RateType', () => {
  describe('rateTypeOptions', () => {
    it('should return the correct options for Factorio', () => {
      expect(
        rateTypeOptions(DisplayRate.PerMinute, Game.Factorio).length
      ).toEqual(4);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(
        rateTypeOptions(DisplayRate.PerMinute, Game.DysonSphereProgram).length
      ).toEqual(3);
    });
  });
});
