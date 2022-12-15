import { TestBed } from '@angular/core/testing';

import { PrecisionExamplePipe } from './precision-example.pipe';

describe('PrecisionExamplePipe', () => {
  let pipe: PrecisionExamplePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PrecisionExamplePipe] });
    pipe = TestBed.inject(PrecisionExamplePipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should give examples for fraction or decimal precision', () => {
      expect(pipe.transform(null)).toEqual('1/3');
      expect(pipe.transform(2)).toEqual('0.34');
    });
  });
});
