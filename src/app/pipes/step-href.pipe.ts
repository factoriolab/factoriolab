import { Pipe, PipeTransform } from '@angular/core';

import { Dataset, Step } from '~/models';
import { RouterService } from '~/services';

@Pipe({ name: 'labStepHref' })
export class StepHrefPipe implements PipeTransform {
  constructor(private router: RouterService) {}

  transform(value: Step, data: Dataset): string {
    let step = value;
    if (step.recipeId) {
      const recipe = data.recipeR[step.recipeId];
      if (recipe.adjustProd && recipe.productivity) {
        // Adjust items to account for productivity bonus
        step = {
          ...value,
          ...{ items: value.items.div(recipe.productivity) },
        };
      }
    }
    return this.router.stepHref(step, data.hash);
  }
}
