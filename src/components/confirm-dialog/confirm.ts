import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConfirmData } from './confirm-data';
import { ConfirmDialog } from './confirm-dialog';

@Injectable({ providedIn: 'root' })
export class Confirm {
  private readonly dialog = inject(Dialog);

  show<T>(data: ConfirmData<T>): Observable<T | undefined> {
    return this.dialog.open<T, ConfirmData<T>>(ConfirmDialog, { data }).closed;
  }
}
