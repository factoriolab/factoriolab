import { columnOptions } from './column';
import { Game } from './game';

describe('Column', () => {
  describe('columnOptions', () => {
    it('should return the correct options for Factorio', () => {
      expect(columnOptions(Game.Factorio).length).toEqual(9);
    });

    it('should return the correct options for Dyson Sphere Program', () => {
      expect(columnOptions(Game.DysonSphereProgram).length).toEqual(6);
    });

    it('should return the correct options for Satisfactory', () => {
      expect(columnOptions(Game.Satisfactory).length).toEqual(8);
    });

    it('should return an empty array for an unrecognized game value', () => {
      expect(columnOptions(4 as any)).toEqual([]);
    });
  });
});
