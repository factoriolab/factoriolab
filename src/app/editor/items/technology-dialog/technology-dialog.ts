import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  faFloppyDisk,
  faPencil,
  faPlus,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { toNullableNumeric } from '~/app/editor/object-utils';
import { Button } from '~/components/button/button';
import { DialogData } from '~/components/dialog/dialog';
import { Icon } from '~/components/icon/icon';
import { Select } from '~/components/select/select';
import { TechnologyJson } from '~/data/schema/technology';
import { Option } from '~/option/option';
import { OptionPipe } from '~/option/option-pipe';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';

import { InserterStackDialog } from './inserter-stack-dialog/inserter-stack-dialog';
import {
  RecipeProductivityDialog,
  RecipeProductivityDialogData,
} from './recipe-productivity-dialog/recipe-productivity-dialog';

export interface TechnologyDialogData {
  technology: TechnologyJson;
  prerequisiteOptions: Option[];
  qualityOptions: Option[];
  recipeOptions: Option[];
}

@Component({
  selector: 'lab-technology-dialog',
  imports: [FormsModule, Button, Icon, OptionPipe, Select, TranslatePipe],
  templateUrl: './technology-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class TechnologyDialog implements DialogData {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly dialog = inject(Dialog);
  protected readonly data = inject<TechnologyDialogData>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<DialogRef<TechnologyJson | null | undefined>>(DialogRef);

  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faPencil = faPencil;
  protected readonly faPlus = faPlus;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  readonly header = 'editor.editTechnology';
  // protected readonly toNumeric = toNumeric;
  protected readonly toNullableNumeric = toNullableNumeric;

  editInserterStack(technology: TechnologyJson): void {
    this.dialog
      .open<
        { value: number | string; category?: string }[] | null | undefined,
        { value: number | string; category?: string }[],
        InserterStackDialog
      >(InserterStackDialog, { data: coalesce(technology.inserterStack, []) })
      .closed.subscribe((inserterStack) => {
        if (inserterStack === null) delete technology.inserterStack;
        else if (inserterStack) technology.inserterStack = inserterStack;
        this.cd.detectChanges();
      });
  }

  editRecipeProductivity(technology: TechnologyJson): void {
    this.dialog
      .open<
        { id: string; value: number | string }[] | null | undefined,
        RecipeProductivityDialogData,
        RecipeProductivityDialog
      >(RecipeProductivityDialog, { data: { recipeProductivity: coalesce(technology.recipeProductivity, []), recipeOptions: this.data.recipeOptions } })
      .closed.subscribe((recipeProductivity) => {
        if (recipeProductivity === null) delete technology.recipeProductivity;
        else if (recipeProductivity)
          technology.recipeProductivity = recipeProductivity;
        this.cd.detectChanges();
      });
  }
}
