import { TestBed } from '@angular/core/testing';

import { ToArrayPipe } from './to-array.pipe';

describe('ToArrayPipe', () => {
  let pipe: ToArrayPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToArrayPipe],
    });
    pipe = TestBed.inject(ToArrayPipe);
  });

  it('should convert a set to an array', () => {
    expect(pipe.transform(new Set(['id']))).toEqual(['id']);
  });
});
