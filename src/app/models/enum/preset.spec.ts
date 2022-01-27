import { Game } from './game';
import { presetOptions } from './preset';

describe('Preset', () => {
  describe('presetOptions', () => {
    it('should return the correct options for Factorio', () => {
      expect(presetOptions(Game.Factorio).length).toEqual(4);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(presetOptions(Game.DysonSphereProgram).length).toEqual(3);
    });
  });
});
