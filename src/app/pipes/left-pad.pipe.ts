import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'leftPad', standalone: true })
export class LeftPadPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (value == null) return '';

    return ' '.repeat(4 - value.length) + value;
  }
}
