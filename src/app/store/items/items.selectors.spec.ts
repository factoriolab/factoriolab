import { ItemId, Mocks } from 'src/tests';
import * as Settings from '../settings';
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
        Settings.initialSettingsState
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
        Settings.initialSettingsState
      );
      expect(result[Mocks.Item1.id].belt).toEqual(stringValue);
      expect(result[Mocks.Item1.id].wagon).toEqual(stringValue);
    });

    it('should override using the pipe from settings', () => {
      const result = Selectors.getItemSettings.projector(
        initialItemsState,
        Mocks.Data,
        { ...Settings.initialSettingsState, ...{ pipe: 'pipeValue' } }
      );
      expect(result[ItemId.CrudeOil].belt).toEqual('pipeValue');
    });
  });

  describe('getItemsModified', () => {
    it('should determine whether columns are modified', () => {
      const result = Selectors.getItemsModified.projector(
        Mocks.ItemSettingsInitial
      );
      expect(result.ignore).toBeTrue();
      expect(result.belts).toBeTrue();
      expect(result.wagons).toBeTrue();
    });
  });
});
