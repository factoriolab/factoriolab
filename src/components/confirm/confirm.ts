import { Dialog } from '@angular/cdk/dialog';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfirmData } from './confirm-data';
import { ConfirmDialog } from './confirm-dialog';

@Service()
export class Confirm {
  private readonly dialog = inject(Dialog);

  open<T>(data: ConfirmData<T>): Observable<T | undefined> {
    return this.dialog.open<T, ConfirmData<T>, ConfirmDialog<T>>(
      ConfirmDialog,
      { data },
    ).closed;
  }
}
