import { TestBed } from '@angular/core/testing';

import { PercentPadPipe } from './percent-pad-pipe';

describe('PercentPadPipe', () => {
  let pipe: PercentPadPipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new PercentPadPipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should pad the left side of percents for spacing purposes', () => {
      expect(pipe.transform('5')).toEqual('   5%');
    });

    it('should return an empty string for nullish values', () => {
      expect(pipe.transform(undefined)).toEqual('');
    });
  });
});
