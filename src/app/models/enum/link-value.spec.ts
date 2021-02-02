import { linkValueOptions } from './link-value';

describe('LinkValue', () => {
  describe('linkValueOptions', () => {
    it('should return the correct options for Factorio', () => {
      expect(linkValueOptions(false).length).toEqual(6);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(linkValueOptions(true).length).toEqual(5);
    });
  });
});
