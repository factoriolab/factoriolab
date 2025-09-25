import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Checkbox } from '~/components/checkbox/checkbox';
import { Step } from '~/solver/step';
import { SettingsStore } from '~/state/settings/settings-store';
import { updateSetIds } from '~/utils/set';

@Component({
  selector: 'td[lab-checkbox-cell], td[labCheckboxCell]',
  imports: [FormsModule, Checkbox],
  templateUrl: './checkbox-cell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxCell {
  private readonly settingsStore = inject(SettingsStore);

  readonly step = input.required<Step>();

  changeStepChecked(value: boolean): void {
    const step = this.step();
    const settings = this.settingsStore.settings();
    // Priority: 1) Item state, 2) Recipe objective state, 3) Recipe state
    if (step.itemId != null) {
      const checkedItemIds = updateSetIds(
        step.itemId,
        value,
        settings.checkedItemIds,
      );
      this.settingsStore.apply({ checkedItemIds });
    } else if (step.recipeObjectiveId != null) {
      const checkedObjectiveIds = updateSetIds(
        step.recipeObjectiveId,
        value,
        settings.checkedObjectiveIds,
      );
      this.settingsStore.apply({ checkedObjectiveIds });
    } else if (step.recipeId != null) {
      const checkedRecipeIds = updateSetIds(
        step.recipeId,
        value,
        settings.checkedRecipeIds,
      );
      this.settingsStore.apply({ checkedRecipeIds });
    }
  }
}
