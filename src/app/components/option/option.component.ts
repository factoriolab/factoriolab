import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { map, merge, Observable, Subject, switchMap } from 'rxjs';

import { Optional } from '~/models/utils';

import { FormComponent } from '../form-component/form-component';

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
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': 'disabled()',
    class:
      'cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-400 focus-visible:z-1',
    '[class.bg-theme-800]': 'formComponent.value() === value()',
    '[class.hover:bg-theme-900]': 'formComponent.value() !== value()',
    '[class.pointer-events-none]': 'disabled()',
    '[class.opacity-40]': 'disabled()',
    '(click)': 'onClick()',
    '(keydown.enter)': 'onClick()',
    '(keydown.arrowup)': 'onArrowUp($event)',
    '(keydown.arrowdown)': 'onArrowDown($event)',
  },
})
export class OptionComponent<T> {
  elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  formComponent = inject(FormComponent);

  value = input.required<T>();
  disabled = input<boolean>(false);

  select$ = new Subject<void>();

  onClick(): void {
    if (this.disabled()) return;
    this.formComponent.setValue(this.value());
  }

  onArrowUp(event: KeyboardEvent): void {
    this.moveFocus(
      this.elementRef.nativeElement,
      event,
      'previousElementSibling',
    );
  }

  onArrowDown(event: KeyboardEvent): void {
    this.moveFocus(this.elementRef.nativeElement, event, 'nextElementSibling');
  }

  moveFocus(
    el: HTMLElement,
    event: KeyboardEvent,
    field: 'nextElementSibling' | 'previousElementSibling',
  ): void {
    const next = el[field] as Optional<HTMLElement>;
    if (next == null) return;
    // If the next element is disabled as indicated by tabindex, skip it
    if (next.attributes.getNamedItem('tabindex')?.value !== '0') {
      this.moveFocus(next, event, field);
      return;
    }

    next.scrollIntoView({ behavior: 'smooth', block: 'center' });
    next.focus();
    event.preventDefault();
  }
}
