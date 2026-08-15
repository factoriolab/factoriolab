import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
  TrackByFunction,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRotateLeft,
  faGrip,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { IconJson } from '~/data/schema/icon-data';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';

import { IconFileInfo } from '../editor.types';
import { EditorTab } from '../editor-tab';
import { normalizeIcon } from '../image.utils';

@Component({
  selector: 'lab-icons',
  imports: [
    FormsModule,
    DragDropModule,
    ScrollingModule,
    FaIconComponent,
    Button,
    TranslatePipe,
  ],
  templateUrl: './icons.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grow' },
})
export class Icons extends EditorTab {
  private readonly cd = inject(ChangeDetectorRef);

  protected readonly faArrowRotateLeft = faArrowRotateLeft;
  protected readonly faGrip = faGrip;
  protected readonly faUpload = faUpload;
  protected readonly fileInfo = signal<IconFileInfo | undefined>(undefined);
  protected readonly model: IconJson = {
    id: '',
    x: 0,
    y: 0,
    color: '',
  };
  protected readonly trackByFn: TrackByFunction<IconJson> = (
    _,
    item: IconJson,
  ): string => item.id;

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

  resetColors(): void {
    const { data, icons } = this.edit();
    for (const icon of data.icons) {
      const info = icons[icon.id];
      if (info) icon.color = info.color;
    }
  }

  selectFile(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files?.length) return;

    normalizeIcon(files[0]).then(
      (fileInfo) => {
        this.model.color = fileInfo.color;
        this.fileInfo.set(fileInfo);
      },
      (err: unknown) => {
        console.error(err);
      },
    );
  }

  add(id: string, info: IconFileInfo | undefined): void {
    this.edit().data.icons.push({ id, x: 0, y: 0, color: info?.color ?? '' });
    this.edit().icons[id] = info;
  }

  drop(event: CdkDragDrop<unknown>): void {
    moveItemInArray(
      this.edit().data.icons,
      event.previousIndex,
      event.currentIndex,
    );
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
        icon.color = fileInfo.color;
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
