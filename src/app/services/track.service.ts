import { KeyValue } from '@angular/common';
import { Injectable } from '@angular/core';

import { IdName, Product, Step } from '~/models';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  idName<T>(i: number, r: IdName<T>): T {
    return r.id;
  }

  step(i: number, r: Step): string {
    return r.id ?? '';
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
}
