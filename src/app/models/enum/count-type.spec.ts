import { DisplayRate, displayRateInfo } from './display-rate';
import { Game } from './game';
import { rateTypeOptions } from './rate-type';

describe('RateType', () => {
  describe('rateTypeOptions', () => {
    const dispRateInfo = displayRateInfo[DisplayRate.PerMinute];

    it('should return the correct options for Factorio', () => {
      expect(rateTypeOptions(dispRateInfo, Game.Factorio).length).toEqual(4);
    });

    it('should return the correct options for Captain of Industry', () => {
      expect(
        rateTypeOptions(dispRateInfo, Game.CaptainOfIndustry).length
      ).toEqual(3);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(
        rateTypeOptions(dispRateInfo, Game.DysonSphereProgram).length
      ).toEqual(3);
    });
  });
});
