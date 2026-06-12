import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FastAverageColor } from 'fast-average-color';

import { ModData } from '~/data/schema/mod-data';
import { SettingsStore } from '~/state/settings/settings-store';
import { TranslatePipe } from '~/translate/translate-pipe';
import { emptyModHash, updateHash } from '~/utils/hash';

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
  private fac = new FastAverageColor();

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

  async save(): Promise<void> {
    if (this.dataFile) {
      const reader = new FileReader();
      reader.onload = async (ev): Promise<void> => {
        const result = ev.target?.result;
        if (typeof result === 'string') {
          try {
            const data = JSON.parse(result) as ModData;
            const iconPath = this.settingsStore.customIconsUrl();
            if (iconPath) await this.updateColors(data, iconPath);
            this.settingsStore.customData.set(data);

            const hashJson = this.settingsStore.customHash.value();
            const hash = hashJson ?? emptyModHash();
            updateHash(data, hash);
            this.settingsStore.customHash.set(hash);
          } catch {
            // Do nothing
          }
        }
      };
      reader.readAsText(this.dataFile);
    }

    if (this.iconsFile) {
      this.settingsStore.customIcons.set(this.iconsFile);

      const iconPath = this.settingsStore.iconPath();
      let data = this.settingsStore.customData.value();
      if (data && iconPath) {
        data = JSON.parse(JSON.stringify(data)) as ModData;
        await this.updateColors(data, iconPath);
        this.settingsStore.customData.set(data);
      }
    }

    this.dialogRef.close(true);
  }

  private async updateColors(data: ModData, iconPath: string): Promise<void> {
    const img = document.createElement('img');
    img.src = iconPath;

    await Promise.all(
      data.icons.map(async (icon) => {
        const result = await this.fac.getColorAsync(img, {
          top: icon.y,
          left: icon.x,
          width: 64,
          height: 64,
        });
        icon.color = result.hex;
      }),
    );
  }
}
