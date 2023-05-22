import { Pipe, PipeTransform } from '@angular/core';

import { Dataset } from '~/models';
import { DisplayService } from '~/services';

@Pipe({ name: 'recipeTooltip' })
export class RecipeTooltipPipe implements PipeTransform {
  constructor(private displaySvc: DisplayService) {}

  transform(value: string | null | undefined, data: Dataset): string {
    return this.displaySvc.recipeTooltip(value, data);
  }
}
