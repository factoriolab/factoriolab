import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'iconClass' })
export class IconClassPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (value == null) return '';

    return `lab-icon ${value}`;
  }
}

@Pipe({ name: 'iconSmClass' })
export class IconSmClassPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (value == null) return '';

    return `lab-icon-sm ${value}`;
  }
}
