import { Pipe, PipeTransform } from '@angular/core';

import { Rational } from '~/models';

@Pipe({ name: 'labRate' })
export class RatePipe implements PipeTransform {
  transform(value: Rational, precision: number | null): string {
    if (precision == null) {
      return value.toFraction();
    } else {
      const num =
        precision === -2
          ? Math.round(value.mul(Rational.hundred).toNumber())
          : value.toPrecision(precision);
      const result = num.toString();
      if (precision > 0) {
        const split = result.split('.');
        if (split.length > 1) {
          if (split[1].length < precision) {
            const spaces = precision - split[1].length;
            return result + '0'.repeat(spaces);
          }
        } else if (value.isInteger()) {
          return result + ' '.repeat(precision + 1);
        } else {
          return result + '.' + '0'.repeat(precision);
        }
      }
      return result;
    }
  }
}
