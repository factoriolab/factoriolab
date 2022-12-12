import { Pipe, PipeTransform } from '@angular/core';

import { Dataset } from '~/models';
import { DisplayService } from '~/services';

@Pipe({ name: 'recipeTooltip' })
export class RecipeTooltipPipe implements PipeTransform {
  constructor(private displaySvc: DisplayService) {}

  transform(value: string | null | undefined, data: Dataset): string {
    if (value == null) return '';

    const recipe = data.recipeEntities[value];

    if (recipe == null) return '';

    const producersHtml = recipe.producers
      .map((i) => this.displaySvc.icon(i, ''))
      .join('');

    return `<div>${
      recipe.name
    }</div><div class="d-flex align-items-center justify-content-center\
    flex-wrap mt-2">${this.displaySvc.recipeProcess(recipe)}\
    </div><div class="d-flex align-items-center justify-content-center flex-wrap mt-2">\
    ${producersHtml}</div>`;
  }
}
