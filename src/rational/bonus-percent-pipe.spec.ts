import { TestBed } from '@angular/core/testing';

import { BonusPercentPipe } from './bonus-percent-pipe';
import { rational } from './rational';

describe('BonusPercentPipe', () => {
  let pipe: BonusPercentPipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new BonusPercentPipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should convert a rational to a locale percentage', () => {
      expect(pipe.transform(rational(1n, 2n))).toEqual('+50%');
      expect(pipe.transform(rational(-1n, 2n))).toEqual('-50%');
    });

    it('should return an empty string for null or zero values', () => {
      expect(pipe.transform(null)).toEqual('');
      expect(pipe.transform(0)).toEqual('');
    });
  });
});
