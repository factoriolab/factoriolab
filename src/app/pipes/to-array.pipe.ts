import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'toArray', standalone: true })
export class ToArrayPipe implements PipeTransform {
  transform<T>(value: Set<T>): T[] {
    return Array.from(value);
  }
}
