import { TestBed } from '@angular/core/testing';

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
});
