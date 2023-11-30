import { Game } from './game';
import { linkValueOptions } from './link-value';

describe('LinkValue', () => {
  describe('linkValueOptions', () => {
    it('should return the correct options for Factorio', () => {
      expect(linkValueOptions(Game.Factorio).length).toEqual(6);
    });

    it('should return the correct options for Captain of Industry', () => {
      expect(linkValueOptions(Game.CaptainOfIndustry).length).toEqual(5);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(linkValueOptions(Game.DysonSphereProgram).length).toEqual(5);
    });
  });
});
