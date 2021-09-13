import { Directive } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';

@Directive({
  selector: '[labValidateOverclock][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ValidateOverclockDirective,
      multi: true,
    },
  ],
})
export class ValidateOverclockDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    if (control.value == null) {
      return null;
    }
    try {
      const value = Number(control.value);
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
}
