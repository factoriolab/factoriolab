import { inject, Pipe, PipeTransform } from '@angular/core';

import { TableState } from '~/state/table/table-state';
import { TableStore } from '~/state/table/table-store';

@Pipe({ name: 'page' })
export class PagePipe implements PipeTransform {
  private readonly tableStore = inject(TableStore);

  transform<T>(value: T[], data: TableState): T[] {
    const { page, rows } = data;
    let first = page * rows;
    if (first > value.length - 1) {
      // First item is outside range. Reset to first page.
      first = 0;
      this.tableStore.apply({ page: 0 });
    }

    const last = first + rows;
    return value.slice(first, last);
  }
}
