import { Pipe, PipeTransform } from '@angular/core';

import { ItemId } from '~/models/enum/item-id';
import { Rational, rational } from '~/models/rational';

import { RatePipe } from './rate.pipe';

@Pipe({ name: 'machineRate', standalone: true })
export class MachineRatePipe implements PipeTransform {
  transform(
    value: Rational,
    precision: number | null,
    machineId: string,
  ): string {
    if (machineId === ItemId.Pumpjack) {
      return `${RatePipe.transform(
        value.mul(rational(100n)),
        precision != null ? Math.max(precision - 2, 0) : precision,
      )}%`;
    } else {
      return RatePipe.transform(value, precision);
    }
  }
}
