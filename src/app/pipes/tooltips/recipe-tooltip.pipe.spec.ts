import { TestBed } from '@angular/core/testing';

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
});
