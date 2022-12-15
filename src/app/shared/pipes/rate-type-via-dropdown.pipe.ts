import { Pipe, PipeTransform } from '@angular/core';

import { IdType, RateType } from '~/models';

@Pipe({ name: 'rateTypeViaDropdown' })
export class RateTypeViaDropdownPipe implements PipeTransform {
  transform(value: RateType): IdType {
    return value === RateType.Factories ? 'recipe' : 'item';
  }
}
