import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  faFloppyDisk,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Checkbox } from '~/components/checkbox/checkbox';
import { DialogData } from '~/components/dialog/dialog';
import { SiloJson } from '~/data/schema/silo';
import { TranslatePipe } from '~/translate/translate-pipe';

import { toNumeric } from '../../object-utils';

@Component({
  selector: 'lab-silo-dialog',
  imports: [FormsModule, Button, Checkbox, TranslatePipe],
  templateUrl: './silo-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class SiloDialog implements DialogData {
  protected readonly data = inject<SiloJson>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<DialogRef<SiloJson | null | undefined>>(DialogRef);

  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  readonly header = 'editor.editMachine';
  protected readonly toNumeric = toNumeric;
}
