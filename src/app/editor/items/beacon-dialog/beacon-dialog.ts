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
import { BeaconJson } from '~/data/schema/beacon';
import { EnergyType } from '~/data/schema/energy-type';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Select } from '../../components/select/select';
import { moduleEffectOptions } from '../../object-utils';

@Component({
  selector: 'lab-beacon-dialog',
  imports: [FormsModule, Button, Checkbox, TranslatePipe, Select],
  templateUrl: './beacon-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 p-3 pt-0 sm:gap-6 sm:p-6 sm:pt-0 lg:max-w-3xl',
  },
})
export class BeaconDialog implements DialogData {
  protected readonly data = inject<BeaconJson>(DIALOG_DATA);
  protected readonly dialogRef =
    inject<DialogRef<BeaconJson | null | undefined>>(DialogRef);

  protected readonly moduleEffectOptions = moduleEffectOptions;
  protected readonly EnergyType = EnergyType;
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faTrash = faTrash;
  protected readonly faXmark = faXmark;
  readonly header = 'editor.editBeacon';

  updateSize(value: string): void {
    try {
      const size = value.split(',').map((v) => Number(v.trim()));
      if (size.length === 2 && size.every((v) => !isNaN(v))) {
        this.data.size = size as [number, number];
        return;
      }
    } catch {
      // Do nothing
    }

    this.data.size = undefined;
  }

  updateProfile(value: string): void {
    try {
      const profile = value.split(',').map((v) => Number(v.trim()));
      if (profile.every((v) => !isNaN(v))) {
        this.data.profile = profile;
        return;
      }
    } catch {
      // Do nothing
    }

    this.data.profile = undefined;
  }
}
