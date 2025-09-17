import { Pipe, PipeTransform } from '@angular/core';

import { Rational, rational } from '../../rational/rational';

@Pipe({ name: 'rate', standalone: true })
export class RatePipe implements PipeTransform {
  transform(value: Rational, precision: number | null): string {
    if (precision == null) return value.toFraction();

    if (precision === -2) {
      const num = Math.round(value.mul(rational(100n)).toNumber());
      return num.toLocaleString();
    }

    if (value.isInteger()) {
      let result = value.toLocaleString();
      if (precision > 0) result += ' '.repeat(precision + 1);
      return result;
    }

    let result = value.toLocaleString(precision, true);
    if (precision > 0) {
      /**
       * Check whether value is lower than minimum rounded-up value, and prepend
       * < if so. E.G. if value is 0.001 and rounding to one digit, display <0.1
       */
      const compare = rational(1, Math.pow(10, precision));
      if (value.gt(rational.zero) && value.lt(compare)) result = `<${result}`;
    }

    return result;
  }
}
