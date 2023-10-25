import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, map } from 'rxjs';

import { AppSharedModule } from '~/app-shared.module';
import { Dataset, Game, RecipeSettings } from '~/models';
import { DisplayService } from '~/services';
import { LabState, Recipes } from '~/store';
import { DataRouteService } from '../../data-route.service';
import { DetailComponent } from '../../models';

@Component({
  standalone: true,
  imports: [CommonModule, AppSharedModule],
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeComponent extends DetailComponent {
  vm$ = combineLatest([
    this.id$,
    this.parent$,
    this.dataRouteSvc.home$,
    this.store.select(Recipes.recipesState),
    this.store.select(Recipes.getRecipesState),
    this.store.select(Recipes.getAdjustedDataset),
  ]).pipe(
    map(([id, parent, home, recipesStateRaw, recipesState, data]) => ({
      id,
      obj: data.recipeEntities[id],
      recipeR: data.recipeR[id],
      category: data.categoryEntities[data.recipeEntities[id]?.category ?? ''],
      breadcrumb: [parent, { label: data.recipeEntities[id]?.name }],
      ingredientIds: Object.keys(data.recipeEntities[id]?.in ?? {}),
      catalystIds: Object.keys(data.recipeEntities[id]?.catalyst ?? {}),
      productIds: Object.keys(data.recipeEntities[id]?.out ?? {}),
      recipeSettingsRaw: recipesStateRaw[id],
      recipeSettings: recipesState[id],
      home,
      data,
    })),
  );

  trueValue = true;

  Game = Game;

  constructor(
    route: ActivatedRoute,
    translateSvc: TranslateService,
    private store: Store<LabState>,
    private dataRouteSvc: DataRouteService,
  ) {
    super(route, translateSvc);
  }

  toggleRecipe(
    id: string,
    recipeSettings: RecipeSettings,
    data: Dataset,
  ): void {
    const value = !recipeSettings.excluded;
    const def = (data.defaults?.excludedRecipeIds ?? []).some((i) => i === id);
    this.setRecipeExcluded(id, value, def);
  }

  /** Action dispatch methods */
  setRecipeExcluded(id: string, value: boolean, def: boolean): void {
    this.store.dispatch(new Recipes.SetExcludedAction({ id, value, def }));
  }

  setRecipeChecked(id: string, value: boolean): void {
    this.store.dispatch(new Recipes.SetCheckedAction({ id, value }));
  }

  setRecipeCost(id: string, value: string): void {
    this.store.dispatch(new Recipes.SetCostAction({ id, value }));
  }

  resetRecipe(value: string): void {
    this.store.dispatch(new Recipes.ResetRecipeAction(value));
  }
}
