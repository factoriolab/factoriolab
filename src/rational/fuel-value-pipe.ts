import { Pipe, PipeTransform } from '@angular/core';

import { Rational, toNumber } from '~/rational/rational';

@Pipe({ name: 'fuelValue' })
export class FuelValuePipe implements PipeTransform {
  transform(value: Rational | string | number | null | undefined): string {
    if (value == null) return '';
    value = toNumber(value);

    let suffix = '';

    if (value >= 1000) {
      value /= 1000;
      suffix = ' GJ';
    } else suffix = ' MJ';

    return (
      value.toLocaleString(undefined, { maximumFractionDigits: 2 }) + suffix
    );
  }
}
