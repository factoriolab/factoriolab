import { ChangeDetectionStrategy, Component, computed } from '@angular/core';

import { Recipe } from '~/data/schema/recipe';

import { Detail } from '../detail/detail';
import { DetailBase } from '../detail-base';

@Component({
  selector: 'lab-recipe-detail',
  imports: [Detail],
  templateUrl: './recipe-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeDetail extends DetailBase<Recipe> {
  protected readonly obj = computed(
    (): Recipe | undefined =>
      this.settingsStore.dataset().recipeRecord[this.id()],
  );
}
