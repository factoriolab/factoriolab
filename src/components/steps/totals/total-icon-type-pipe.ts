import { Pipe, PipeTransform } from '@angular/core';

import { IconType } from '~/data/icon-type';
import { Dataset } from '~/state/settings/dataset';

@Pipe({ name: 'totalIconType' })
export class TotalIconTypePipe implements PipeTransform {
  transform(value: string, data: Dataset): IconType {
    if (data.itemRecord[value]) return 'item';
    return 'recipe';
  }
}
