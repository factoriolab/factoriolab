import { gameInfo } from '../game-info';
import { Game } from './game';
import { linkValueOptions } from './link-value';

describe('LinkValue', () => {
  describe('linkValueOptions', () => {
    it('should return the correct options for Factorio', () => {
      expect(linkValueOptions(gameInfo[Game.Factorio]).length).toEqual(6);
    });

    it('should return the correct options for Captain of Industry', () => {
      expect(linkValueOptions(gameInfo[Game.CaptainOfIndustry]).length).toEqual(
        5,
      );
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(
        linkValueOptions(gameInfo[Game.DysonSphereProgram]).length,
      ).toEqual(5);
    });
  });
});
