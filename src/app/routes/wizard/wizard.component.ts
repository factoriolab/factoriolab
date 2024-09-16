import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StepsModule } from 'primeng/steps';

import { InputNumberComponent } from '~/components/input-number/input-number.component';
import { PickerComponent } from '~/components/picker/picker.component';
import { DropdownTranslateDirective } from '~/directives/dropdown-translate.directive';
import { DisplayRate, displayRateOptions } from '~/models/enum/display-rate';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { Objective } from '~/models/objective';
import { rational } from '~/models/rational';
import { IconClassPipe } from '~/pipes/icon-class.pipe';
import { TranslatePipe } from '~/pipes/translate.pipe';
import { create } from '~/store/objectives/objectives.actions';
import { selectAvailableItems } from '~/store/recipes/recipes.selectors';
import { setDisplayRate } from '~/store/settings/settings.actions';
import {
  selectAvailableRecipes,
  selectDataset,
  selectDisplayRate,
} from '~/store/settings/settings.selectors';

export type WizardState = 'type' | 'item' | 'recipe';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    RouterLink,
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
  route = inject(ActivatedRoute);
  store = inject(Store);

  itemIds = this.store.selectSignal(selectAvailableItems);
  data = this.store.selectSignal(selectDataset);
  recipeIds = this.store.selectSignal(selectAvailableRecipes);
  displayRate = this.store.selectSignal(selectDisplayRate);

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
    this.store.dispatch(setDisplayRate({ displayRate, previous }));
  }

  createItemObjective(targetId: string): void {
    this.createObjective({
      id: '0',
      targetId,
      value: this.value,
      unit: ObjectiveUnit.Items,
      type: ObjectiveType.Output,
    });
    void this.router.navigate(['../list'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
    });
  }

  createRecipeObjective(targetId: string): void {
    this.createObjective({
      id: '0',
      targetId,
      value: this.value,
      unit: ObjectiveUnit.Machines,
      type: ObjectiveType.Output,
    });
    void this.router.navigate(['../list'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
    });
  }

  /** Action Dispatch Methods */
  createObjective(objective: Objective): void {
    this.store.dispatch(create({ objective }));
  }
}
