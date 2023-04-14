import { Pipe, PipeTransform } from '@angular/core';

import { Dataset } from '~/models';
import { DisplayService } from '~/services';

@Pipe({ name: 'recipeTooltip' })
export class RecipeTooltipPipe implements PipeTransform {
  constructor(private displaySvc: DisplayService) {}

  transform(value: string | null | undefined, data: Dataset): string {
    if (value == null) return '';

    const recipe = data.recipeEntities[value];
    const technology = data.technologyEntities[value];

    if (recipe == null) return '';

    return `<div>${
      recipe.name
    }</div><div class="d-flex align-items-center justify-content-center\
    flex-wrap mt-2">${this.displaySvc.recipeProcess(recipe)}\
    </div>${this.displaySvc.recipeProducedBy(
      recipe
    )}${this.displaySvc.recipeUnlockedBy(
      recipe
    )}${this.displaySvc.technologyPrerequisites(technology)}`;
  }
}
