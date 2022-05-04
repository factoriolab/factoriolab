import { Pipe, PipeTransform } from '@angular/core';

import { Rational } from '~/models';

@Pipe({ name: 'gtZero' })
export class GtZeroPipe implements PipeTransform {
  transform(value: string | undefined): boolean {
    if (value != null) {
      try {
        return Rational.fromString(value).gt(Rational.zero);
      } catch {}
    }
    return false;
  }
}
