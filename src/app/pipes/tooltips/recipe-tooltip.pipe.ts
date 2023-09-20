import { Pipe, PipeTransform } from '@angular/core';

import { RawDataset } from '~/models';
import { DisplayService } from '~/services';

@Pipe({ name: 'recipeTooltip' })
export class RecipeTooltipPipe implements PipeTransform {
  constructor(private displaySvc: DisplayService) {}

  transform(value: string | null | undefined, data: RawDataset): string {
    return this.displaySvc.recipeTooltip(value, data);
  }
}
