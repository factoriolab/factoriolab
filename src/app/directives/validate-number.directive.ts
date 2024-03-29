import { Directive, input } from '@angular/core';
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
  minimum = input<Rational | null>(Rational.zero);
  maximum = input<Rational | null>(null);

  validate(control: AbstractControl): ValidationErrors | null {
    if (control.value == null) {
      return null;
    }

    try {
      const rational = control.value;
      const min = this.minimum();
      const max = this.maximum();
      if (
        (min == null || rational.gte(min)) &&
        (max == null || rational.lte(max))
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
