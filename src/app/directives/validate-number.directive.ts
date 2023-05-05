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
  @Input() set minimum(value: string | null) {
    this._minimum = value != null ? Rational.fromString(value) : null;
  }
  @Input() set maximum(value: string | null) {
    this._maximum = value != null ? Rational.fromString(value) : null;
  }

  private _minimum: Rational | null = Rational.zero;
  private _maximum: Rational | null = null;

  validate(control: AbstractControl): ValidationErrors | null {
    if (control.value == null) {
      return null;
    }

    try {
      const rational = Rational.fromString(control.value);
      if (
        (this._minimum == null || rational.gte(this._minimum)) &&
        (this._maximum == null || rational.lte(this._maximum))
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
