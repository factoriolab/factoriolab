import { inject, Pipe, PipeTransform } from '@angular/core';

import { PowerUnit, Rational } from '~/models';
import { RatePipe } from './rate.pipe';

@Pipe({ name: 'power' })
export class PowerPipe implements PipeTransform {
  ratePipe = inject(RatePipe);

  transform(
    value: Rational,
    precision: number | null,
    unit?: PowerUnit,
  ): string {
    switch (unit) {
      case PowerUnit.GW:
        return `${this.ratePipe.transform(
          value.div(Rational.million),
          precision,
        )} GW`;
      case PowerUnit.MW:
        return `${this.ratePipe.transform(
          value.div(Rational.thousand),
          precision,
        )} MW`;
      default:
        return `${this.ratePipe.transform(value, precision)} kW`;
    }
  }
}
