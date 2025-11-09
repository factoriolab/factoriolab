import { Injectable } from '@angular/core';

import { Store } from '../store';
import { initialTableState, TableState } from './table-state';

@Injectable({ providedIn: 'root' })
export class TableStore extends Store<TableState> {
  readonly page = this.select('page');
  readonly rows = this.select('rows');

  constructor() {
    super(initialTableState);
  }
}
