import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { KeyValuePipe } from '@angular/common';
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

import { toNumeric } from '../../object-utils';

export interface QuantitiesDialogData extends DialogData {
  record: Partial<Record<string, number | string>>;
  options: Option[];
  optional?: boolean;
}

@Component({
  selector: 'lab-quantities-dialog',
  imports: [FormsModule, KeyValuePipe, Button, Select, TranslatePipe],
  templateUrl: './quantities-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class QuantitiesDialog {
  protected readonly data = inject<QuantitiesDialogData>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<
      DialogRef<Partial<Record<string, number | string>> | null | undefined>
    >(DialogRef);

  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  protected readonly model: { key: string; value: string | number } = {
    key: this.data.options[0]?.value,
    value: 1,
  };
  protected readonly toNumeric = toNumeric;

  updateKey(oldKey: string, newKey: string): void {
    this.data.record[newKey] = this.data.record[oldKey];
    delete this.data.record[oldKey];
  }

  remove(key: string): void {
    delete this.data.record[key];
  }
}
