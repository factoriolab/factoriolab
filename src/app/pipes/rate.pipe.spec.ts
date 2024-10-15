import { TestBed } from '@angular/core/testing';

import { rational } from '~/models/rational';

import { RatePipe } from './rate.pipe';

describe('RatePipe', () => {
  let pipe: RatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RatePipe] });
    pipe = TestBed.inject(RatePipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should convert to fraction', () => {
      expect(pipe.transform(rational(1n, 2n), null)).toEqual('1/2');
    });

    it('should convert to percentage', () => {
      expect(pipe.transform(rational.one, -2)).toEqual('100');
    });

    it('should round to specified digits and add extra zeroes', () => {
      expect(pipe.transform(rational(1n, 2n), 2)).toEqual('0.50');
    });

    it('should round to specified digits and add spaces for integers', () => {
      expect(pipe.transform(rational.one, 2)).toEqual('1   ');
    });

    it('should add zeroes to values rounded to integers', () => {
      expect(pipe.transform(rational(9999n, 10000n), 1)).toEqual('1.0');
    });

    it('should round to 0 digits', () => {
      expect(pipe.transform(rational(1n, 2n), 0)).toEqual('1');
    });

    it('should prepend < to values below minimum rounded-up value', () => {
      expect(pipe.transform(rational(1n, 1000n), 1)).toEqual('<0.1');
    });
  });
});
