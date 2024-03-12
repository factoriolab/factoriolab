import { Pipe, PipeTransform } from '@angular/core';
import { SelectItem } from 'primeng/api';

@Pipe({ name: 'filterOptions' })
export class FilterOptionsPipe implements PipeTransform {
  transform(
    value: SelectItem[] | null | undefined,
    exclude: string[] | null | undefined,
    self?: string | null,
  ): SelectItem[] {
    if (value == null) return [];
    if (!exclude?.length) return value;

    const excludeSet = new Set(exclude);
    return value.filter((o) => !excludeSet.has(o.value) || o.value === self);
  }
}
