import { Pipe, PipeTransform } from '@angular/core';

import { PowerUnit, Rational } from '~/models';
import { RatePipe } from './rate.pipe';

@Pipe({ name: 'power' })
export class PowerPipe implements PipeTransform {
  constructor(private rate: RatePipe) {}

  transform(
    value: Rational,
    precision: number | null,
    unit?: PowerUnit
  ): string {
    switch (unit) {
      case PowerUnit.GW:
        return `${this.rate.transform(
          value.div(Rational.million),
          precision
        )} GW`;
      case PowerUnit.MW:
        return `${this.rate.transform(
          value.div(Rational.thousand),
          precision
        )} MW`;
      default:
        return `${this.rate.transform(value, precision)} kW`;
    }
  }
}
