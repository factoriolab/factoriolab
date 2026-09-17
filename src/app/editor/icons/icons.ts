import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CdkMenuModule } from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faArrowRotateLeft,
  faCheck,
  faEllipsis,
  faExclamationTriangle,
  faGrip,
  faPlus,
  faUpload,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { IconJson } from '~/data/schema/icon-data';
import { TranslatePipe } from '~/translate/translate-pipe';
import { coalesce } from '~/utils/nullish';

import { IconFileInfo } from '../editor.types';
import { EditorTab } from '../editor-tab';
import { normalizeIcon } from '../image.utils';

function emptyIcon(): IconJson {
  return {
    id: '',
    x: 0,
    y: 0,
    color: '',
  };
}

@Component({
  selector: 'lab-icons',
  imports: [
    FormsModule,
    CdkMenuModule,
    DragDropModule,
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
  protected readonly faEllipsis = faEllipsis;
  protected readonly faGrip = faGrip;
  protected readonly faPlus = faPlus;
  protected readonly faUpload = faUpload;
  protected readonly fileInfo = signal<IconFileInfo | undefined>(undefined);
  protected model = emptyIcon();

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
    this.model = emptyIcon();
    this.fileInfo.set(undefined);
  }

  drop(event: CdkDragDrop<unknown>): void {
    const icons = [...this.edit().data.icons];
    moveItemInArray(icons, event.previousIndex, event.currentIndex);
    this.edit().data.icons = icons;
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

  clone(icon: IconJson, index: number): void {
    icon = JSON.parse(JSON.stringify(icon)) as IconJson;
    this.edit().data.icons.splice(index + 1, 0, icon);
  }

  remove(id: string): void {
    const { data } = this.edit();
    this.confirm
      .open({
        header: 'Delete icon?',
        message:
          'If this icon is in use, deleting it will invalidate some entities. Continue?',
        icon: faExclamationTriangle,
        actions: [
          { text: 'yes', value: 1, icon: faCheck },
          { text: 'cancel', value: 0, icon: faXmark },
        ],
      })
      .subscribe((res) => {
        if (res === 1) {
          data.icons = data.icons.filter((c) => c.id !== id);
          this.cd.detectChanges();
        }
      });
  }
}
