import { Pipe, PipeTransform } from '@angular/core';

import { PagingData } from './paging-data';

@Pipe({ name: 'page' })
export class PagePipe implements PipeTransform {
  transform<T>(value: T[], data: PagingData): T[] {
    const { page, rows } = data;
    const first = page * rows;
    const last = first + rows;
    return value.slice(first, last);
  }
}
