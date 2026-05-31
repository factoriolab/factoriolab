import { TestBed } from '@angular/core/testing';

import { StepIdPipe } from './step-id-pipe';

describe('StepIdPipe', () => {
  let pipe: StepIdPipe;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      pipe = new StepIdPipe();
    });
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });
});
