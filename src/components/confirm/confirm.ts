import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfirmData } from './confirm-data';
import { ConfirmDialog } from './confirm-dialog';

@Service()
export class Confirm {
  private readonly dialog = inject(Dialog);

  open<T>(data: ConfirmData<T>): Observable<T | undefined> {
    const config = new DialogConfig<
      ConfirmData<T>,
      DialogRef<T, ConfirmDialog<T>>
    >();
    config.data = data;
    return this.dialog.open<T, ConfirmData<T>, ConfirmDialog<T>>(
      ConfirmDialog,
      config,
    ).closed;
  }
}
