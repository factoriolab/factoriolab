import { TestBed } from '@angular/core/testing';

import { PrecisionExamplePipe } from './precision-example-pipe';

describe('PrecisionExamplePipe', () => {
  let pipe: PrecisionExamplePipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new PrecisionExamplePipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should return a fraction or rounded rational', () => {
      expect(pipe.transform(null)).toEqual('2/3');
      expect(pipe.transform(4)).toEqual('0.6667');
    });
  });
});
