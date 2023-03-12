import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StepsModule } from 'primeng/steps';
import { combineLatest, map } from 'rxjs';

import { AppSharedModule } from '~/app-shared.module';
import {
  DisplayRate,
  displayRateOptions,
  ObjectiveType,
  RateUnit,
} from '~/models';
import { ItemObjectives, LabState, RecipeObjectives, Settings } from '~/store';

export enum WizardState {
  ObjectiveType,
  ItemObjectiveType,
  ItemObjectiveItems,
  RecipeObjective,
}

@Component({
  standalone: true,
  imports: [CommonModule, RadioButtonModule, StepsModule, AppSharedModule],
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WizardComponent {
  vm$ = combineLatest([
    this.store.select(Settings.getDataset),
    this.store.select(Settings.getDisplayRate),
    this.store.select(Settings.getRateUnitOptions),
  ]).pipe(
    map(([data, displayRate, rateUnitOptions]) => ({
      data,
      displayRate,
      rateUnitOptions,
    }))
  );

  id = '';
  rate = '1';
  count = '1';
  state = WizardState.ObjectiveType;

  displayRateOptions = displayRateOptions;

  RateUnit = RateUnit;
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

  createItemObjective(itemId: string, rate: string, rateUnit: RateUnit): void {
    this.store.dispatch(
      new ItemObjectives.CreateAction({
        id: '0',
        itemId,
        rate,
        rateUnit,
        type: ObjectiveType.Output,
      })
    );
  }

  createRecipeObjective(recipeId: string, count: string): void {
    this.store.dispatch(
      new RecipeObjectives.CreateAction({
        id: '0',
        recipeId,
        count,
        type: ObjectiveType.Output,
      })
    );
  }
}
