import { Pipe, PipeTransform } from '@angular/core';

import { ItemId, Rational } from '~/models';
import { RatePipe } from './rate.pipe';

@Pipe({ name: 'machineRate' })
export class MachineRatePipe implements PipeTransform {
  transform(
    value: Rational,
    precision: number | null,
    machineId: string,
  ): string {
    if (machineId === ItemId.Pumpjack) {
      return `${RatePipe.transform(
        value.mul(Rational.hundred),
        precision != null ? Math.max(precision - 2, 0) : precision,
      )}%`;
    } else {
      return RatePipe.transform(value, precision);
    }
  }
}
