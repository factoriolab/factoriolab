import { Directive, input } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';

import { Rational, rational } from '~/models/rational';
import { Optional } from '~/models/utils';

@Directive({
  selector: '[labValidateNumber][ngModel]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: ValidateNumberDirective,
      multi: true,
    },
  ],
})
export class ValidateNumberDirective implements Validator {
  minimum = input<Optional<Rational>>(rational.zero);
  maximum = input<Optional<Rational>>(undefined);

  validate(
    control: AbstractControl<string | null | undefined>,
  ): ValidationErrors | null {
    if (control.value == null) return null;

    try {
      const value = rational(control.value);
      const min = this.minimum();
      const max = this.maximum();
      if ((min == null || value.gte(min)) && (max == null || value.lte(max)))
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
