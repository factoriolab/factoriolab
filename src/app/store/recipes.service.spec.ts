import { TestBed } from '@angular/core/testing';

import { rational } from '~/models/rational';
import { ItemId, Mocks, TestModule } from '~/tests';

import { RecipesService } from './recipes.service';

describe('RecipesService', () => {
  let service: RecipesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(RecipesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('recipesState', () => {
    it('should return the recipe settings', () => {
      const result = service.settings();
      expect(Object.keys(result).length).toEqual(
        Mocks.adjustedDataset.recipeIds.length,
      );
    });

    it('should reset invalid beacon totals', () => {
      spyOn(service, 'state').and.returnValue({
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
      const result = service.settings();
      expect(result[Mocks.item1.id].beacons?.[0].total).toBeUndefined();
    });
  });

  describe('adjustedDataset', () => {
    it('should call the utility method', () => {
      spyOn(service.recipeSvc, 'adjustDataset');
      service.adjustedDataset();
      expect(service.recipeSvc.adjustDataset).toHaveBeenCalled();
    });
  });
});
