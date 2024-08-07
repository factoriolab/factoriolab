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
  rational,
} from '~/models';
import { Objectives, Recipes, Settings } from '~/store';

export type WizardState = 'type' | 'item' | 'recipe';

@Component({
  standalone: true,
  imports: [RadioButtonModule, StepsModule, AppSharedModule],
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WizardComponent {
  store = inject(Store);

  itemIds = this.store.selectSignal(Recipes.selectAvailableItems);
  data = this.store.selectSignal(Settings.selectDataset);
  recipeIds = this.store.selectSignal(Settings.selectAvailableRecipes);
  displayRate = this.store.selectSignal(Settings.selectDisplayRate);

  id = '';
  value = rational.one;
  state: WizardState = 'type';

  displayRateOptions = displayRateOptions;

  ObjectiveUnit = ObjectiveUnit;

  selectId(value: string, state: WizardState): void {
    this.id = value;
    this.state = state;
  }

  /** Action Dispatch Methods */
  setDisplayRate(displayRate: DisplayRate, previous: DisplayRate): void {
    this.store.dispatch(Settings.setDisplayRate({ displayRate, previous }));
  }

  createItemObjective(targetId: string): void {
    this.store.dispatch(
      Objectives.create({
        objective: {
          id: '0',
          targetId,
          value: this.value,
          unit: ObjectiveUnit.Items,
          type: ObjectiveType.Output,
        },
      }),
    );
  }

  createRecipeObjective(targetId: string): void {
    this.store.dispatch(
      Objectives.create({
        objective: {
          id: '0',
          targetId,
          value: this.value,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
        },
      }),
    );
  }
}
