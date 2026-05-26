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

  describe('validate', () => {
    it('should check whether a number is within the specified range', () => {
      expect(directive.validate({} as any)).toBeNull();
      expect(directive.validate({ value: '1' } as any)).toBeNull();
      expect(directive.validate({ value: '-1' } as any)).toEqual({
        validateNumber: { valid: false },
      });
    });
  });
});
