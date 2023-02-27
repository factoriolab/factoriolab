import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { Column } from '~/models';
import { TrackService } from '~/services';
import { LabState, Preferences, Products, Recipes, Settings } from '~/store';

@Component({
  selector: 'lab-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixComponent {
  vm$ = combineLatest([
    this.store.select(Products.getMatrixResult),
    this.store.select(Recipes.getRecipesModified),
    this.store.select(Recipes.getAdjustedDataset),
    this.store.select(Recipes.recipesState),
    this.store.select(Settings.getSettingsModified),
    this.store.select(Settings.settingsState),
    this.store.select(Preferences.getColumns),
  ]).pipe(
    map(
      ([
        result,
        recipesModified,
        data,
        recipeRaw,
        settingsModified,
        settings,
        columns,
      ]) => ({
        result,
        recipesModified,
        data,
        recipeRaw,
        settingsModified,
        settings,
        precision: columns[Column.Items].precision,
      })
    )
  );

  constructor(public trackSvc: TrackService, private store: Store<LabState>) {}

  /** Action Dispatch Methods */
  setCostFactor(data: string): void {
    this.store.dispatch(new Settings.SetCostFactorAction(data));
  }

  setCostMachine(data: string): void {
    this.store.dispatch(new Settings.SetCostMachineAction(data));
  }

  setCostInput(data: string): void {
    this.store.dispatch(new Settings.SetCostInputAction(data));
  }

  setCostIgnored(data: string): void {
    this.store.dispatch(new Settings.SetCostIgnoredAction(data));
  }

  setRecipeCost(id: string, value?: string): void {
    this.store.dispatch(new Recipes.SetCostAction({ id, value }));
  }

  resetCost(): void {
    this.store.dispatch(new Settings.ResetCostAction());
  }

  resetRecipeCost(): void {
    this.store.dispatch(new Recipes.ResetCostAction());
  }
}
