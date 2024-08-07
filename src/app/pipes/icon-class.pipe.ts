import { Pipe, PipeTransform } from '@angular/core';

import { IdType } from '~/models';

@Pipe({ name: 'iconClass', standalone: true })
export class IconClassPipe implements PipeTransform {
  transform(value: string | null | undefined, type: IdType = 'item'): string {
    if (value == null) return '';
    return `lab-icon ${type} ${value}`;
  }
}

@Pipe({ name: 'iconSmClass', standalone: true })
export class IconSmClassPipe implements PipeTransform {
  static transform(
    value: string | null | undefined,
    type: IdType = 'item',
  ): string {
    if (value == null) return '';
    return `lab-icon sm ${type} ${value}`;
  }

  transform(value: string | null | undefined, type: IdType = 'item'): string {
    return IconSmClassPipe.transform(value, type);
  }
}
