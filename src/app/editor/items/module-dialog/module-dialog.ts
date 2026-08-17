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
import { ModuleJson } from '~/data/schema/module';
import { Option } from '~/option/option';
import { TranslatePipe } from '~/translate/translate-pipe';

import { toNullableNumeric } from '../../object-utils';

export interface ModuleDialogData {
  module: ModuleJson;
  limitationOptions: Option<string | undefined>[];
  itemOptions: Option<string | undefined>[];
}

@Component({
  selector: 'lab-module-dialog',
  imports: [FormsModule, Button, Select, TranslatePipe],
  templateUrl: './module-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class ModuleDialog implements DialogData {
  protected readonly data = inject<ModuleDialogData>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<DialogRef<ModuleJson | null | undefined>>(DialogRef);

  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  readonly header = 'editor.editModule';
  protected readonly toNullableNumeric = toNullableNumeric;
}
