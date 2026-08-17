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
import { BeltJson } from '~/data/schema/belt';
import { TranslatePipe } from '~/translate/translate-pipe';

import { toNumeric } from '../../object-utils';

export interface BeltDialogData extends DialogData {
  belt: BeltJson;
}

@Component({
  selector: 'lab-belt-dialog',
  imports: [FormsModule, Button, TranslatePipe],
  templateUrl: './belt-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class BeltDialog {
  protected readonly data = inject<BeltDialogData>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<DialogRef<BeltJson | null | undefined>>(DialogRef);

  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  protected readonly toNumeric = toNumeric;
}
