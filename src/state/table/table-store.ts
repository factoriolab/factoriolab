import { Injectable } from '@angular/core';

import { Store } from '../store';
import { initialTableState, TableState } from './table-state';

@Injectable({ providedIn: 'root' })
export class TableStore extends Store<TableState> {
  readonly page = this.select('page');
  readonly rows = this.select('rows');
  readonly sort = this.select('sort');
  readonly asc = this.select('asc');

  constructor() {
    super(initialTableState);
  }

  setSort(sort: string): void {
    this.update((state) => {
      if (state.sort === sort) {
        if (state.asc) return { sort: undefined, asc: false };
        return { asc: true };
      }

      return { sort: sort };
    });
  }
}
