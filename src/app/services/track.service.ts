import { KeyValue } from '@angular/common';
import { Injectable } from '@angular/core';

import { IdName, Product, Rational, Step } from '~/models';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  idName<T>(i: number, r: IdName<T>): T {
    return r.id;
  }

  step(i: number, r: Step): number {
    return r.id ?? -1;
  }

  product(i: number, r: Product): string {
    return r.id;
  }

  string(i: number, r: string): string {
    return r;
  }

  keyValue<T>(i: number, r: KeyValue<string, T>): string {
    return r.key;
  }

  sortKeyValue(
    a: KeyValue<string, Rational>,
    b: KeyValue<string, Rational>
  ): number {
    return b.value.sub(a.value).toNumber();
  }
}
