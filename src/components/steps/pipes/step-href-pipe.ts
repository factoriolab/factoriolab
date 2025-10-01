import { inject, Pipe, PipeTransform } from '@angular/core';

import { Step } from '~/solver/step';
import { RecipesStore } from '~/state/recipes/recipes-store';
import { LabParams } from '~/state/router/lab-params';
import { RouterSync } from '~/state/router/router-sync';
import { ZipData } from '~/state/router/zip-data';
import { spread } from '~/utils/object';

@Pipe({ name: 'stepHref', standalone: true })
export class StepHrefPipe implements PipeTransform {
  recipesStore = inject(RecipesStore);
  routerSync = inject(RouterSync);

  async transform(
    value: Step,
    zipPartial: ZipData<LabParams>,
  ): Promise<LabParams | null> {
    const data = this.recipesStore.adjustedDataset();
    let step = value;
    if (step.recipeId) {
      const recipe = data.adjustedRecipe[step.recipeId];
      if (recipe?.flags.has('technology') && value.items) {
        // Adjust items to account for productivity bonus
        step = spread(value, {
          items: value.items.div(recipe.effects.productivity),
        });
      }
    }

    return this.routerSync.stepHref(step, zipPartial, data.hash);
  }
}
