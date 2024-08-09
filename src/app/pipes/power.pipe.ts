import { Pipe, PipeTransform } from '@angular/core';

import { PowerUnit, Rational, rational } from '~/models';
import { RatePipe } from './rate.pipe';

@Pipe({ name: 'power', standalone: true })
export class PowerPipe implements PipeTransform {
  transform(
    value: Rational,
    precision: number | null,
    unit?: PowerUnit,
  ): string {
    switch (unit) {
      case PowerUnit.GW:
        return `${RatePipe.transform(
          value.div(rational(1000000n)),
          precision,
        )} GW`;
      case PowerUnit.MW:
        return `${RatePipe.transform(
          value.div(rational(1000n)),
          precision,
        )} MW`;
      default:
        return `${RatePipe.transform(value, precision)} kW`;
    }
  }
}
