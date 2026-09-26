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
import { PresetJson } from '~/data/schema/defaults';
import { Option } from '~/option/option';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';

import { EditorMultiselect } from '../../components/editor-multiselect/editor-multiselect';
import { EditorRankSelect } from '../../components/editor-rank-select/editor-rank-select';
import { QuantitiesButton } from '../../components/quantities-button/quantities-button';
import {
  QuantitiesDialog,
  QuantitiesDialogData,
} from '../../components/quantities-dialog/quantities-dialog';
import { EditorData } from '../../editor.types';
import { toNumeric, toOptions } from '../../object-utils';

export interface PresetDialogData extends DialogData {
  preset: PresetJson;
  edit: EditorData;
  beltOptions: Option[];
  fuelOptions: Option[];
  locationOptions: Option[];
  machineOptions: Option[];
  moduleOptions: Option[];
  nullableBeaconOptions: Option<string | undefined>[];
  nullableModuleOptions: Option<string | undefined>[];
  recipeOptions: Option[];
  technologyOptions: Option[];
  wagonOptions: Option[];
}

@Component({
  selector: 'lab-preset-dialog',
  imports: [
    FormsModule,
    Button,
    Select,
    TranslatePipe,
    EditorMultiselect,
    EditorRankSelect,
    QuantitiesButton,
  ],
  templateUrl: './preset-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class PresetDialog {
  private readonly cd = inject(ChangeDetectorRef);
  private readonly dialog = inject(Dialog);
  protected readonly data = inject<PresetDialogData>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<DialogRef<PresetJson | undefined>>(DialogRef);

  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faXmark = faXmark;
  protected readonly toNumeric = toNumeric;

  editRecipeProductivity(preset: PresetJson): void {
    const { data, icons } = this.data.edit;
    const options = toOptions(data.items, icons);
    this.dialog
      .open<
        Partial<Record<string, string | number>> | null | undefined,
        QuantitiesDialogData,
        QuantitiesDialog
      >(QuantitiesDialog, { data: { record: coalesce(preset.recipeProductivity, {}), options, header: 'data.recipeProductivity', optional: true } })
      .closed.subscribe((record) => {
        if (record === null) delete preset.recipeProductivity;
        else if (record) preset.recipeProductivity = record;
        this.cd.detectChanges();
      });
  }
}
