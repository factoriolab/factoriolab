import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  HostBinding,
  input,
  OnInit,
  Output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounce, map, of, Subject, tap, timer } from 'rxjs';

import { filterNullish } from '~/helpers';
import { Rational } from '~/models';

type EventType = 'input' | 'blur' | 'enter';

interface Event {
  value: string | null;
  type: EventType;
}

@Component({
  selector: 'lab-input-number',
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNumberComponent implements OnInit {
  value = input('');
  minimum = input<string | null | undefined>('0');
  maximum = input<string | null | undefined>(null);
  width = input('');
  inputId = input('inputnumber');
  hideButtons = input(false);
  textButtons = input(false);

  @Output() setValue = new EventEmitter<string>();

  @HostBinding('class') classAttr = 'p-element p-inputwrapper';

  setValue$ = new Subject<Event>();

  min = computed(() => {
    const minimum = this.minimum();
    return minimum == null ? null : Rational.fromString(minimum);
  });
  max = computed(() => {
    const maximum = this.maximum();
    return maximum == null ? null : Rational.fromString(maximum);
  });
  isMinimum = computed(() => {
    const value = this.value();
    const min = this.min();
    if (min == null) return false;
    try {
      return Rational.fromString(value).lte(min);
    } catch {
      return false;
    }
  });
  isMaximum = computed(() => {
    const value = this.value();
    const max = this.max();
    if (max == null) return false;
    try {
      return Rational.fromString(value).gte(max);
    } catch {
      return false;
    }
  });

  // Watch for all value changes to input field
  // Debounce input events by 300ms to avoid rapid updates
  // If last value is nullish (invalid), do not emit
  emitFilteredValues$ = this.setValue$.pipe(
    takeUntilDestroyed(),
    debounce((e) => (e.type === 'input' ? timer(300) : of({}))),
    map((e) => e.value),
    filterNullish(),
    tap((v) => this.setValue.emit(v)),
  );

  ngOnInit(): void {
    this.emitFilteredValues$.subscribe();
  }

  changeValue(value: string, type: EventType): void {
    try {
      const rational = Rational.fromString(value);
      const min = this.min();
      const max = this.max();
      if (
        (min == null || rational.gte(min)) &&
        (max == null || rational.lte(max))
      ) {
        // Simplify value once user is finished
        if (type !== 'input') value = rational.toString();
        this.setValue$.next({ value, type });
        return;
      }
    } catch {
      // ignore error
    }
    this.setValue$.next({ value: null, type });
  }

  increase(): void {
    try {
      const rational = Rational.fromString(this.value());
      const newValue = rational.isInteger()
        ? rational.add(Rational.one)
        : rational.ceil();
      const max = this.max();
      if (max == null || newValue.lte(max))
        this.setValue.emit(newValue.toString());
    } catch {
      // ignore error
    }
  }

  decrease(): void {
    try {
      const rational = Rational.fromString(this.value());
      const newValue = rational.isInteger()
        ? rational.sub(Rational.one)
        : rational.floor();
      const min = this.min();
      if (min == null || newValue.gte(min))
        this.setValue.emit(newValue.toString());
    } catch {
      // ignore error
    }
  }
}
