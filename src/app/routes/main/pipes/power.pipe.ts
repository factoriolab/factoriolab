import { Pipe, PipeTransform } from '@angular/core';

import { PowerUnit, Rational } from '~/models';
import { RatePipe } from './rate.pipe';

@Pipe({ name: 'power' })
export class PowerPipe implements PipeTransform {
  transform(
    value: Rational,
    precision: number | null,
    unit?: PowerUnit,
  ): string {
    switch (unit) {
      case PowerUnit.GW:
        return `${RatePipe.transform(
          value.div(Rational.million),
          precision,
        )} GW`;
      case PowerUnit.MW:
        return `${RatePipe.transform(
          value.div(Rational.thousand),
          precision,
        )} MW`;
      default:
        return `${RatePipe.transform(value, precision)} kW`;
    }
  }
}
