import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'leftPad' })
export class LeftPadPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (value != null) {
      return ' '.repeat(4 - value.length) + value;
    } else {
      return '';
    }
  }
}
