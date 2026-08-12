import { Dialog } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  faBoxesStacked,
  faCodeCommit,
  faDownload,
  faExclamationTriangle,
  faFileExport,
  faFlag,
  faFlaskVial,
  faGavel,
  faImages,
  faLayerGroup,
  faLocationDot,
  faRankingStar,
  faRectangleList,
  faRotateLeft,
  faUpload,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { saveAs } from 'file-saver';

import { Button } from '~/components/button/button';
import { Confirm } from '~/components/confirm/confirm';
import { TabData } from '~/components/tabs/tab-data';
import { Tabs } from '~/components/tabs/tabs';
import { TranslatePipe } from '~/translate/translate-pipe';

import { DownloadDialog } from './download-dialog/download-dialog';
import { EditorData, emptyEditorData } from './editor.types';
import { exportIcons } from './image.utils';
import { UploadDialog } from './upload-dialog/upload-dialog';

@Component({
  selector: 'lab-editor',
  imports: [RouterOutlet, Button, Tabs, TranslatePipe],
  templateUrl: './editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'px-1 sm:px-3 lg:px-6 lg:pt-3 flex grow flex-col gap-2' },
})
export class Editor {
  private readonly confirm = inject(Confirm);
  private readonly dialog = inject(Dialog);

  protected readonly tabs: TabData[] = [
    {
      label: 'settings.modVersions',
      value: 'version',
      routerLink: 'version',
      faIcon: faCodeCommit,
    },
    {
      label: 'data.flags',
      value: 'flags',
      routerLink: 'flags',
      faIcon: faFlag,
    },
    {
      label: 'data.categories',
      value: 'categories',
      routerLink: 'categories',
      faIcon: faLayerGroup,
    },
    {
      label: 'editor.icons',
      value: 'icons',
      routerLink: 'icons',
      faIcon: faImages,
    },
    {
      label: 'data.items',
      value: 'items',
      routerLink: 'items',
      faIcon: faBoxesStacked,
    },
    {
      label: 'data.recipes',
      value: 'recipes',
      routerLink: 'recipes',
      faIcon: faFlaskVial,
    },
    {
      label: 'editor.limitations',
      value: 'limitations',
      routerLink: 'limitations',
      faIcon: faGavel,
    },
    {
      label: 'data.locations',
      value: 'locations',
      routerLink: 'locations',
      faIcon: faLocationDot,
    },
    {
      label: 'editor.qualities',
      value: 'qualities',
      routerLink: 'qualities',
      faIcon: faRankingStar,
    },
    {
      label: 'editor.defaults',
      value: 'defaults',
      routerLink: 'defaults',
      faIcon: faRectangleList,
    },
  ];
  protected readonly edit = signal(emptyEditorData());
  protected readonly faFileExport = faFileExport;
  protected readonly faRotateLeft = faRotateLeft;
  protected readonly faDownload = faDownload;
  protected readonly faUpload = faUpload;

  download(): void {
    this.dialog.open<EditorData>(DownloadDialog).closed.subscribe((edit) => {
      if (edit) this.edit.set(edit);
    });
  }

  upload(): void {
    this.dialog.open<EditorData>(UploadDialog).closed.subscribe((edit) => {
      if (edit) this.edit.set(edit);
    });
  }

  reset(): void {
    this.confirm
      .open({
        header: 'Reset editor',
        message: 'Are you sure you want to reset all editor data?',
        icon: faExclamationTriangle,
        actions: [
          { text: 'yes', value: 1, icon: faRotateLeft },
          { text: 'cancel', value: 0, icon: faXmark },
        ],
      })
      .subscribe((res) => {
        if (res === 1) {
          this.edit.set(emptyEditorData());
        }
      });
  }

  export(): void {
    const edit = this.edit();
    exportIcons(edit).then(
      (blob) => {
        saveAs(new Blob([blob], { type: 'image/webp' }), 'icons.png');
        saveAs(
          new Blob([JSON.stringify(edit.data)], { type: 'application/json' }),
          'data.json',
        );
      },
      (err: unknown) => {
        console.error(err);
      },
    );
  }
}
