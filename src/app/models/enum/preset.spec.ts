import { flags } from '../flags';
import { presetOptions } from './preset';

describe('Preset', () => {
  describe('presetOptions', () => {
    it('should return values from the JSON data', () => {
      expect(
        presetOptions(flags['2.0'], { presets: [{ id: 1, label: 'label' }] })
          .length,
      ).toEqual(1);
    });

    it('should return the correct options for Factorio', () => {
      expect(presetOptions(flags['1.1']).length).toEqual(4);
    });

    it('should return the correct options for Captain of Industry', () => {
      expect(presetOptions(flags.coi).length).toEqual(2);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(presetOptions(flags.dsp).length).toEqual(3);
    });
  });
});
