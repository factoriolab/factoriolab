import { Directive } from '@angular/core';
import { FormControl, NG_VALIDATORS } from '@angular/forms';

import { Rational } from '~/models';

export function validateNumber(
  c: FormControl
): { validateNumber: { valid: boolean } } {
  if (c.value == null) {
    return null;
  }
  try {
    Rational.fromString(c.value);
    return null;
  } catch {
    return {
      validateNumber: {
        valid: false,
      },
    };
  }
}

@Directive({
  selector: '[labValidateNumber][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useValue: validateNumber, multi: true },
  ],
})
export class ValidateNumberDirective {}
