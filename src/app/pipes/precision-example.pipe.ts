import { Pipe, PipeTransform } from '@angular/core';

import { rational } from '~/models/rational';

@Pipe({ name: 'precisionExample', standalone: true })
export class PrecisionExamplePipe implements PipeTransform {
  static value = rational(1n, 3n);

  transform(value: number | null | undefined): string {
    if (value == null) return PrecisionExamplePipe.value.toFraction();
    return PrecisionExamplePipe.value.toPrecision(value).toString();
  }
}
