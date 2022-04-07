import { Directive, Input } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';

import { Rational } from '~/models';

@Directive({
  selector: '[labValidateNumber][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ValidateNumberDirective,
      multi: true,
    },
  ],
})
export class ValidateNumberDirective implements Validator {
  @Input() set labValidateMinimum(value: string) {
    this.minimum = Rational.fromString(value);
  }

  minimum = Rational.zero;

  validate(control: AbstractControl): ValidationErrors | null {
    if (control.value == null) {
      return null;
    }
    try {
      const rational = Rational.fromString(control.value);
      if (rational.gte(this.minimum)) {
        return null;
      }
    } catch {}
    return {
      validateNumber: {
        valid: false,
      },
    };
  }
}
