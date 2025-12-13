import { Pipe, PipeTransform } from '@angular/core';

import { Rational } from '~/rational/rational';
import { toNumber } from '~/utils/number';

@Pipe({ name: 'bonusPercent' })
export class BonusPercentPipe implements PipeTransform {
  transform(
    value: Rational | string | number | null | undefined,
    excludePlus = false,
  ): string {
    if (value == null) return '';
    value = toNumber(value);
    if (value === 0) return '';

    const pct = Math.round(value * 100).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
    if (value > 0 && !excludePlus) return `+${pct}%`;
    else return `${pct}%`;
  }
}
