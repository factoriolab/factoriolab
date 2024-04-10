import { Injectable } from '@angular/core';

import { IdType, Rational, rational, Recipe } from '~/models';

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
    if (value.gt(rational(0n))) return `+${rat}%`;
    if (value.lt(rational(0n))) return `${rat}%`;
    return '';
  }

  recipeProcess(recipe: Recipe): string {
    const timeHtml = this.icon('time', recipe.time.toNumber());
    const inHtml = Object.keys(recipe.in)
      .map((i) => this.icon(i, recipe.in[i].toNumber()))
      .join('');
    const outHtml = Object.keys(recipe.out)
      .map((i) => this.icon(i, recipe.out[i].toNumber()))
      .join('');
    return `${timeHtml}${inHtml}<i class="m-1 me-2 fa-solid fa-arrow-right"></i>${outHtml}`;
  }
}
