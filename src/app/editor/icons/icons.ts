import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { IconJson } from '~/data/schema/icon-data';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';

import { IconFileInfo } from '../editor.types';
import { EditorTab } from '../editor-tab';
import { normalizeIcon } from '../image.utils';

@Component({
  selector: 'lab-icons',
  imports: [FormsModule, Button, TranslatePipe],
  templateUrl: './icons.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icons extends EditorTab {
  private readonly cd = inject(ChangeDetectorRef);

  protected readonly faUpload = faUpload;
  protected readonly fileInfo = signal<IconFileInfo | undefined>(undefined);
  protected readonly model: IconJson = {
    id: '',
    x: 0,
    y: 0,
    color: '',
  };

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
        this.cd.detectChanges();
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

  changeId(icon: IconJson, id: string): void {
    const { data, icons } = this.edit();
    [
      ...data.categories,
      ...data.items,
      ...data.recipes,
      ...coalesce(data.locations, []),
      ...coalesce(data.qualities, []),
    ]
      .filter((e) => e.icon === icon.id)
      .forEach((e) => (e.icon = id));
    icons[id] = icons[icon.id];
    delete icons[icon.id];
    icon.id = id;
  }

  changeImage(icon: IconJson, event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files?.length) return;

    normalizeIcon(files[0]).then(
      (fileInfo) => {
        this.edit().icons[icon.id] = fileInfo;
        this.cd.detectChanges();
      },
      (err: unknown) => {
        console.error(err);
      },
    );
  }

  remove(id: string): void {
    const data = this.edit().data;
    data.icons = data.icons.filter((i) => i.id !== id);
  }
}
