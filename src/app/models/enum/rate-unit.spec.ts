import { DisplayRate, displayRateInfo } from './display-rate';
import { Game } from './game';
import { rateUnitOptions } from './rate-unit';

describe('RateUnit', () => {
  describe('rateUnitOptions', () => {
    const dispRateInfo = displayRateInfo[DisplayRate.PerMinute];

    it('should return the correct options for Factorio', () => {
      expect(rateUnitOptions(dispRateInfo, Game.Factorio).length).toEqual(3);
    });

    it('should return the correct options for Captain of Industry', () => {
      expect(
        rateUnitOptions(dispRateInfo, Game.CaptainOfIndustry).length
      ).toEqual(2);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(
        rateUnitOptions(dispRateInfo, Game.DysonSphereProgram).length
      ).toEqual(2);
    });
  });
});
