import { CdkDialogContainer, DialogRef } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import { InterpolateParams } from '~/translate/translate';
import { TranslatePipe } from '~/translate/translate-pipe';

import { Button } from '../button/button';

export interface DialogData {
  header?: string | [string, InterpolateParams];
}

@Component({
  selector: 'lab-dialog',
  imports: [CdkPortalOutlet, Button, TranslatePipe],
  templateUrl: './dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col bg-gray-950 border border-gray-700' },
})
export class Dialog extends CdkDialogContainer implements OnInit {
  protected readonly dialogRef = inject(DialogRef);

  protected faXmark = faXmark;

  header?: string;
  headerParams?: InterpolateParams;

  ngOnInit(): void {
    this.parseData();
  }

  parseData(): void {
    const data = this.dialogRef.config.data as unknown;
    if (data == null || typeof data !== 'object') return;
    const header = (data as DialogData).header;
    if (typeof header === 'string') this.header = header;
    else if (typeof header === 'object')
      [this.header, this.headerParams] = [...header];
  }
}
