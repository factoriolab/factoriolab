import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  faCodeCommit,
  faDownload,
  faExclamationTriangle,
  faFlag,
  faRotateLeft,
  faUpload,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '~/components/button/button';
import { Confirm } from '~/components/confirm/confirm';
import { TabData } from '~/components/tabs/tab-data';
import { Tabs } from '~/components/tabs/tabs';
import { emptyModData } from '~/data/schema/mod-data';

@Component({
  selector: 'lab-editor',
  imports: [RouterOutlet, Button, Tabs],
  templateUrl: './editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'px-1 sm:px-3 lg:px-6 lg:pt-3 flex grow flex-col gap-2' },
})
export class Editor {
  private readonly confirm = inject(Confirm);

  protected readonly tabs: TabData[] = [
    {
      label: 'version',
      value: 'version',
      routerLink: 'version',
      faIcon: faCodeCommit,
    },
    { label: 'flags', value: 'flags', routerLink: 'flags', faIcon: faFlag },
  ];
  protected readonly data = signal(emptyModData());
  protected readonly faRotateLeft = faRotateLeft;
  protected readonly faDownload = faDownload;
  protected readonly faUpload = faUpload;

  download(): void {
    console.log('TODO');
  }

  upload(): void {
    console.log('TODO');
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
          this.data.set(emptyModData());
        }
      });
  }
}
