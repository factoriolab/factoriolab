import { Mocks } from 'src/tests';
import { initialItemsState } from './items.reducer';
import * as Selectors from './items.selectors';

describe('Items Selectors', () => {
  const stringValue = 'value';

  describe('getItemConfigs', () => {
    it('should return the item configs', () => {
      const result = Selectors.getItemsState.projector(
        initialItemsState,
        Mocks.RawDataset,
        Mocks.SettingsStateInitial,
      );
      expect(Object.keys(result).length).toEqual(
        Mocks.RawDataset.itemIds.length,
      );
    });

    it('should use the passed overrides', () => {
      const state = {
        ...initialItemsState,
        ...{ [Mocks.Item1.id]: { beltId: stringValue, wagonId: stringValue } },
      };
      const result = Selectors.getItemsState.projector(
        state,
        Mocks.RawDataset,
        Mocks.SettingsStateInitial,
      );
      expect(result[Mocks.Item1.id].beltId).toEqual(stringValue);
      expect(result[Mocks.Item1.id].wagonId).toEqual(stringValue);
    });
  });

  describe('getItemsModified', () => {
    it('should determine whether columns are modified', () => {
      const result = Selectors.getItemsModified.projector(
        Mocks.ItemsStateInitial,
      );
      expect(result.excluded).toBeTrue();
      expect(result.belts).toBeTrue();
      expect(result.wagons).toBeTrue();
    });
  });
});
