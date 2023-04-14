import { Pipe, PipeTransform } from '@angular/core';

import { Dataset } from '~/models';
import { DisplayService } from '~/services';

@Pipe({ name: 'itemTooltip' })
export class ItemTooltipPipe implements PipeTransform {
  constructor(private displaySvc: DisplayService) {}

  transform(value: string | null | undefined, data: Dataset): string {
    if (value == null) return '';

    const recipeId = data.itemRecipeId[value];

    if (recipeId == null) {
      const item = data.itemEntities[value];

      if (item == null) return '';

      return item.name;
    } else {
      return this.displaySvc.recipeTooltip(value, data);
    }
  }
}
