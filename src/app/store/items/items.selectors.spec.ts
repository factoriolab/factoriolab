import { Mocks, ItemId } from 'src/tests';
import { initialSettingsState } from '../settings';
import { initialItemsState } from './items.reducer';
import * as Selectors from './items.selectors';

describe('Items Selectors', () => {
  const stringValue = 'value';

  describe('getItemSettings', () => {
    it('should handle null/empty values', () => {
      const result = Selectors.getItemSettings.projector({}, null, {});
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should handle empty recipes', () => {
      const result = Selectors.getItemSettings.projector(
        {},
        { recipes: [] },
        {}
      );
      expect(Object.keys(result).length).toEqual(0);
    });

    it('should return the item settings', () => {
      const result = Selectors.getItemSettings.projector(
        initialItemsState,
        Mocks.Data,
        initialSettingsState
      );
      expect(Object.keys(result).length).toEqual(Mocks.Data.itemIds.length);
    });

    it('should use the passed overrides', () => {
      const state = {
        ...initialItemsState,
        ...{ [Mocks.Item1.id]: { belt: stringValue, wagon: stringValue } },
      };
      const result = Selectors.getItemSettings.projector(
        state,
        Mocks.Data,
        initialSettingsState
      );
      expect(result[Mocks.Item1.id].belt).toEqual(stringValue);
      expect(result[Mocks.Item1.id].wagon).toEqual(stringValue);
    });
  });

  describe('getContainsIgnore', () => {
    it('should handle null/empty values', () => {
      const result = Selectors.getContainsIgnore.projector({});
      expect(result).toBeFalse();
    });

    it('should find a relevant step', () => {
      const result = Selectors.getContainsIgnore.projector({
        ['id']: { ignore: true },
      });
      expect(result).toBeTrue();
    });
  });

  describe('getContainsBelt', () => {
    it('should handle null/empty values', () => {
      const result = Selectors.getContainsBelt.projector({});
      expect(result).toBeFalse();
    });

    it('should find a relevant step', () => {
      const result = Selectors.getContainsBelt.projector({
        ['id']: { belt: ItemId.TransportBelt },
      });
      expect(result).toBeTrue();
    });
  });

  describe('getContainsWagon', () => {
    it('should handle null/empty values', () => {
      const result = Selectors.getContainsWagon.projector({});
      expect(result).toBeFalse();
    });

    it('should find a relevant step', () => {
      const result = Selectors.getContainsWagon.projector({
        ['id']: { wagon: ItemId.CargoWagon },
      });
      expect(result).toBeTrue();
    });
  });
});
