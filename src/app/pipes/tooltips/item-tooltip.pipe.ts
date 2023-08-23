import { Pipe, PipeTransform } from '@angular/core';

import { Dataset } from '~/models';
import { DisplayService } from '~/services';

@Pipe({ name: 'itemTooltip' })
export class ItemTooltipPipe implements PipeTransform {
  constructor(private displaySvc: DisplayService) {}

  transform(value: string | null | undefined, data: Dataset): string {
    if (value == null) return '';

    const item = data.itemEntities[value];

    if (item == null) return '';

    const recipeIds = data.itemRecipeIds[value];

    if (recipeIds?.length === 1) {
      return this.displaySvc.recipeTooltip(recipeIds[0], data, item.name);
    } else {
      const technology = data.technologyEntities[value];
      return item.name + this.displaySvc.technologyPrerequisites(technology);
    }
  }
}
