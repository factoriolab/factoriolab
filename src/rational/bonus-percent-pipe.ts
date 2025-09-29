import { Pipe, PipeTransform } from '@angular/core';

import { Rational, rational } from '~/rational/rational';

@Pipe({ name: 'bonusPercent' })
export class BonusPercentPipe implements PipeTransform {
  transform(value: Rational | null | undefined): string {
    if (value == null) return '';

    const pct = value
      .mul(rational(100n))
      .round()
      .toNumber()
      .toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (value.gt(rational.zero)) return `+${pct}%`;
    if (value.lt(rational.zero)) return `${pct}%`;
    return '';
  }
}
