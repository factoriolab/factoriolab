import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

import { InputNumberComponent } from '~/components';
import { coalesce, updateSetIds } from '~/helpers';
import { Game, Rational, Recipe, RecipeSettings } from '~/models';
import {
  IconClassPipe,
  IconSmClassPipe,
  RoundPipe,
  TranslatePipe,
  UsagePipe,
} from '~/pipes';
import { Recipes, Settings } from '~/store';

import { DetailComponent } from '../../models';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    BreadcrumbModule,
    ButtonModule,
    CheckboxModule,
    IconClassPipe,
    IconSmClassPipe,
    InputNumberComponent,
    RoundPipe,
    TranslatePipe,
    UsagePipe,
  ],
  templateUrl: './recipe.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeComponent extends DetailComponent {
  recipesStateRaw = this.store.selectSignal(Recipes.recipesState);
  recipesState = this.store.selectSignal(Recipes.selectRecipesState);
  settings = this.store.selectSignal(Settings.selectSettings);

  obj = computed<Recipe | undefined>(
    () => this.data().recipeEntities[this.id()],
  );
  breadcrumb = computed<MenuItem[]>(() => [
    this.parent() ?? {},
    { label: this.obj()?.name },
  ]);
  info = computed(() => {
    const id = this.id();
    const data = this.data();
    const recipe = data.recipeEntities[id];
    return {
      category: data.categoryEntities[coalesce(recipe?.category, '')],
      ingredientIds: Object.keys(recipe?.in ?? {}),
      catalystIds: Object.keys(recipe?.catalyst ?? {}),
      productIds: Object.keys(recipe?.out ?? {}),
    };
  });
  recipeSettings = computed<RecipeSettings | undefined>(
    () => this.recipesState()[this.id()],
  );
  recipeR = computed<Recipe | undefined>(
    () => this.data().adjustedRecipe[this.id()],
  );

  Game = Game;

  changeExcluded(value: boolean): void {
    this.setExcludedRecipes(
      updateSetIds(this.id(), value, this.settings().excludedRecipeIds),
      new Set(coalesce(this.data().defaults?.excludedRecipeIds, [])),
    );
  }

  changeChecked(value: boolean): void {
    this.setCheckedRecipes(
      updateSetIds(this.id(), value, this.settings().checkedRecipeIds),
    );
  }

  /** Action dispatch methods */
  setExcludedRecipes(value: Set<string>, def: Set<string>): void {
    this.store.dispatch(Settings.setExcludedRecipes({ value, def }));
  }

  setCheckedRecipes(checkedRecipeIds: Set<string>): void {
    this.store.dispatch(Settings.setCheckedRecipes({ checkedRecipeIds }));
  }

  setRecipeCost(id: string, value: Rational): void {
    this.store.dispatch(Recipes.setCost({ id, value }));
  }

  resetRecipe(id: string): void {
    this.store.dispatch(Recipes.resetRecipe({ id }));
  }
}
