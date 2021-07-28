import { Directive } from '@angular/core';
import { FormControl, NG_VALIDATORS } from '@angular/forms';

export function validateOverclock(c: FormControl): {
  validateOverclock: { valid: boolean };
} {
  if (c.value == null) {
    return null;
  }
  try {
    const value = Number(c.value);
    if (value >= 1 && value <= 250) {
      return null;
    }
  } catch {}
  return {
    validateOverclock: {
      valid: false,
    },
  };
}

@Directive({
  selector: '[labValidateOverclock][ngModel]',
  providers: [
    { provide: NG_VALIDATORS, useValue: validateOverclock, multi: true },
  ],
})
export class ValidateOverclockDirective {}
