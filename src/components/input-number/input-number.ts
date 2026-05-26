import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  model,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { cva } from 'class-variance-authority';
import { debounce, map, of, Subject, timer } from 'rxjs';

import { Rational, rational } from '~/rational/rational';
import { TranslatePipe } from '~/translate/translate-pipe';
import { filterNullish } from '~/utils/nullish';
import { inRange } from '~/utils/number';

import { Button } from '../button/button';
import { Control } from '../control';
import { Rounded, roundedVariants } from '../rounding';
import { ValidateRational } from './validate-rational';

let nextUniqueId = 0;

const control = cva(
  'input square group-[.ng-invalid]:border-complement-500 group-[.ng-invalid]:outline-complement-500',
  {
    variants: {
      rounded: roundedVariants,
      bonus: { true: 'ps-5' },
      percent: { true: 'pe-6' },
      border: { false: 'border-transparent' },
      disabled: { true: 'pointer-events-none opacity-40' },
    },
  },
);

type EventType = 'input' | 'blur' | 'keydown';

interface ChangeEvent {
  type: EventType;
  value: Rational | undefined;
}

@Component({
  selector: 'lab-input-number',
  imports: [FormsModule, Button, TranslatePipe, ValidateRational],
  templateUrl: './input-number.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputNumber,
      multi: true,
    },
    { provide: Control, useExisting: InputNumber },
  ],
  host: { class: 'group relative inline-flex' },
})
export class InputNumber extends Control<Rational> {
  private uniqueId = (nextUniqueId++).toString();

  readonly controlId = input(`lab-input-number-${this.uniqueId}`);
  readonly value = model<Rational>();
  readonly disabled = model(false);
  readonly ariaLabel = input<string>();
  readonly labelledBy = input<string>();
  readonly minimum = input<Rational | undefined>(rational.zero);
  readonly maximum = input<Rational | undefined>(undefined);
  readonly step = input<Rational>(rational.one);
  readonly stepType = input<'add' | 'multiply'>('add');
  readonly integer = input(false);
  readonly rounded = input<Rounded>('all');
  readonly border = input(true);
  readonly buttons = input(false);
  readonly bonus = input<boolean>();
  readonly percent = input<boolean>();

  readonly valueReset = output();

  private valueChange = new Subject<ChangeEvent>();
  private emit = this.valueChange.pipe(
    takeUntilDestroyed(),
    debounce((e) => (e.type === 'input' ? timer(300) : of({}))),
    map((e) => e.value),
    filterNullish(),
    map((v) => (this.integer() ? v.round() : v)),
  );

  protected readonly text = linkedSignal<Rational | undefined, string>({
    source: this.value,
    computation: (val, previous) => {
      if (val == null) return '0';

      let prev = rational.zero;
      if (previous != null) {
        try {
          prev = rational(previous.value);
        } catch {
          // Ignore error
        }
      }

      if (previous?.value != null && prev.eq(val)) return previous.value;
      return val.toString();
    },
  });

  readonly controlClass = computed(() =>
    control({
      rounded: this.rounded(),
      bonus: this.bonus(),
      percent: this.percent(),
      border: this.border(),
      disabled: this.disabled(),
    }),
  );

  protected readonly faChevronDown = faChevronDown;
  protected readonly faChevronUp = faChevronUp;

  constructor() {
    super();
    this.emit.pipe(takeUntilDestroyed()).subscribe((v) => {
      this.writeValue(v);
    });
  }

  override valuesEqual(a: Rational, b: Rational | undefined): boolean {
    return b != null && a.eq(b);
  }

  onChange(event: Event): void {
    const type = event.type as EventType;
    try {
      const text = this.text();

      if (text === '' && (event.type === 'keydown' || event.type === 'blur'))
        this.valueReset.emit();

      const value = rational(text);
      const min = this.minimum();
      const max = this.maximum();
      if (inRange(value, min, max)) {
        this.valueChange.next({ type, value });
        if (value && event.type === 'keydown') this.text.set(value.toString());
        return;
      }
    } catch {
      // Ignore error
    }

    this.valueChange.next({ value: undefined, type });
  }

  increment(direction: 1 | -1): void {
    let value = this.value() ?? rational.zero;
    let step = this.step();
    switch (this.stepType()) {
      case 'add': {
        if (direction === -1) step = step.inverse();
        value = value.add(step);
        break;
      }
      case 'multiply': {
        if (value.isZero()) {
          if (direction === -1) value = rational(-1n).div(step);
          else value = rational.one.div(step);
        } else if (value.abs().lt(rational.one) && direction === -1) {
          value = rational.zero;
        } else {
          if (direction === -1) step = step.reciprocal();
          value = value.mul(step);
        }
        break;
      }
    }

    const min = this.minimum();
    const max = this.maximum();
    if (min?.gt(value)) value = min;
    if (max?.lt(value)) value = max;
    this.valueChange.next({ type: 'keydown', value });
  }
}
