import { Pipe, PipeTransform } from '@angular/core';

import { rational } from '~/rational/rational';

const example = rational(2n, 3n);
const fraction = example.toFraction();

@Pipe({ name: 'precisionExample', standalone: true })
export class PrecisionExamplePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return fraction;
    return example.toFixedString(value);
  }
}
