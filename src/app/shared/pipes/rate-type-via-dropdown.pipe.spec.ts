import { TestBed } from '@angular/core/testing';

import { RateType } from '~/models';
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

  describe('transform', () => {
    it('should return recipe for RateType Factories', () => {
      expect(pipe.transform(RateType.Factories)).toEqual('recipe');
      expect(pipe.transform(RateType.Items)).toEqual('item');
    });
  });
});
