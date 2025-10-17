import { KeyValue } from '@angular/common';

import { Rational } from './rational';

export function sortByValue(
  a: KeyValue<string, Rational>,
  b: KeyValue<string, Rational>,
): number {
  return b.value.sub(a.value).toNumber();
}
