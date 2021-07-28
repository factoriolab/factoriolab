import { Game } from './game';
import { linkValueOptions } from './link-value';

describe('LinkValue', () => {
  describe('linkValueOptions', () => {
    it('should return the correct options for Factorio', () => {
      expect(linkValueOptions(Game.Factorio).length).toEqual(6);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(linkValueOptions(Game.DysonSphereProgram).length).toEqual(5);
    });
  });
});
