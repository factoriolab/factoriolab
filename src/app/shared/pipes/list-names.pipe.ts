import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'listNames' })
export class ListNamesPipe implements PipeTransform {
  transform(
    value: string[] | null | undefined,
    entities: Record<string, { name: string }>
  ): string {
    if (value == null) {
      return '';
    }

    return value.map((i) => entities[i].name).join('\n');
  }
}
