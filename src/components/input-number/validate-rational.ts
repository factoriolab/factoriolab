import { Directive, input } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
} from '@angular/forms';

import { Rational, rational } from '~/rational/rational';
import { inRange } from '~/utils/number';

@Directive({
  selector: '[labValidateRational][ngModel]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ValidateRational,
      multi: true,
    },
  ],
})
export class ValidateRational {
  readonly minimum = input<Rational | undefined>(rational.zero);
  readonly maximum = input<Rational | undefined>(undefined);

  validate(
    control: AbstractControl<string | null | undefined>,
  ): ValidationErrors | null {
    if (control.value == null) return null;

    try {
      const value = rational(control.value);
      const min = this.minimum();
      const max = this.maximum();
      if (inRange(value, min, max)) return null;
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
