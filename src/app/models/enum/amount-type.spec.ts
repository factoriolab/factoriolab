import { amountTypeOptions } from './amount-type';
import { DisplayRate, displayRateInfo } from './display-rate';
import { Game } from './game';

describe('RateType', () => {
  describe('rateTypeOptions', () => {
    const dispRateInfo = displayRateInfo[DisplayRate.PerMinute];

    it('should return the correct options for Factorio', () => {
      expect(amountTypeOptions(dispRateInfo, Game.Factorio).length).toEqual(4);
    });

    it('should return the correct options for Captain of Industry', () => {
      expect(
        amountTypeOptions(dispRateInfo, Game.CaptainOfIndustry).length
      ).toEqual(3);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(
        amountTypeOptions(dispRateInfo, Game.DysonSphereProgram).length
      ).toEqual(3);
    });
  });
});
