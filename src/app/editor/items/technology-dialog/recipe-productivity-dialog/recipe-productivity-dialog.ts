import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  faFloppyDisk,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { DialogData } from '~/components/dialog/dialog';
import { Select } from '~/components/select/select';
import { Option } from '~/option/option';
import { TranslatePipe } from '~/translate/translate-pipe';

export interface RecipeProductivityDialogData {
  recipeProductivity: { id: string; value: number | string }[];
  recipeOptions: Option[];
}

@Component({
  selector: 'lab-recipe-productivity-dialog',
  imports: [FormsModule, Button, TranslatePipe, Select],
  templateUrl: './recipe-productivity-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class RecipeProductivityDialog implements DialogData {
  protected readonly data = inject<RecipeProductivityDialogData>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<
      DialogRef<{ id: string; value: number | string }[] | null | undefined>
    >(DialogRef);

  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  readonly header = 'editor.editRecipeProductivity';
  protected model: { id: string; value: number | string } = {
    id: this.data.recipeOptions[0].value,
    value: 0.1,
  };

  add(): void {
    this.data.recipeProductivity.push(this.model);
    this.model = { id: this.data.recipeOptions[0].value, value: 0.1 };
  }

  remove(index: number): void {
    this.data.recipeProductivity.splice(index, 1);
  }
}
