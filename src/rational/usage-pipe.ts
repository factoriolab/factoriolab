import { Pipe, PipeTransform } from '@angular/core';

import { Rational } from '~/rational/rational';
import { toNumber } from '~/utils/number';

@Pipe({ name: 'usage' })
export class UsagePipe implements PipeTransform {
  transform(value: Rational | string | number | null | undefined): string {
    if (value == null) return '';
    value = toNumber(value);

    let suffix = '';

    if (value >= 1000000) {
      value /= 1000000;
      suffix = ' GW';
    } else if (value >= 1000) {
      value /= 1000;
      suffix = ' MW';
    } else suffix = ' kW';

    return (
      value.toLocaleString(undefined, { maximumFractionDigits: 2 }) + suffix
    );
  }
}
