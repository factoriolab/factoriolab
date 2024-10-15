import { Injectable } from '@angular/core';

import { Rational, rational } from '~/models/rational';

@Injectable({ providedIn: 'root' })
export class DisplayService {
  round(value: Rational | string | number): string {
    if (typeof value === 'string') value = rational(value);
    if (value instanceof Rational) value = value.toNumber();
    return Number(value.toFixed(2)).toString();
  }

  usage(value: Rational | string | number): string {
    if (!(value instanceof Rational)) value = rational(value);
    if (value.abs().lt(rational(1000n))) return `${this.round(value)} kW`;
    return `${this.round(value.div(rational(1000n)))} MW`;
  }

  toBonusPercent(value: Rational): string {
    const rat = this.round(value.mul(rational(100n)));
    if (value.gt(rational.zero)) return `+${rat}%`;
    if (value.lt(rational.zero)) return `${rat}%`;
    return '';
  }
}
