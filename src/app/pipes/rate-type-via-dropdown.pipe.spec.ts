import { TestBed } from '@angular/core/testing';

import { RateTypeViaDropdownPipe } from './rate-type-via-dropdown.pipe';

describe('RateTypeViaDropdownPipe', () => {
  let pipe: RateTypeViaDropdownPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RateTypeViaDropdownPipe] });
    pipe = TestBed.inject(RateTypeViaDropdownPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });
});
