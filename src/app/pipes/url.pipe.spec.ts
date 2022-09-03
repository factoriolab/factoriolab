import { TestBed } from '@angular/core/testing';

import { UrlPipe } from './url.pipe';

describe('UrlPipe', () => {
  let pipe: UrlPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [UrlPipe] });
    pipe = TestBed.inject(UrlPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform', () => {
    it('should convert a url to a valid css background', () => {
      expect(pipe.transform('test')).toEqual('url(test)');
    });

    it('should handle null values', () => {
      expect(pipe.transform(null)).toEqual('');
    });
  });
});
