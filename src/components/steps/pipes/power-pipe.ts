import { Pipe, PipeTransform } from '@angular/core';

import { RatePipe } from '~/components/steps/pipes/rate-pipe';
import { PowerUnit } from '~/state/preferences/power-unit';

import { Rational, rational } from '../../../rational/rational';

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
