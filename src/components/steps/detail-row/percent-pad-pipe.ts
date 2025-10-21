import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'percentPad' })
export class PercentPadPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (value == null) return '';
    return `${' '.repeat(4 - value.length)}${value}%`;
  }
}
