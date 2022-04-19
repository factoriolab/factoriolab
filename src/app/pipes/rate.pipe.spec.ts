import { TestBed } from '@angular/core/testing';

import { Rational } from '~/models';
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
      expect(pipe.transform(Rational.from(1, 2), null)).toEqual('1/2');
    });

    it('should convert to percentage', () => {
      expect(pipe.transform(Rational.one, -2)).toEqual('100');
    });

    it('should round to specified digits and add extra zeroes', () => {
      expect(pipe.transform(Rational.from(1, 2), 2)).toEqual('0.50');
    });

    it('should round to specified digits and add spaces for integers', () => {
      expect(pipe.transform(Rational.one, 2)).toEqual('1   ');
    });

    it('should add zeroes to values rounded to integers', () => {
      expect(pipe.transform(Rational.from(9999, 10000), 1)).toEqual('1.0');
    });

    it('should round to 0 digits', () => {
      expect(pipe.transform(Rational.from(1, 2), 0)).toEqual('1');
    });
  });
});
