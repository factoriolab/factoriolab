import { Pipe, PipeTransform } from '@angular/core';

import { Rational } from '~/models';

@Pipe({ name: 'precisionExample' })
export class PrecisionExamplePipe implements PipeTransform {
  static value = Rational.from([1, 3]);

  transform(value: number | null | undefined): string {
    if (value == null) {
      return PrecisionExamplePipe.value.toFraction();
    }

    return PrecisionExamplePipe.value.toPrecision(value).toString();
  }
}
