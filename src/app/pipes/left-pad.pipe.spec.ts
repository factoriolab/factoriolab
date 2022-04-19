import { TestBed } from '@angular/core/testing';

import { LeftPadPipe } from './left-pad.pipe';

describe('LeftPadPipe', () => {
  let pipe: LeftPadPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LeftPadPipe] });
    pipe = TestBed.inject(LeftPadPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should add spaces to ensure string is at least 4 characters', () => {
      expect(pipe.transform('asd')).toEqual(' asd');
    });

    it('should handle null value', () => {
      expect(pipe.transform(undefined)).toEqual('');
    });
  });
});
