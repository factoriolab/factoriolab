import { TestBed } from '@angular/core/testing';

import { AsRecipePipe } from './as-recipe.pipe';

describe('AsRecipePipe', () => {
  let pipe: AsRecipePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AsRecipePipe] });
    pipe = TestBed.inject(AsRecipePipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should return value with type cast', () => {
      expect(pipe.transform('')).toEqual('' as any);
    });
  });
});
