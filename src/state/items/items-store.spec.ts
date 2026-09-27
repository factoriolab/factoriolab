import { TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { ItemId } from '~/tests/item-id';
import { TestModule } from '~/tests/test-module';
import { spread } from '~/utils/object';

import { RecipesStore } from '../recipes/recipes-store';
import { ItemsStore } from './items-store';

describe('ItemsStore', () => {
  let service: ItemsStore;
  let recipesStore: RecipesStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(ItemsStore);
    recipesStore = TestBed.inject(RecipesStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('settings', () => {
    it('should return the items state', () => {
      const adjustedDataset = recipesStore.adjustedDataset();
      spyOn(service['settingsStore'], 'settings').and.returnValue(
        spread(service['settingsStore'].settings(), {
          stack: rational(4n),
        }),
      );
      const result = service.settings();
      expect(Object.keys(result).length).toEqual(
        adjustedDataset.itemIds.length,
      );
      expect(result[ItemId.Car].stack).toEqual(rational.one);
    });
  });

  describe('itemsModified', () => {
    it('should determine whether columns are modified', () => {
      const settings = {
        ...service.settings(),
        [ItemId.WoodenChest]: { beltId: undefined, stack: rational.one },
      };
      spyOn(service, 'state').and.returnValue(settings);
      const result = service.itemsModified();
      expect(result.belts).toBeTrue();
      expect(result.wagons).toBeTrue();
    });
  });

  describe('defaultStack', () => {
    it('should return the item stack value if less than stack setting', () => {
      expect(
        service['defaultStack'](
          { stack: rational.one } as any,
          { stack: rational(2n) } as any,
        ),
      ).toEqual(rational.one);
    });
  });
});
