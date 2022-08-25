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
});
