import { inject, Pipe, PipeTransform } from '@angular/core';

import { spread } from '~/helpers';
import { LabParams } from '~/models/lab-params';
import { Step } from '~/models/step';
import { Zip } from '~/models/zip';
import { RouterService } from '~/services/router.service';
import { RecipesService } from '~/store/recipes.service';

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
      if (recipe?.flags.has('technology') && value.items) {
        // Adjust items to account for productivity bonus
        step = spread(value, {
          items: value.items.div(recipe.effects.productivity),
        });
      }
    }
    return this.routerSvc.stepHref(step, zipPartial, this.data().hash);
  }
}
