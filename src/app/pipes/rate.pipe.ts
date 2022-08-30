import { Pipe, PipeTransform } from '@angular/core';

import { Rational } from '~/models';

@Pipe({ name: 'rate' })
export class RatePipe implements PipeTransform {
  transform(value: Rational, precision: number | null): string {
    if (precision == null) {
      return value.toFraction();
    } else {
      if (precision === -2) {
        const num = Math.round(value.mul(Rational.hundred).toNumber());
        return num.toString();
      }
      const num = value.toPrecision(precision);
      if (precision > 0) {
        const result = num.toString();
        const split = result.split('.');
        if (split.length > 1) {
          if (split[1].length < precision) {
            const spaces = precision - split[1].length;
            return num.toString() + '0'.repeat(spaces);
          }
        } else if (value.isInteger()) {
          return num.toString() + ' '.repeat(precision + 1);
        } else {
          return num.toString() + '.' + '0'.repeat(precision);
        }
      }
      return num.toString();
    }
  }
}
