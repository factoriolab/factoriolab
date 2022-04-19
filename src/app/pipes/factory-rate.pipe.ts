import { Pipe, PipeTransform } from '@angular/core';

import { ItemId, Rational } from '~/models';
import { RatePipe } from './rate.pipe';

@Pipe({ name: 'factoryRate' })
export class FactoryRatePipe implements PipeTransform {
  constructor(private rate: RatePipe) {}

  transform(
    value: Rational,
    precision: number | null,
    factory: string
  ): string {
    if (factory === ItemId.Pumpjack) {
      return `${this.rate.transform(
        value.mul(Rational.hundred),
        precision != null ? Math.max(precision - 2, 0) : precision
      )}%`;
    } else {
      return this.rate.transform(value, precision);
    }
  }
}
