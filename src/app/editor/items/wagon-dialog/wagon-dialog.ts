import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  faFloppyDisk,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Select } from '~/components/select/select';
import { WagonJson } from '~/data/schema/wagon';
import { Option } from '~/option/option';
import { TranslatePipe } from '~/translate/translate-pipe';
import { SetJoinPipe } from '~/utils/set';

import { toArray, toNumeric } from '../../object-utils';

@Component({
  selector: 'lab-wagon-dialog',
  imports: [FormsModule, Button, Select, TranslatePipe, SetJoinPipe],
  templateUrl: './wagon-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class WagonDialog {
  protected readonly data = inject<WagonJson>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<DialogRef<WagonJson | null | undefined>>(DialogRef);

  protected readonly capacityTypeOptions: Option<'stacks' | undefined>[] = [
    { label: 'data.items', value: undefined },
    { label: 'editor.stacks', value: 'stacks' },
  ];
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  readonly header = 'data.wagon';
  protected readonly toArray = toArray;
  protected readonly toNumeric = toNumeric;
}
