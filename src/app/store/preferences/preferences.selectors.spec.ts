import { Column, LinkValue } from '~/models';
import * as Selectors from './preferences.selectors';

describe('Preferences Selectors', () => {
  describe('getLinkPrecision', () => {
    it('should return null for non-column', () => {
      const result = Selectors.getLinkPrecision.projector(LinkValue.None, null);
      expect(result).toBeNull();
    });

    it('should return items column precision', () => {
      const result = Selectors.getLinkPrecision.projector(LinkValue.Items, {
        [Column.Items]: { precision: 1 },
      });
      expect(result).toEqual(1);
    });

    it('should return belts column precision', () => {
      const result = Selectors.getLinkPrecision.projector(LinkValue.Belts, {
        [Column.Belts]: { precision: 1 },
      });
      expect(result).toEqual(1);
    });

    it('should return wagons column precision', () => {
      const result = Selectors.getLinkPrecision.projector(LinkValue.Wagons, {
        [Column.Wagons]: { precision: 1 },
      });
      expect(result).toEqual(1);
    });

    it('should return factories column precision', () => {
      const result = Selectors.getLinkPrecision.projector(LinkValue.Factories, {
        [Column.Factories]: { precision: 1 },
      });
      expect(result).toEqual(1);
    });
  });
});
