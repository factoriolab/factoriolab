import { Mocks } from 'src/tests';
import { Column, LinkValue } from '~/models';
import * as Selectors from './preferences.selectors';

describe('Preferences Selectors', () => {
  describe('Base selector functions', () => {
    it('should get slices of state', () => {
      expect(Selectors.getStates.projector(Mocks.PreferencesState)).toEqual(
        Mocks.PreferencesState.states
      );
    });
  });

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

  describe('getSavedStates', () => {
    it('should map saved states to an array of id-only options', () => {
      const result = Selectors.getSavedStates.projector({ ['id']: 'url' });
      expect(result).toEqual([{ id: 'id', name: 'id' }]);
    });
  });

  describe('getColumnsVisible', () => {
    it('should get the number of visible columns', () => {
      const result = Selectors.getColumnsVisible.projector(
        Mocks.PreferencesState.columns
      );
      expect(result).toEqual(10);
    });
  });
});
