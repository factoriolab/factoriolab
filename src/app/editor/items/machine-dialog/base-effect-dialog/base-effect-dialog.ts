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
import { ModuleEffect } from '~/data/schema/module';
import { Option } from '~/option/option';
import { TranslatePipe } from '~/translate/translate-pipe';

@Component({
  selector: 'lab-base-effect-dialog',
  imports: [FormsModule, KeyValuePipe, Button, Select, TranslatePipe],
  templateUrl: './base-effect-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class BaseEffectDialog implements DialogData {
  protected readonly data =
    inject<Partial<Record<ModuleEffect, number>>>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<
      DialogRef<Partial<Record<string, number | string>> | null | undefined>
    >(DialogRef);

  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  readonly header = 'editor.editBaseEffect';
  protected readonly model: { key: ModuleEffect; value: number } = {
    key: 'consumption',
    value: 1,
  };
  protected readonly effectOptions: Option<ModuleEffect>[] = [
    { label: 'data.energyConsumption', value: 'consumption' },
    { label: 'data.pollution', value: 'pollution' },
    { label: 'data.productivity', value: 'productivity' },
    { label: 'data.quality', value: 'quality' },
    { label: 'data.speed', value: 'speed' },
  ];

  updateKey(oldKey: ModuleEffect, newKey: ModuleEffect): void {
    this.data[newKey] = this.data[oldKey];
    delete this.data[oldKey];
  }

  remove(key: ModuleEffect): void {
    delete this.data[key];
  }
}
