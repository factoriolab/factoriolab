import { Pipe, PipeTransform } from '@angular/core';

import {
  DisplayRate,
  displayRateInfo,
  ItemObjective,
  RateUnit,
  Rational,
} from '~/models';

@Pipe({ name: 'objectiveRate' })
export class ObjectiveRatePipe implements PipeTransform {
  transform(value: ItemObjective, displayRate: DisplayRate): string {
    if (
      displayRate !== DisplayRate.PerSecond &&
      value.rateUnit !== RateUnit.Belts
    ) {
      return Rational.from(value.rate)
        .mul(displayRateInfo[displayRate].value)
        .toString();
    }

    return value.rate;
  }
}
