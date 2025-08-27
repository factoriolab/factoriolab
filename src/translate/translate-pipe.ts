import { ChangeDetectorRef, inject, Pipe, PipeTransform } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, Subject, switchMap } from 'rxjs';

import { InterpolateParams, Translate } from './translate';

/**
 * Determines whether two records contain the same values. Nullish or empty
 * records are treated as equal.
 */
function areRecordsEqual<T>(
  a: Record<string, T> | undefined,
  b: Record<string, T> | undefined,
  compareFn: (a: T, b: T) => boolean = (a, b) => a === b,
): boolean {
  if (a == null) return b == null || !Object.keys(b).length;
  if (b == null) return !Object.keys(a).length;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  return (
    aKeys.length === bKeys.length && aKeys.every((k) => compareFn(a[k], b[k]))
  );
}

@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly ref = inject(ChangeDetectorRef);
  private readonly translate = inject(Translate);

  private params$ = new Subject<[string, InterpolateParams | undefined]>();
  value = '';

  constructor() {
    this.params$
      .pipe(
        distinctUntilChanged(
          ([pKey, pParams], [cKey, cParams]) =>
            pKey === cKey && areRecordsEqual(pParams, cParams),
        ),

        switchMap((params) => this.translate.get(...params)),
        takeUntilDestroyed(),
      )
      .subscribe((value) => {
        this.value = value;
        this.ref.markForCheck();
      });
  }

  transform(key?: string, interpolateParams?: InterpolateParams): string {
    if (key == null) return '';
    this.params$.next([key, interpolateParams]);
    return this.value;
  }
}
