import { Pipe, PipeTransform } from '@angular/core';
import { SelectItem } from 'primeng/api';

@Pipe({ name: 'options' })
export class OptionsPipe implements PipeTransform {
  transform(
    value: string[] | null | undefined,
    entities: Record<string, { name: string }>
  ): SelectItem[] {
    if (value == null) {
      return [];
    }

    return value.map(
      (i): SelectItem => ({ label: entities[i].name, value: i })
    );
  }
}
