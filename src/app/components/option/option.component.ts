import {
  ChangeDetectionStrategy,
  Component,
  input,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { map, merge, Observable, Subject, switchMap } from 'rxjs';

export function toSelect<T>(
  options: Signal<readonly OptionComponent<T>[]>,
): Observable<T> {
  return toObservable(options).pipe(
    switchMap((opts) =>
      merge(...opts.map((o) => o.select$.pipe(map(() => o.value())))),
    ),
    takeUntilDestroyed(),
  );
}

@Component({
  selector: 'lab-option',
  imports: [],
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'option',
    tabindex: '0',
    '(click)': 'select()',
    '(keydown.enter)': 'select()',
  },
})
export class OptionComponent<T> {
  value = input.required<T>();
  disabled = input<boolean>();

  select$ = new Subject<void>();

  select(): void {
    if (this.disabled()) return;
    this.select$.next();
  }
}
