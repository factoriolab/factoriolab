import { KeyValue } from '@angular/common';
import { Injectable } from '@angular/core';

import { coalesce } from '~/helpers';
import { Rational } from '~/models/rational';
import { Step } from '~/models/step';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  trackStep(i: number, obj: Step): string {
    return `${coalesce(obj.itemId, '')}|${coalesce(obj.recipeId, '')}`;
  }

  trackById<T extends boolean | number | string = string>(
    i: number,
    obj: { id: T },
  ): T {
    return obj.id;
  }

  sortByValue(
    a: KeyValue<string, Rational>,
    b: KeyValue<string, Rational>,
  ): number {
    return b.value.sub(a.value).toNumber();
  }
}
