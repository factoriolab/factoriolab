import { Pipe, PipeTransform } from '@angular/core';

import { ItemId, Rational } from '~/models';
import { RatePipe } from './rate.pipe';

@Pipe({ name: 'factoryRate' })
export class FactoryRatePipe implements PipeTransform {
  constructor(private ratePipe: RatePipe) {}

  transform(
    value: Rational,
    precision: number | null,
    factoryId: string
  ): string {
    if (factoryId === ItemId.Pumpjack) {
      return `${this.ratePipe.transform(
        value.mul(Rational.hundred),
        precision != null ? Math.max(precision - 2, 0) : precision
      )}%`;
    } else {
      return this.ratePipe.transform(value, precision);
    }
  }
}
