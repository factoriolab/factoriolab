import { TestBed } from '@angular/core/testing';

import { OptionsPipe } from './options.pipe';

describe('OptionsPipe', () => {
  let pipe: OptionsPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [OptionsPipe] });
    pipe = TestBed.inject(OptionsPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });
});
