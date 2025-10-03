import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';

import { ColumnsDialog } from './columns-dialog';

@Injectable({ providedIn: 'root' })
export class Columns {
  private readonly dialog = inject(Dialog);

  open(): void {
    this.dialog.open(ColumnsDialog, { data: { header: 'columns.header' } });
  }
}
