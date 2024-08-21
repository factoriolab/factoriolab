import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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
import { LabState, Objectives, Recipes, Settings } from '~/store';

export type WizardState = 'type' | 'item' | 'recipe';

@Component({
  standalone: true,
  imports: [RadioButtonModule, StepsModule, AppSharedModule],
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WizardComponent {
  router = inject(Router);
  store = inject(Store<LabState>);

  itemIds = this.store.selectSignal(Recipes.getAvailableItems);
  data = this.store.selectSignal(Settings.getDataset);
  recipeIds = this.store.selectSignal(Settings.getAvailableRecipes);
  displayRate = this.store.selectSignal(Settings.getDisplayRate);

  id = '';
  value = rational(1n);
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

  async createItemObjective(targetId: string): Promise<void> {
    await this.router.navigate(['list']);
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

  async createRecipeObjective(targetId: string): Promise<void> {
    await this.router.navigate(['list']);
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
