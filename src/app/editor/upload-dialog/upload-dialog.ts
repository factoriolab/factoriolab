import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { DialogData } from '~/components/dialog/dialog';
import { ModData } from '~/data/schema/mod-data';
import { TranslatePipe } from '~/translate/translate-pipe';

import { EditorData } from '../editor.types';

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
    const dataFile = this.dataFile;
    const iconsFile = this.iconsFile;

    const reader = new FileReader();
    reader.onload = (ev): void => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        try {
          const data = JSON.parse(result) as ModData;
          const editorData: EditorData = {
            data,
            icons: {},
          };
          const image = new Image();
          image.onload = (): void => {
            for (const icon of data.icons) {
              const canvas = document.createElement('canvas');
              canvas.width = 64;
              canvas.height = 64;
              const context = canvas.getContext('2d');
              if (context == null) continue;
              context.drawImage(image, icon.x, icon.y, 64, 64, 0, 0, 64, 64);
              console.log(canvas.toDataURL());
              canvas.toBlob((blob) => {
                if (blob == null) return;
                const file = new File([blob], `${icon.id}.webp`, {
                  type: 'image/webp',
                });
                const url = URL.createObjectURL(file);
                editorData.icons[icon.id] = {
                  file,
                  url,
                };
              });
            }
          };
          const url = URL.createObjectURL(iconsFile);
          image.src = url;

          this.dialogRef.close(editorData);
        } catch {
          // Do nothing
        }
      }
    };
    reader.readAsText(dataFile);

    // if (this.iconsFile) {
    // TODO
    // this.settingsStore.customIcons.set(this.iconsFile);
    // const iconPath = this.settingsStore.iconPath();
    // let data = this.settingsStore.customData.value();
    // if (data && iconPath) {
    //   data = JSON.parse(JSON.stringify(data)) as ModData;
    //   await this.updateColors(data, iconPath);
    //   this.settingsStore.customData.set(data);
    // }
    // }

    // this.dialogRef.close(true);
  }

  // private async updateColors(data: ModData, iconPath: string): Promise<void> {
  //   const img = document.createElement('img');
  //   img.src = iconPath;

  //   await Promise.all(
  //     data.icons.map(async (icon) => {
  //       const result = await this.fac.getColorAsync(img, {
  //         top: icon.y,
  //         left: icon.x,
  //         width: 64,
  //         height: 64,
  //       });
  //       icon.color = result.hex;
  //     }),
  //   );
  // }
}
