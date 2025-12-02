import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Button } from '../button/button';
import { DialogData } from '../dialog/dialog';

@Component({
  selector: 'lab-custom-data-dialog',
  imports: [FormsModule, Button, TranslatePipe],
  templateUrl: './custom-data-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex w-sm max-w-full flex-col gap-3 p-3 pt-0 sm:gap-6 sm:pt-0',
  },
})
export class CustomDataDialog implements DialogData {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly settingsStore = inject(SettingsStore);

  readonly header = 'customData.header';
  protected readonly faCheck = faCheck;
  protected readonly faXmark = faXmark;

  dataFile: File | undefined;
  iconsFile: File | undefined;

  selectFile(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files == null) return;

    for (const file of files) {
      if (file.type === 'application/json') this.dataFile = file;
      else if (file.type.startsWith('image')) this.iconsFile = file;
    }
  }

  save(): void {
    if (this.dataFile) {
      const reader = new FileReader();
      reader.onload = (ev): void => {
        const result = ev.target?.result;
        if (typeof result === 'string')
          this.settingsStore.setCustomData(result);
      };
      reader.readAsText(this.dataFile);
    }

    if (this.iconsFile) {
      const reader = new FileReader();
      reader.onload = (ev): void => {
        const result = ev.target?.result;
        if (typeof result === 'string')
          this.settingsStore.customIcons.set(result);
      };
      reader.readAsDataURL(this.iconsFile);
    }

    this.dialogRef.close(true);
  }
}
