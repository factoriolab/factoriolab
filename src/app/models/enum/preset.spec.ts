import { gameInfo } from '../game-info';
import { Game } from './game';
import { presetOptions } from './preset';

describe('Preset', () => {
  describe('presetOptions', () => {
    it('should return the correct options for Factorio', () => {
      expect(presetOptions(gameInfo[Game.Factorio]).length).toEqual(4);
    });

    it('should return the correct options for Captain of Industry', () => {
      expect(presetOptions(gameInfo[Game.CaptainOfIndustry]).length).toEqual(2);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(presetOptions(gameInfo[Game.DysonSphereProgram]).length).toEqual(
        3,
      );
    });
  });
});
