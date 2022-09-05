import { TestBed } from '@angular/core/testing';

import { ItemId, Mocks, RecipeId } from 'src/tests';
import { ItemTooltipPipe } from './item-tooltip.pipe';

describe('ItemTooltipPipe', () => {
  let pipe: ItemTooltipPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ItemTooltipPipe] });
    pipe = TestBed.inject(ItemTooltipPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should generate an item tooltip', () => {
      const result = pipe.transform(ItemId.PetroleumGas, Mocks.Dataset);
      expect(result).toBeTruthy();
    });

    it('should generate a recipe tooltip', () => {
      const result = pipe.transform(ItemId.Coal, Mocks.Dataset);
      expect(result).toBeTruthy();
    });

    it('should handle null values', () => {
      expect(pipe.transform(null, Mocks.Dataset)).toEqual('');
      expect(pipe.transform('null', Mocks.Dataset)).toEqual('');
      const data = Mocks.getDataset();
      delete data.recipeEntities[RecipeId.Coal];
      expect(pipe.transform(ItemId.Coal, data)).toEqual('');
    });
  });
});
