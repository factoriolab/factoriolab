import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'percentPad' })
export class PercentPadPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (value == null) return '';
    const repeat = Math.max(0, 4 - value.length);
    return `${' '.repeat(repeat)}${value}%`;
  }
}
