import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Signal,
  signal,
} from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import {
  faFloppyDisk,
  faTrash,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { TranslatePipe } from '~/translate/translate-pipe';

import { EditorData, IconFileInfo } from '../editor.types';
import { normalizeIcon } from '../image.utils';

@Component({
  selector: 'lab-icons',
  imports: [Button, TranslatePipe],
  templateUrl: './icons.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col' },
})
export class Icons {
  private readonly cd = inject(ChangeDetectorRef);
  protected readonly edit = inject<Signal<EditorData>>(ROUTER_OUTLET_DATA);

  protected readonly faTrash = faTrash;
  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faUpload = faUpload;
  protected readonly fileInfo = signal<IconFileInfo | undefined>(undefined);

  selectFiles(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files?.length) return;

    Promise.all(Array.from(files).map((file) => normalizeIcon(file))).then(
      (infos) => {
        infos.forEach((info, i) => {
          const file = files[i];
          const parts = file.name.split('.');
          parts.pop();
          const id = parts.join('.');
          this.add(id, info);
        });
        this.cd.markForCheck();
      },
      (err: unknown) => {
        console.error(err);
      },
    );
  }

  selectFile(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files?.length) return;

    normalizeIcon(files[0]).then(
      (fileInfo) => {
        this.fileInfo.set(fileInfo);
      },
      (err: unknown) => {
        console.error(err);
      },
    );
  }

  add(id: string, info: IconFileInfo | undefined): void {
    this.edit().data.icons.push({ id, x: 0, y: 0, color: '' });
    this.edit().icons[id] = info;
  }

  remove(id: string): void {
    const data = this.edit().data;
    data.icons = data.icons.filter((i) => i.id !== id);
  }
}
