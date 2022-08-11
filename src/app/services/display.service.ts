import { Injectable } from '@angular/core';

import { Rational } from '~/models';

@Injectable({ providedIn: 'root' })
export class DisplayService {
  icon(id: string, num: string | number): string {
    return `<i class="m-1 me-2 lab-icon ${id}"><span>${num}</span></i>`;
  }

  round(value: Rational): number {
    return Number(value.toNumber().toFixed(2));
  }

  power(value: Rational | string | number): string {
    if (typeof value === 'string') {
      value = Rational.fromString(value);
    } else if (typeof value === 'number') {
      value = Rational.fromNumber(value);
    }
    if (value.abs().lt(Rational.thousand)) {
      return `${this.round(value)} kW`;
    } else {
      return `${this.round(value.div(Rational.thousand))} MW`;
    }
  }

  toBonusPercent(value: Rational): string | null {
    const rational = this.round(value.mul(Rational.hundred));
    if (value.gt(Rational.zero)) {
      return `+${rational}%`;
    } else if (value.lt(Rational.zero)) {
      return `${rational}%`;
    } else {
      return null;
    }
  }
}
