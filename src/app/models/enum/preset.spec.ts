import { presetOptions } from './preset';

describe('Preset', () => {
  describe('presetOptions', () => {
    it('should return the correct options for Factorio', () => {
      expect(presetOptions(false).length).toEqual(4);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(presetOptions(true).length).toEqual(2);
    });
  });
});
