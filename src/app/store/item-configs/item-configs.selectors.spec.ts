import { Mocks } from 'src/tests';
import { initialItemsCfgState } from './item-configs.reducer';
import * as Selectors from './item-configs.selectors';

describe('Item Configs Selectors', () => {
  const stringValue = 'value';

  describe('getItemConfigs', () => {
    it('should return the item configs', () => {
      const result = Selectors.getItemsCfg.projector(
        initialItemsCfgState,
        Mocks.Dataset,
        Mocks.SettingsStateInitial
      );
      expect(Object.keys(result).length).toEqual(Mocks.Dataset.itemIds.length);
    });

    it('should use the passed overrides', () => {
      const state = {
        ...initialItemsCfgState,
        ...{ [Mocks.Item1.id]: { beltId: stringValue, wagonId: stringValue } },
      };
      const result = Selectors.getItemsCfg.projector(
        state,
        Mocks.Dataset,
        Mocks.SettingsStateInitial
      );
      expect(result[Mocks.Item1.id].beltId).toEqual(stringValue);
      expect(result[Mocks.Item1.id].wagonId).toEqual(stringValue);
    });
  });

  describe('getItemsModified', () => {
    it('should determine whether columns are modified', () => {
      const result = Selectors.getItemsModified.projector(
        Mocks.ItemSettingsInitial
      );
      expect(result.excluded).toBeTrue();
      expect(result.belts).toBeTrue();
      expect(result.wagons).toBeTrue();
    });
  });
});
