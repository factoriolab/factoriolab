import { TestBed } from '@angular/core/testing';

import { rational } from '~/models/rational';
import { ItemId, Mocks, TestModule } from '~/tests';

import { RecipesStore } from './recipes.store';

describe('RecipesStore', () => {
  let store: RecipesStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    store = TestBed.inject(RecipesStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('recipesState', () => {
    it('should return the recipe settings', () => {
      const result = store.settings();
      expect(Object.keys(result).length).toEqual(
        Mocks.adjustedDataset.recipeIds.length,
      );
    });

    it('should reset invalid beacon totals', () => {
      spyOn(store, 'state').and.returnValue({
        [Mocks.item1.id]: {
          beacons: [
            {
              total: rational(8n),
              count: rational.zero,
              id: ItemId.Beacon,
              modules: [{ count: rational(2n), id: ItemId.Module }],
            },
          ],
        },
      });
      const result = store.settings();
      expect(result[Mocks.item1.id].beacons?.[0].total).toBeUndefined();
    });
  });

  describe('adjustedDataset', () => {
    it('should call the utility method', () => {
      spyOn(store.recipeSvc, 'adjustDataset');
      store.adjustedDataset();
      expect(store.recipeSvc.adjustDataset).toHaveBeenCalled();
    });
  });
});
