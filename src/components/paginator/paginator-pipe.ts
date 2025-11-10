import {
  afterNextRender,
  inject,
  Injector,
  Pipe,
  PipeTransform,
} from '@angular/core';

import { TableState } from '~/state/table/table-state';
import { TableStore } from '~/state/table/table-store';

@Pipe({ name: 'paginator' })
export class PaginatorPipe implements PipeTransform {
  private readonly injector = inject(Injector);
  private readonly tableStore = inject(TableStore);

  transform<T>(value: T[], data: TableState): T[] {
    if (!value.length) return value;

    const { page, rows } = data;
    let first = page * rows;
    if (first > value.length - 1 && page > 0) {
      // First item is outside range. Reset to first page.
      first = 0;
      afterNextRender(
        () => {
          this.tableStore.apply({ page: 0 });
        },
        { injector: this.injector },
      );
    }

    const last = first + rows;
    return value.slice(first, last);
  }
}
