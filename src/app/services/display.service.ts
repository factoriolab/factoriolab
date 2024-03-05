import { Injectable } from '@angular/core';

import { IdType, Rational, Recipe } from '~/models';

@Injectable({ providedIn: 'root' })
export class DisplayService {
  icon(id: string, num?: string | number, type: IdType = 'item'): string {
    let numStr = '';
    if (typeof num === 'number') {
      numStr = Number(num.toFixed(2)).toString();
    } else if (typeof num === 'string') {
      numStr = num;
    }

    return `<i class="me-2 lab-icon sm ${type} padded ${id}"><span>${numStr}</span></i>`;
  }

  round(value: Rational | string | number): string {
    if (typeof value === 'string') value = Rational.fromString(value);
    if (value instanceof Rational) value = value.toNumber();
    return Number(value.toFixed(2)).toString();
  }

  usage(value: Rational | string | number): string {
    if (!(value instanceof Rational)) value = Rational.from(value);
    if (value.abs().lt(Rational.thousand)) return `${this.round(value)} kW`;
    return `${this.round(value.div(Rational.thousand))} MW`;
  }

  toBonusPercent(value: Rational): string {
    const rational = this.round(value.mul(Rational.hundred));
    if (value.gt(Rational.zero)) return `+${rational}%`;
    if (value.lt(Rational.zero)) return `${rational}%`;
    return '';
  }

  recipeProcess(recipe: Recipe): string {
    const timeHtml = this.icon('time', recipe.time);
    const inHtml = Object.keys(recipe.in)
      .map((i) => this.icon(i, recipe.in[i]))
      .join('');
    const outHtml = Object.keys(recipe.out)
      .map((i) => this.icon(i, recipe.out[i]))
      .join('');
    return `${timeHtml}${inHtml}<i class="m-1 me-2 fa-solid fa-arrow-right"></i>${outHtml}`;
  }
}
