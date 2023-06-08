import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Dataset, IdType, Rational, Recipe, Technology } from '~/models';

@Injectable({ providedIn: 'root' })
export class DisplayService {
  constructor(private translateSvc: TranslateService) {}

  icon(id: string, num?: string | number, type: IdType = 'item'): string {
    let numStr = '';
    if (typeof num === 'number') {
      numStr = Number(num.toFixed(2)).toString();
    } else if (typeof num === 'string') {
      numStr = num;
    }

    return `<i class="me-2 lab-icon sm ${type} padded ${id}"><span>${numStr}</span></i>`;
  }

  table(rows: [string, string][]): string {
    let html = `<table class="w-100">`;
    rows.forEach(
      (r) =>
        (html += `<tr><td class="text-nowrap">${r[0]}</td><td class="text-nowrap">${r[1]}</td></tr>`)
    );
    html += `</table>`;
    return html;
  }

  round(value: Rational): string {
    return Number(value.toNumber().toFixed(2)).toString();
  }

  power(value: Rational | string | number): string {
    if (!(value instanceof Rational)) {
      value = Rational.from(value);
    }

    if (value.abs().lt(Rational.thousand)) {
      return `${this.round(value)} kW`;
    } else {
      return `${this.round(value.div(Rational.thousand))} MW`;
    }
  }

  toBonusPercent(value: Rational): string {
    const rational = this.round(value.mul(Rational.hundred));
    if (value.gt(Rational.zero)) {
      return `+${rational}%`;
    } else if (value.lt(Rational.zero)) {
      return `${rational}%`;
    } else {
      return '';
    }
  }

  recipeTooltip(
    value: string | null | undefined,
    data: Dataset,
    name?: string
  ): string {
    if (value == null) return '';

    const recipe = data.recipeEntities[value];
    const technology = data.technologyEntities[value];

    if (recipe == null) return '';

    return `<div>${
      name ?? recipe.name
    }</div><div class="d-flex align-items-center justify-content-center\
    flex-wrap mt-2">${this.recipeProcess(recipe)}\
    </div>${this.recipeProducedBy(recipe)}${this.recipeUnlockedBy(
      recipe
    )}${this.technologyPrerequisites(technology)}`;
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

  recipeProducedBy(recipe: Recipe): string {
    return `<small><div>${this.translateSvc.instant(
      'data.producers'
    )}</div>${recipe.producers.map((i) => this.icon(i, '')).join('')}</small>`;
  }

  recipeUnlockedBy(recipe: Recipe): string {
    if (recipe.unlockedBy == null) return '';

    const a = `<small><div>${this.translateSvc.instant(
      'data.unlockedBy'
    )}</div>${this.icon(recipe.unlockedBy, undefined, 'recipe')}</small>`;

    return a;
  }

  technologyPrerequisites(technology: Technology | undefined): string {
    if (technology?.prerequisites == null) return '';

    const a = `<small><div>${this.translateSvc.instant(
      'data.prerequisites'
    )}</div>${technology.prerequisites
      .map((i) => this.icon(i, undefined, 'recipe'))
      .join('')}</small>`;

    return a;
  }
}
