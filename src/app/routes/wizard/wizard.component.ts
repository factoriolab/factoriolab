import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StepsModule } from 'primeng/steps';

import { AppSharedModule } from '~/app-shared.module';
import {
  DisplayRate,
  displayRateOptions,
  ObjectiveType,
  ObjectiveUnit,
  Rational,
} from '~/models';
import { LabState, Objectives, Recipes, Settings } from '~/store';

export type WizardState = 'type' | 'item' | 'recipe';

@Component({
  standalone: true,
  imports: [CommonModule, RadioButtonModule, StepsModule, AppSharedModule],
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WizardComponent {
  store = inject(Store<LabState>);

  itemIds = this.store.selectSignal(Recipes.getAvailableItems);
  data = this.store.selectSignal(Settings.getDataset);
  recipeIds = this.store.selectSignal(Settings.getAvailableRecipes);
  displayRate = this.store.selectSignal(Settings.getDisplayRate);

  id = '';
  value = Rational.one;
  state: WizardState = 'type';

  displayRateOptions = displayRateOptions;

  ObjectiveUnit = ObjectiveUnit;

  selectId(value: string, state: WizardState): void {
    this.id = value;
    this.state = state;
  }

  /** Action Dispatch Methods */
  setDisplayRate(value: DisplayRate, prev: DisplayRate): void {
    this.store.dispatch(new Settings.SetDisplayRateAction({ value, prev }));
  }

  createItemObjective(targetId: string): void {
    this.store.dispatch(
      new Objectives.CreateAction({
        id: '0',
        targetId,
        value: this.value,
        unit: ObjectiveUnit.Items,
        type: ObjectiveType.Output,
      }),
    );
  }

  createRecipeObjective(targetId: string): void {
    this.store.dispatch(
      new Objectives.CreateAction({
        id: '0',
        targetId,
        value: this.value,
        unit: ObjectiveUnit.Machines,
        type: ObjectiveType.Output,
      }),
    );
  }
}
