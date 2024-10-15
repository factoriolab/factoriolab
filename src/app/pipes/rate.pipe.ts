import { Pipe, PipeTransform } from '@angular/core';

import { Rational, rational } from '~/models/rational';

@Pipe({ name: 'rate', standalone: true })
export class RatePipe implements PipeTransform {
  static transform(value: Rational, precision: number | null): string {
    if (precision == null) return value.toFraction();

    if (precision === -2) {
      const num = Math.round(value.mul(rational(100n)).toNumber());
      return num.toString();
    }

    const num = value.toPrecision(precision);
    let result = num.toString();
    if (precision > 0) {
      /**
       * Check whether value is lower than minimum rounded-up value, and prepend
       * < if so. E.G. if value is 0.001 and rounding to one digit, display <0.1
       */
      const compare = rational(1, Math.pow(10, precision));
      if (value.gt(rational.zero) && value.lt(compare)) result = `<${result}`;

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

  transform(value: Rational, precision: number | null): string {
    return RatePipe.transform(value, precision);
  }
}
