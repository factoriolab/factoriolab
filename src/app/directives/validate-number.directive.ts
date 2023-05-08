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
  @Input() minimum: Rational | null = Rational.zero;
  @Input() maximum: Rational | null = null;

  validate(control: AbstractControl): ValidationErrors | null {
    if (control.value == null) {
      return null;
    }

    try {
      const rational = Rational.fromString(control.value);
      if (
        (this.minimum == null || rational.gte(this.minimum)) &&
        (this.maximum == null || rational.lte(this.maximum))
      )
        return null;
    } catch {
      // ignore error
    }

    return {
      validateNumber: {
        valid: false,
      },
    };
  }
}
