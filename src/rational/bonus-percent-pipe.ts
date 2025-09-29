import { Pipe, PipeTransform } from '@angular/core';

import { Rational, toNumber } from '~/rational/rational';

@Pipe({ name: 'bonusPercent' })
export class BonusPercentPipe implements PipeTransform {
  transform(value: Rational | string | number | null | undefined): string {
    if (value == null) return '';
    value = toNumber(value);
    if (value === 0) return '';

    const pct = Math.round(value * 100).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
    if (value > 0) return `+${pct}%`;
    else return `${pct}%`;
  }
}
