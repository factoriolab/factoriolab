import { Pipe, PipeTransform } from '@angular/core';

import { TableState } from '~/state/table/table-state';

@Pipe({ name: 'page' })
export class PagePipe implements PipeTransform {
  transform<T>(value: T[], data: TableState): T[] {
    const { page, rows } = data;
    const first = page * rows;
    const last = first + rows;
    return value.slice(first, last);
  }
}
