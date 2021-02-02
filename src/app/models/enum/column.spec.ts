import { columnOptions } from './column';

describe('Column', () => {
  describe('columnOptions', () => {
    it('should return the correct options for Factorio', () => {
      expect(columnOptions(false).length).toEqual(8);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(columnOptions(true).length).toEqual(5);
    });
  });
});
