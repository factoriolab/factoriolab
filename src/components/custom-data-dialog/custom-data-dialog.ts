import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

import { SettingsStore } from '~/state/settings/settings-store';

import { Button } from '../button/button';
import { DialogData } from '../dialog/dialog';

@Component({
  selector: 'lab-custom-data-dialog',
  imports: [FormsModule, Button],
  templateUrl: './custom-data-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex w-sm max-w-full flex-col gap-3 p-3 pt-0 sm:gap-6 sm:pt-0',
  },
})
export class CustomDataDialog implements DialogData {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  private readonly settingsStore = inject(SettingsStore);

  readonly header = 'customData.header';
  protected readonly faCheck = faCheck;
  protected readonly faXmark = faXmark;

  private data: string | undefined;
  private icons: string | undefined;

  selectFile(event: Event): void {
    console.log(event);
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      for (const file of files) {
        if (file.name === 'data.json') {
          const reader = new FileReader();
          reader.onload = (ev): void => {
            console.log(ev);
            const result = ev.target?.result;
            if (typeof result === 'string') this.data = result;
          };
          reader.readAsText(file);
          console.log('data', file);
        } else if (file.type.startsWith('image')) {
          const reader = new FileReader();
          reader.onload = (ev): void => {
            console.log(ev);
            const result = ev.target?.result;
            if (typeof result === 'string') this.icons = result;
          };
          reader.readAsDataURL(file);
          console.log('icons', file);
        }
      }
    }
  }

  save(): void {
    console.log('save');
    this.settingsStore.customData.set(this.data);
    this.settingsStore.customIcons.set(this.icons);
    this.dialogRef.close(true);
  }
}
