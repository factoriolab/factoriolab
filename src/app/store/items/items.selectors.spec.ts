import { spread } from '~/helpers';
import { ItemId, Mocks } from '~/tests';

import { initialItemsState } from './items.reducer';
import { selectItemsModified, selectItemsState } from './items.selectors';

describe('Items Selectors', () => {
  const stringValue = 'value';

  describe('getItemConfigs', () => {
    it('should return the item configs', () => {
      const settings = spread(Mocks.settingsStateInitial, {
        pipeId: ItemId.Pipe,
      });
      const result = selectItemsState.projector(
        initialItemsState,
        Mocks.adjustedDataset,
        settings,
      );
      expect(Object.keys(result).length).toEqual(
        Mocks.adjustedDataset.itemIds.length,
      );
    });

    it('should use the passed overrides', () => {
      const state = spread(initialItemsState, {
        [Mocks.item1.id]: { beltId: stringValue, wagonId: stringValue },
      });
      const result = selectItemsState.projector(
        state,
        Mocks.adjustedDataset,
        Mocks.settingsStateInitial,
      );
      expect(result[Mocks.item1.id].beltId).toEqual(stringValue);
      expect(result[Mocks.item1.id].wagonId).toEqual(stringValue);
    });
  });

  describe('getItemsModified', () => {
    it('should determine whether columns are modified', () => {
      const result = selectItemsModified.projector(Mocks.itemsStateInitial);
      expect(result.belts).toBeTrue();
      expect(result.wagons).toBeTrue();
    });
  });
});
