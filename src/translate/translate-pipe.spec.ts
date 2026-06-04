import { TestBed } from '@angular/core/testing';

import { TranslatePipe } from './translate-pipe';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new TranslatePipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });
});
