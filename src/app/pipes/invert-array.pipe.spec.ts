import { TestBed } from '@angular/core/testing';

import { InvertArrayPipe } from './invert-array.pipe';

describe('InvertArrayPipe', () => {
  let pipe: InvertArrayPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [InvertArrayPipe] });
    pipe = TestBed.inject(InvertArrayPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });
});
