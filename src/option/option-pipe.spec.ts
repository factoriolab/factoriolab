import { TestBed } from '@angular/core/testing';

import { OptionPipe } from './option-pipe';

describe('OptionPipe', () => {
  let pipe: OptionPipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new OptionPipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });
});
