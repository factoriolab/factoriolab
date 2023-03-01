import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';

import { DisplayRate, displayRateOptions, RateType } from '~/models';
import { ItemObjectives, LabState, RecipeObjectives, Settings } from '~/store';

export enum WizardState {
  ObjectiveType,
  ItemObjectiveType,
  ItemObjectiveItems,
  RecipeObjective,
}

@Component({
  selector: 'lab-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WizardComponent {
  vm$ = combineLatest([
    this.store.select(Settings.getDataset),
    this.store.select(Settings.getDisplayRate),
    this.store.select(Settings.getRateTypeOptions),
  ]).pipe(
    map(([data, displayRate, rateTypeOptions]) => ({
      data,
      displayRate,
      rateTypeOptions,
    }))
  );

  id = '';
  rate = '1';
  state = WizardState.ObjectiveType;

  displayRateOptions = displayRateOptions;

  RateType = RateType;
  WizardState = WizardState;

  constructor(private store: Store<LabState>) {}

  selectId(value: string, state: WizardState): void {
    this.id = value;
    this.state = state;
  }

  /** Action Dispatch Methods */
  setDisplayRate(value: DisplayRate, prev: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction({ value, prev }));
  }

  createItemObjective(itemId: string, rate: string, rateType: RateType): void {
    this.store.dispatch(
      new ItemObjectives.CreateAction({ id: '0', itemId, rate, rateType })
    );
  }

  createRecipeObjective(recipeId: string, count: string): void {
    this.store.dispatch(
      new RecipeObjectives.CreateAction({ id: '0', recipeId, count })
    );
  }
}
