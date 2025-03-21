import { TestBed } from '@angular/core/testing';

import { spread } from '~/helpers';
import { rational } from '~/models/rational';
import { ItemId, Mocks, TestModule } from '~/tests';

import { ItemsStore } from './items.store';

describe('ItemsStore', () => {
  let store: ItemsStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    store = TestBed.inject(ItemsStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('itemsState', () => {
    it('should return the items state', () => {
      spyOn(store.settingsStr, 'settings').and.returnValue(
        spread(Mocks.settingsStateInitial, {
          pipeId: ItemId.Pipe,
          stack: rational(4n),
        }),
      );
      const result = store.settings();
      expect(Object.keys(result).length).toEqual(
        Mocks.adjustedDataset.itemIds.length,
      );
      expect(result[ItemId.Car].stack).toEqual(rational.one);
    });
  });

  describe('itemsModified', () => {
    it('should determine whether columns are modified', () => {
      spyOn(store, 'state').and.returnValue(Mocks.itemsStateInitial);
      const result = store.itemsModified();
      expect(result.belts).toBeTrue();
      expect(result.wagons).toBeTrue();
    });
  });

  describe('updateEntityField', () => {
    it('should update an entity field', () => {
      store.updateEntityField(
        ItemId.Coal,
        'beltId',
        ItemId.TransportBelt,
        undefined,
      );
      expect(store.state()[ItemId.Coal].beltId).toEqual(ItemId.TransportBelt);
    });
  });
});
