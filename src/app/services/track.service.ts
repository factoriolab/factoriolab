import { KeyValue } from '@angular/common';
import { Injectable } from '@angular/core';

import { Rational } from '~/models';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  trackById<T extends boolean | number | string = string>(
    i: number,
    obj: { id: T }
  ): T {
    return obj.id;
  }

  trackByKey<T>(i: number, r: KeyValue<string, T>): string {
    return r.key;
  }

  sortByValue(
    a: KeyValue<string, Rational>,
    b: KeyValue<string, Rational>
  ): number {
    return b.value.sub(a.value).toNumber();
  }
}
