import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StepsModule } from 'primeng/steps';

import { InputNumberComponent, PickerComponent } from '~/components';
import { DropdownTranslateDirective } from '~/directives';
import {
  DisplayRate,
  displayRateOptions,
  ObjectiveType,
  ObjectiveUnit,
  rational,
} from '~/models';
import { IconClassPipe, TranslatePipe } from '~/pipes';
import { Objectives, Recipes, Settings } from '~/store';

export type WizardState = 'type' | 'item' | 'recipe';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    DividerModule,
    DropdownModule,
    RadioButtonModule,
    StepsModule,
    DropdownTranslateDirective,
    IconClassPipe,
    InputNumberComponent,
    PickerComponent,
    TranslatePipe,
  ],
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WizardComponent {
  router = inject(Router);
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

  async createItemObjective(targetId: string): Promise<void> {
    await this.router.navigate(['list']);
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

  async createRecipeObjective(targetId: string): Promise<void> {
    await this.router.navigate(['list']);
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
