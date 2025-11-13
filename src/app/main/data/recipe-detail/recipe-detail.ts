import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Button } from '~/components/button/button';
import { Checkbox } from '~/components/checkbox/checkbox';
import { Icon } from '~/components/icon/icon';
import { InputNumber } from '~/components/input-number/input-number';
import { Recipe } from '~/data/schema/recipe';
import { UsagePipe } from '~/rational/usage-pipe';
import { TranslatePipe } from '~/translate/translate-pipe';
import { updateSetIds } from '~/utils/set';

import { Detail } from '../detail/detail';
import { DetailBase } from '../detail-base';

@Component({
  selector: 'lab-recipe-detail',
  imports: [
    FormsModule,
    RouterLink,
    Button,
    Checkbox,
    Icon,
    InputNumber,
    TranslatePipe,
    UsagePipe,
    Detail,
  ],
  templateUrl: './recipe-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeDetail extends DetailBase<Recipe> {
  protected readonly settings = this.settingsStore.settings;

  protected readonly obj = computed(
    (): Recipe | undefined =>
      this.settingsStore.dataset().recipeRecord[this.id()],
  );

  protected readonly category = computed(() => {
    const obj = this.obj();
    if (obj == null) return;
    return this.settingsStore.dataset().categoryRecord[obj.category];
  });

  protected readonly recipeSettings = computed(
    () => this.recipesStore.settings()[this.id()],
  );

  protected readonly info = computed(() => {
    const id = this.id();
    const data = this.data();
    const recipe = data.recipeRecord[id];
    return {
      ingredientIds: Object.keys(recipe?.in ?? {}),
      catalystIds: Object.keys(recipe?.catalyst ?? {}),
      productIds: Object.keys(recipe?.out ?? {}),
    };
  });

  protected readonly unlockedBy = computed(() => {
    const id = this.id();
    const data = this.data();
    return data.technologyIds.filter((i) =>
      data.technologyRecord[i].unlockedRecipes?.includes(id),
    );
  });

  changeExcluded(excluded: boolean): void {
    const value = updateSetIds(
      this.id(),
      excluded,
      this.settings().excludedRecipeIds,
    );
    this.settingsStore.updateField(
      'excludedRecipeIds',
      value,
      this.settings().defaultExcludedRecipeIds,
    );
  }

  changeChecked(value: boolean): void {
    const checkedRecipeIds = updateSetIds(
      this.id(),
      value,
      this.settings().checkedRecipeIds,
    );
    this.settingsStore.apply({ checkedRecipeIds });
  }
}
