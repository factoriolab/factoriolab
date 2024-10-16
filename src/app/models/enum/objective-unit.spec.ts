import { gameInfo } from '../game-info';
import { DisplayRate, displayRateInfo } from './display-rate';
import { Game } from './game';
import { objectiveUnitOptions } from './objective-unit';

describe('ObjectiveUnit', () => {
  describe('objectiveUnitOptions', () => {
    const dispRateInfo = displayRateInfo[DisplayRate.PerMinute];

    it('should return the correct options for Factorio', () => {
      expect(
        objectiveUnitOptions(dispRateInfo, gameInfo[Game.Factorio]).length,
      ).toEqual(4);
    });

    it('should return the correct options for Captain of Industry', () => {
      expect(
        objectiveUnitOptions(dispRateInfo, gameInfo[Game.CaptainOfIndustry])
          .length,
      ).toEqual(3);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(
        objectiveUnitOptions(dispRateInfo, gameInfo[Game.DysonSphereProgram])
          .length,
      ).toEqual(3);
    });
  });
});
