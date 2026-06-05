import { TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';

import { RatePipe } from './rate-pipe';

describe('RatePipe', () => {
  let pipe: RatePipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new RatePipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should convert the value to an appropriate string', () => {
      expect(pipe.transform(rational(200n, 3n), 2)).toEqual('66.67');
    });

    it('should show < for very small values', () => {
      expect(pipe.transform(rational(1n, 100n), 1)).toEqual('<0.1');
    });

    it('should handle integers and append appropriate spaces', () => {
      expect(pipe.transform(rational(50n), 2)).toEqual('50   ');
    });

    it('should render as a percentage', () => {
      expect(pipe.transform(rational(1n, 2n), -2)).toEqual('50');
    });

    it('should handle null value or precision', () => {
      expect(pipe.transform(rational(1n, 2n), null)).toEqual('1/2');
      expect(pipe.transform(null, null)).toEqual('');
    });
  });
});
