import { flags } from '../flags';
import { linkValueOptions } from './link-value';

describe('LinkValue', () => {
  describe('linkValueOptions', () => {
    it('should return the correct options for Factorio', () => {
      expect(linkValueOptions(flags['1.1']).length).toEqual(6);
    });

    it('should return the correct options for Captain of Industry', () => {
      expect(linkValueOptions(flags.coi).length).toEqual(5);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(linkValueOptions(flags.dsp).length).toEqual(5);
    });
  });
});
