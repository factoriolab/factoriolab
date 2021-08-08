import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { Dataset, DefaultIdPayload, MatrixResult } from '~/models';
import { State } from '~/store';
import { getMatrixResult } from '~/store/products';
import * as Recipes from '~/store/recipes';
import * as Settings from '~/store/settings';

@Component({
  selector: 'lab-matrix-container',
  templateUrl: './matrix-container.component.html',
  styleUrls: ['./matrix-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixContainerComponent implements OnInit {
  data$: Observable<Dataset>;
  result$: Observable<MatrixResult>;
  costFactor$: Observable<string>;
  costFactory$: Observable<string>;
  costInput$: Observable<string>;
  costIgnored$: Observable<string>;
  recipeRaw$: Observable<Recipes.RecipesState>;
  modifiedCost$: Observable<boolean>;
  modifiedRecipeCost$: Observable<boolean>;

  constructor(public store: Store<State>) {}

  ngOnInit(): void {
    this.data$ = this.store.select(Recipes.getAdjustedDataset);
    this.result$ = this.store.select(getMatrixResult);
    this.costFactor$ = this.store.select(Settings.getCostFactor);
    this.costFactory$ = this.store.select(Settings.getCostFactory);
    this.costInput$ = this.store.select(Settings.getCostInput);
    this.costIgnored$ = this.store.select(Settings.getCostIgnored);
    this.recipeRaw$ = this.store.select(Recipes.recipesState);
    this.modifiedCost$ = this.store.select(Settings.getModifiedCost);
    this.modifiedRecipeCost$ = this.store.select(Recipes.getContainsCost);
  }

  setCostFactor(data: string): void {
    this.store.dispatch(new Settings.SetCostFactorAction(data));
  }

  setCostFactory(data: string): void {
    this.store.dispatch(new Settings.SetCostFactoryAction(data));
  }

  setCostInput(data: string): void {
    this.store.dispatch(new Settings.SetCostInputAction(data));
  }

  setCostIgnored(data: string): void {
    this.store.dispatch(new Settings.SetCostIgnoredAction(data));
  }

  setRecipeCost(data: DefaultIdPayload): void {
    this.store.dispatch(new Recipes.SetCostAction(data));
  }

  resetCost(): void {
    this.store.dispatch(new Settings.ResetCostAction());
  }

  resetRecipeCost(): void {
    this.store.dispatch(new Recipes.ResetCostAction());
  }
}
