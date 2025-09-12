import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { TranslatePipe } from '~/translate/translate-pipe';

import { Button } from '../button/button';
import { ConfirmData } from './confirm-data';

@Component({
  selector: 'lab-confirm-dialog',
  imports: [FaIconComponent, Button, TranslatePipe],
  templateUrl: './confirm-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col gap-3 sm:gap-6 p-3 sm:p-6 pt-0 sm:pt-0 lg:max-w-3xl',
  },
})
export class ConfirmDialog<T = unknown> {
  protected readonly dialogData = inject<ConfirmData<T>>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef);
}
