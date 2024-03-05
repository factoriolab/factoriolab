import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StepsModule } from 'primeng/steps';
import { combineLatest } from 'rxjs';

import { AppSharedModule } from '~/app-shared.module';
import {
  DisplayRate,
  displayRateOptions,
  ObjectiveType,
  ObjectiveUnit,
} from '~/models';
import { LabState, Objectives, Recipes, Settings } from '~/store';

export enum WizardState {
  ObjectiveType = 0,
  ItemObjective = 1,
  RecipeObjective = 2,
}

@Component({
  standalone: true,
  imports: [CommonModule, RadioButtonModule, StepsModule, AppSharedModule],
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WizardComponent {
  store = inject(Store<LabState>);

  vm$ = combineLatest({
    itemIds: this.store.select(Recipes.getAvailableItems),
    data: this.store.select(Settings.getDataset),
    recipeIds: this.store.select(Settings.getAvailableRecipes),
    displayRate: this.store.select(Settings.getDisplayRate),
    rateUnitOptions: this.store.select(Settings.getRateUnitOptions),
  });

  id = '';
  rate = '1';
  count = '1';
  state = WizardState.ObjectiveType;

  displayRateOptions = displayRateOptions;

  RateUnit = ObjectiveUnit;
  WizardState = WizardState;

  selectId(value: string, state: WizardState): void {
    this.id = value;
    this.state = state;
  }

  /** Action Dispatch Methods */
  setDisplayRate(value: DisplayRate, prev: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction({ value, prev }));
  }

  createItemObjective(
    targetId: string,
    value: string,
    unit: ObjectiveUnit,
  ): void {
    this.store.dispatch(
      new Objectives.CreateAction({
        id: '0',
        targetId,
        value,
        unit,
        type: ObjectiveType.Output,
      }),
    );
  }

  createRecipeObjective(targetId: string, value: string): void {
    this.store.dispatch(
      new Objectives.CreateAction({
        id: '0',
        targetId,
        value,
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      }),
    );
  }
}
