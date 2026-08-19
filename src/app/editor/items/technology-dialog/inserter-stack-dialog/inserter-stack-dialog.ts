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
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-inserter-stack-dialog',
  imports: [FormsModule, Button, TranslatePipe],
  templateUrl: './inserter-stack-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class InserterStackDialog implements DialogData {
  protected readonly data =
    inject<{ value: number | string; category?: string }[]>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<
      DialogRef<
        { value: number | string; category?: string }[] | null | undefined
      >
    >(DialogRef);

  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  readonly header = 'editor.editInserterStack';
  protected model: { value: number | string; category?: string } = {
    value: 1,
  };

  add(): void {
    this.data.push(this.model);
    this.model = { value: 1 };
  }

  remove(index: number): void {
    this.data.splice(index, 1);
  }
}
