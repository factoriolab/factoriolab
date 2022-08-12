import { Pipe, PipeTransform } from '@angular/core';

import { Dataset } from '~/models';
import { DisplayService } from '~/services/display.service';

@Pipe({ name: 'recipeTooltip' })
export class RecipeTooltipPipe implements PipeTransform {
  constructor(private displaySvc: DisplayService) {}

  transform(value: string | null | undefined, data: Dataset): string {
    if (value == null) return '';

    const recipe = data.recipeEntities[value];

    if (recipe == null) return '';

    const timeHtml = this.displaySvc.icon('time', recipe.time);
    const inHtml = Object.keys(recipe.in)
      .map((i) => this.displaySvc.icon(i, recipe.in[i]))
      .join('');
    const outHtml = Object.keys(recipe.out)
      .map((i) => this.displaySvc.icon(i, recipe.out[i]))
      .join('');
    const producersHtml = recipe.producers
      .map((i) => this.displaySvc.icon(i, ''))
      .join('');

    return `<div>${recipe.name}</div><div class="d-flex align-items-center justify-content-center\
    flex-wrap mt-2">${timeHtml}${inHtml}<i class="m-1 me-2 fa-solid fa-arrow-right"></i>${outHtml}\
    </div><div class="d-flex align-items-center justify-content-center flex-wrap mt-2">\
    ${producersHtml}</div>`;
  }
}
