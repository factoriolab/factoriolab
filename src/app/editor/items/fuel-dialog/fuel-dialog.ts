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
import { FuelJson } from '~/data/schema/fuel';
import { Option } from '~/option/option';
import { TranslatePipe } from '~/translate/translate-pipe';

import { toNullableNumeric, toNumeric } from '../../object-utils';

export interface FuelDialogData {
  fuel: FuelJson;
  itemOptions: Option<string | undefined>[];
}

@Component({
  selector: 'lab-fuel-dialog',
  imports: [FormsModule, Button, Select, TranslatePipe],
  templateUrl: './fuel-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class FuelDialog implements DialogData {
  protected readonly data = inject<FuelDialogData>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<DialogRef<FuelJson | null | undefined>>(DialogRef);

  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  readonly header = 'editor.editFuel';
  protected readonly toNullableNumeric = toNullableNumeric;
  protected readonly toNumeric = toNumeric;
}
