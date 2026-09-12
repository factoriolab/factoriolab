import { DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { DialogData } from '~/components/dialog/dialog';
import { ModData } from '~/data/schema/mod-data';
import { TranslatePipe } from '~/translate/translate-pipe';

import { EditorData } from '../../editor.types';
import { splitIcons } from '../../image.utils';

@Component({
  selector: 'lab-upload-dialog',
  imports: [FormsModule, Button, TranslatePipe],
  templateUrl: './upload-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex w-sm max-w-full flex-col gap-3 p-3 pt-0 sm:gap-6 sm:pt-0',
  },
})
export class UploadDialog implements DialogData {
  protected readonly dialogRef = inject<DialogRef<EditorData>>(DialogRef);

  readonly header = 'customData.header';
  protected readonly faCheck = faCheck;
  protected readonly faXmark = faXmark;

  protected dataFile: File | undefined;
  protected iconsFile: File | undefined;
  protected readonly loading = signal(false);

  selectFile(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files == null) return;

    for (const file of files) {
      if (file.type === 'application/json') this.dataFile = file;
      else if (file.type.startsWith('image')) this.iconsFile = file;
    }
  }

  save(): void {
    if (!this.dataFile || !this.iconsFile) return;
    this.loading.set(true);
    const dataFile = this.dataFile;
    const iconsFile = this.iconsFile;

    const reader = new FileReader();
    reader.onload = (ev): void => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        try {
          const data = JSON.parse(result) as ModData;
          const url = URL.createObjectURL(iconsFile);
          splitIcons(url, data).then(
            (value) => {
              this.dialogRef.close(value);
            },
            (err: unknown) => {
              console.error(err);
              this.loading.set(false);
            },
          );
        } catch {
          // Do nothing
        }
      }
    };
    reader.readAsText(dataFile);
  }
}
