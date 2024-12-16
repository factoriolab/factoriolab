import { TestBed } from '@angular/core/testing';

import { spread } from '~/helpers';
import { rational } from '~/models/rational';
import { ItemId, Mocks, TestModule } from '~/tests';

import { ItemsService } from './items.service';

describe('ItemsService', () => {
  let service: ItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(ItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('itemsState', () => {
    it('should return the items state', () => {
      spyOn(service.settingsSvc, 'settings').and.returnValue(
        spread(Mocks.settingsStateInitial, {
          pipeId: ItemId.Pipe,
          stack: rational(4n),
        }),
      );
      const result = service.settings();
      expect(Object.keys(result).length).toEqual(
        Mocks.adjustedDataset.itemIds.length,
      );
      expect(result[ItemId.Car].stack).toEqual(rational.one);
    });
  });

  describe('itemsModified', () => {
    it('should determine whether columns are modified', () => {
      spyOn(service, 'state').and.returnValue(Mocks.itemsStateInitial);
      const result = service.itemsModified();
      expect(result.belts).toBeTrue();
      expect(result.wagons).toBeTrue();
    });
  });

  describe('updateEntityField', () => {
    it('should update an entity field', () => {
      service.updateEntityField(
        ItemId.Coal,
        'beltId',
        ItemId.TransportBelt,
        undefined,
      );
      expect(service.state()[ItemId.Coal].beltId).toEqual(ItemId.TransportBelt);
    });
  });
});
