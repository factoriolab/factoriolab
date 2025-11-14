import { DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  linkedSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Icon } from '~/components/icon/icon';
import { InputNumber } from '~/components/input-number/input-number';
import { Rational, rational } from '~/rational/rational';
import { RecipesStore } from '~/state/recipes/recipes-store';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-recipe-productivity-dialog',
  imports: [FormsModule, Button, Icon, InputNumber, TranslatePipe],
  templateUrl: './recipe-productivity-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex w-xl max-w-full flex-col gap-3 overflow-hidden p-3 pt-px sm:gap-6 sm:p-6 sm:pt-px',
  },
})
export class RecipeProductivityDialog {
  protected readonly dialogRef = inject(DialogRef);
  private readonly recipesStore = inject(RecipesStore);
  private readonly settingsStore = inject(SettingsStore);

  protected readonly data = this.settingsStore.dataset;
  protected readonly faCheck = faCheck;
  protected readonly faXmark = faXmark;
  protected readonly rational = rational;

  protected readonly editValue = linkedSignal(() => {
    const data = this.data();
    const recipesState = this.recipesStore.settings();
    return data.prodUpgradeTechs.reduce<Record<string, Rational>>(
      (e, techId) => {
        const recipeId = data.prodUpgrades[techId][0];
        e[techId] = recipesState[recipeId].productivity ?? rational.zero;
        return e;
      },
      {},
    );
  });

  updateValue(techId: string, value: Rational): void {
    this.editValue.update((e) => ({ ...e, ...{ [techId]: value } }));
  }

  save(): void {
    const data = this.data();
    const editValue = this.editValue();
    data.prodUpgradeTechs.forEach((techId) => {
      data.prodUpgrades[techId].forEach((upgradedRecipe) => {
        this.recipesStore.updateRecordField(
          upgradedRecipe,
          'productivity',
          editValue[techId],
          rational.zero,
        );
      });
    });
    this.dialogRef.close();
  }
}
