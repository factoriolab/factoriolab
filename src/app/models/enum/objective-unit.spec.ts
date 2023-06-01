import { DisplayRate, displayRateInfo } from './display-rate';
import { Game } from './game';
import { objectiveUnitOptions } from './objective-unit';

describe('RateUnit', () => {
  describe('rateUnitOptions', () => {
    const dispRateInfo = displayRateInfo[DisplayRate.PerMinute];

    it('should return the correct options for Factorio', () => {
      expect(objectiveUnitOptions(dispRateInfo, Game.Factorio).length).toEqual(
        3
      );
    });

    it('should return the correct options for Captain of Industry', () => {
      expect(
        objectiveUnitOptions(dispRateInfo, Game.CaptainOfIndustry).length
      ).toEqual(2);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(
        objectiveUnitOptions(dispRateInfo, Game.DysonSphereProgram).length
      ).toEqual(2);
    });
  });
});
