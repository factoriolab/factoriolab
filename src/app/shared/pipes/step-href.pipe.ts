import { Pipe, PipeTransform } from '@angular/core';

import { Dataset, Step } from '~/models';
import { RouterService } from '~/services';

@Pipe({ name: 'stepHref' })
export class StepHrefPipe implements PipeTransform {
  constructor(private routerSvc: RouterService) {}

  transform(value: Step, data: Dataset): string | null {
    let step = value;
    if (step.recipeId) {
      const recipe = data.recipeR[step.recipeId];
      if (recipe.adjustProd && recipe.productivity && value.items) {
        // Adjust items to account for productivity bonus
        step = {
          ...value,
          ...{ items: value.items.div(recipe.productivity) },
        };
      }
    }
    return this.routerSvc.stepHref(step, data.hash);
  }
}
