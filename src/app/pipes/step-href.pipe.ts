import { inject, Pipe, PipeTransform } from '@angular/core';

import { spread } from '~/helpers';
import { LabParams } from '~/models/lab-params';
import { Step } from '~/models/step';
import { Zip } from '~/models/zip';
import { RecipesService } from '~/services/recipes.service';
import { RouterService } from '~/services/router.service';

@Pipe({ name: 'stepHref', standalone: true })
export class StepHrefPipe implements PipeTransform {
  recipesSvc = inject(RecipesService);
  routerSvc = inject(RouterService);

  data = this.recipesSvc.adjustedDataset;

  async transform(
    value: Step,
    zipPartial: Zip<LabParams>,
  ): Promise<LabParams | null> {
    let step = value;
    if (step.recipeId) {
      const recipe = this.data().adjustedRecipe[step.recipeId];
      if (recipe.isTechnology && recipe.productivity && value.items) {
        // Adjust items to account for productivity bonus
        step = spread(value, { items: value.items.div(recipe.productivity) });
      }
    }
    return this.routerSvc.stepHref(step, zipPartial, this.data().hash);
  }
}
