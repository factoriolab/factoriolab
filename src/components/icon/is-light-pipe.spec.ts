import { TestBed } from '@angular/core/testing';

import { IsLightPipe } from './is-light-pipe';

describe('IsLightPipe', () => {
  let pipe: IsLightPipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new IsLightPipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should determine whether a color is light enough to require inversion against a light background', () => {
      expect(pipe.transform('#000')).toBeFalse();
      expect(pipe.transform('#fff')).toBeTrue();
    });

    it('should handle an invalid icon', () => {
      expect(pipe.transform(undefined)).toBeFalse();
      expect(pipe.transform('123')).toBeFalse();
    });
  });
});
