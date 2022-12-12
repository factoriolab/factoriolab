import { TestBed } from '@angular/core/testing';

import { Mocks, RecipeId } from 'src/tests';
import { RecipeTooltipPipe } from './recipe-tooltip.pipe';

describe('RecipeTooltipPipe', () => {
  let pipe: RecipeTooltipPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RecipeTooltipPipe] });
    pipe = TestBed.inject(RecipeTooltipPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should generate a recipe tooltip', () => {
      const data = Mocks.getDataset();
      const result = pipe.transform(RecipeId.ElectronicCircuit, data);
      expect(result).toBeTruthy();
    });

    it('should handle null values', () => {
      expect(pipe.transform(null, Mocks.Dataset)).toEqual('');
      expect(pipe.transform('null', Mocks.Dataset)).toEqual('');
    });
  });
});
