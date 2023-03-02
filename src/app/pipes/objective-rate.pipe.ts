import { Pipe, PipeTransform } from '@angular/core';

import {
  DisplayRate,
  displayRateInfo,
  ItemObjective,
  Rational,
} from '~/models';

@Pipe({ name: 'objectiveRate' })
export class ObjectiveRatePipe implements PipeTransform {
  transform(value: ItemObjective, displayRate: DisplayRate): string {
    if (displayRate !== DisplayRate.PerSecond && value.rateUnit !== 'belts') {
      return Rational.from(value.rate)
        .mul(displayRateInfo[displayRate].value)
        .toString();
    }

    return value.rate;
  }
}
