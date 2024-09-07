import { inject, Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngrx/store';

import { LabParams, Step, Zip } from '~/models';
import { RouterService } from '~/services';
import { Recipes } from '~/store';

@Pipe({ name: 'stepHref', standalone: true })
export class StepHrefPipe implements PipeTransform {
  store = inject(Store);
  routerSvc = inject(RouterService);

  data = this.store.selectSignal(Recipes.selectAdjustedDataset);

  async transform(
    value: Step,
    zipPartial: Zip<LabParams>,
  ): Promise<LabParams | null> {
    let step = value;
    if (step.recipeId) {
      const recipe = this.data().adjustedRecipe[step.recipeId];
      if (recipe.isTechnology && recipe.productivity && value.items) {
        // Adjust items to account for productivity bonus
        step = {
          ...value,
          ...{ items: value.items.div(recipe.productivity) },
        };
      }
    }
    return this.routerSvc.stepHref(step, zipPartial, this.data().hash);
  }
}
