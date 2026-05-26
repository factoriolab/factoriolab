import { TestBed } from '@angular/core/testing';

import { ValidateRational } from './validate-rational';

describe('ValidateRational', () => {
  let directive: ValidateRational;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      directive = new ValidateRational();
    });
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });
});
