import { TestBed } from '@angular/core/testing';

import { GtZeroPipe } from './gt-zero.pipe';

describe('GtZeroPipe', () => {
  let pipe: GtZeroPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [GtZeroPipe] });
    pipe = TestBed.inject(GtZeroPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should check whether a string is greater than zero', () => {
      expect(pipe.transform('1')).toBeTrue();
      expect(pipe.transform('0')).toBeFalse();
    });

    it('should handle parsing error', () => {
      expect(pipe.transform('a')).toBeFalse();
    });
  });
});
