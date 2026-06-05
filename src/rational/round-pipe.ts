import { Pipe, PipeTransform } from '@angular/core';

import { Rational, rational } from '~/rational/rational';

@Pipe({ name: 'round' })
export class RoundPipe implements PipeTransform {
  transform(value: Rational | string | number | null | undefined): string {
    if (value == null) return '';
    if (typeof value === 'string') value = rational(value);
    if (value instanceof Rational) value = value.toNumber();

    let suffix = '';

    if (value >= 1000000000) {
      value /= 1000000000;
      suffix = 'G';
    } else if (value >= 1000000) {
      value /= 1000000;
      suffix = 'M';
    } else if (value >= 1000) {
      value /= 1000;
      suffix = 'k';
    }

    return (
      value.toLocaleString(undefined, { maximumFractionDigits: 2 }) + suffix
    );
  }
}
