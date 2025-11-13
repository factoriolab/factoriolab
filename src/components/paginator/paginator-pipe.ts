import { Pipe, PipeTransform } from '@angular/core';

import { TableState } from '~/state/table/table-state';

@Pipe({ name: 'paginator' })
export class PaginatorPipe implements PipeTransform {
  transform<T>(value: T[], data: TableState): T[] {
    if (!value.length) return value;

    const { page, rows } = data;
    let first = page * rows;

    // If first item is outside range. Reset to first page.
    if (first > value.length - 1 && page > 0) first = 0;

    const last = first + rows;
    return value.slice(first, last);
  }
}
