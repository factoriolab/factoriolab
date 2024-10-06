import { Pipe, PipeTransform } from '@angular/core';
import { SelectItem } from 'primeng/api';

import { ItemId } from '~/models/enum/item-id';
import { Entities } from '~/models/utils';

@Pipe({ name: 'options', standalone: true })
export class OptionsPipe implements PipeTransform {
  transform(
    value: string[] | null | undefined,
    entities: Entities<{ name: string }>,
    includeEmptyModule = false,
  ): SelectItem[] {
    if (value == null) {
      return [];
    }

    const list = value.map(
      (i): SelectItem => ({ label: entities[i].name, value: i }),
    );

    if (includeEmptyModule) {
      list.unshift({ label: 'None', value: ItemId.Module });
    }

    return list;
  }
}
