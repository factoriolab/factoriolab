import { CdkDialogContainer, DialogRef } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

import { InterpolateParams } from '~/translate/translate';
import { TranslatePipe } from '~/translate/translate-pipe';

export interface DialogData {
  header?: string | [string, InterpolateParams];
}

@Component({
  selector: 'lab-dialog',
  imports: [CdkPortalOutlet, FaIconComponent, TranslatePipe],
  templateUrl: './dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bg-gray-900 p-4',
  },
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
