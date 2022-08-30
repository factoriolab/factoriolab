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
});
