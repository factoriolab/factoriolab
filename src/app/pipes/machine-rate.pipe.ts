import { inject, Pipe, PipeTransform } from '@angular/core';

import { ItemId, Rational } from '~/models';
import { RatePipe } from './rate.pipe';

@Pipe({ name: 'machineRate' })
export class MachineRatePipe implements PipeTransform {
  ratePipe = inject(RatePipe);

  transform(
    value: Rational,
    precision: number | null,
    machineId: string,
  ): string {
    if (machineId === ItemId.Pumpjack) {
      return `${this.ratePipe.transform(
        value.mul(Rational.hundred),
        precision != null ? Math.max(precision - 2, 0) : precision,
      )}%`;
    } else {
      return this.ratePipe.transform(value, precision);
    }
  }
}
