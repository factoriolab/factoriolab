import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'url' })
export class UrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (value == null) return '';

    return `url(${value})`;
  }
}
