import { Dialog, DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faFloppyDisk, faXmark } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { DialogData } from '~/components/dialog/dialog';
import { Select } from '~/components/select/select';
import { RecipeFlag, RecipeJson } from '~/data/schema/recipe';
import { Option } from '~/option/option';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';

import { EditorMultiselect } from '../../components/editor-multiselect/editor-multiselect';
import { QuantitiesButton } from '../../components/quantities-button/quantities-button';
import {
  QuantitiesDialog,
  QuantitiesDialogData,
} from '../../components/quantities-dialog/quantities-dialog';
import { EditorData } from '../../editor.types';
import {
  moduleEffectOptions,
  toNullableNumeric,
  toNumeric,
  toOptions,
} from '../../object-utils';

export interface RecipeDialogData extends DialogData {
  recipe: RecipeJson;
  edit: EditorData;
}

@Component({
  selector: 'lab-recipe-dialog',
  imports: [
    FormsModule,
    Button,
    Select,
    TranslatePipe,
    EditorMultiselect,
    QuantitiesButton,
  ],
  templateUrl: './recipe-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class RecipeDialog {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly dialog = inject(Dialog);
  protected readonly data = inject<RecipeDialogData>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<DialogRef<RecipeJson | undefined>>(DialogRef);

  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faXmark = faXmark;
  protected readonly locationOptions = toOptions(
    coalesce(this.data.edit.data.locations, []),
    this.data.edit.icons,
  );
  protected readonly moduleEffectOptions = moduleEffectOptions;
  protected readonly producerOptions = toOptions(
    this.data.edit.data.items.filter((i) => i.machine),
    this.data.edit.icons,
  );
  protected readonly recipeFlagOptions: Option<RecipeFlag>[] = [
    { label: 'burn', value: 'burn' },
    { label: 'infinite', value: 'infinite' },
    { label: 'locked', value: 'locked' },
    { label: 'mining', value: 'mining' },
    { label: 'noCostMultiplier', value: 'noCostMultiplier' },
    { label: 'recycling', value: 'recycling' },
    { label: 'showCount', value: 'showCount' },
    { label: 'technology', value: 'technology' },
  ];
  protected readonly recipeOptions = toOptions(
    this.data.edit.data.recipes,
    this.data.edit.icons,
    true,
  );
  protected readonly toNullableNumeric = toNullableNumeric;
  protected readonly toNumeric = toNumeric;

  editIngredients(recipe: RecipeJson): void {
    const { data, icons } = this.data.edit;
    const options = toOptions(data.items, icons);
    this.dialog
      .open<
        Partial<Record<string, string | number>> | null | undefined,
        QuantitiesDialogData,
        QuantitiesDialog
      >(QuantitiesDialog, { data: { record: recipe.in, options, header: 'data.ingredients' } })
      .closed.subscribe((record) => {
        if (record) recipe.in = record;
        this.cd.detectChanges();
      });
  }

  editProducts(recipe: RecipeJson): void {
    const { data, icons } = this.data.edit;
    const options = toOptions(data.items, icons);
    this.dialog
      .open<
        Partial<Record<string, string | number>> | null | undefined,
        QuantitiesDialogData,
        QuantitiesDialog
      >(QuantitiesDialog, { data: { record: recipe.out, options, header: 'data.products' } })
      .closed.subscribe((record) => {
        if (record) recipe.out = record;
        this.cd.detectChanges();
      });
  }

  editCatalysts(recipe: RecipeJson): void {
    const { data, icons } = this.data.edit;
    const options = toOptions(data.items, icons);
    this.dialog
      .open<
        Partial<Record<string, string | number>> | null | undefined,
        QuantitiesDialogData,
        QuantitiesDialog
      >(QuantitiesDialog, { data: { record: coalesce(recipe.catalyst, {}), options, header: 'data.catalysts', optional: true } })
      .closed.subscribe((record) => {
        if (record === null) delete recipe.catalyst;
        else if (record) recipe.catalyst = record;
        this.cd.detectChanges();
      });
  }
}
