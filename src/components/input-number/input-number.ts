import {
  ChangeDetectionStrategy,
  Component,
  input,
  linkedSignal,
  model,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { debounce, map, of, Subject, timer } from 'rxjs';

import { Rational, rational } from '~/models/rational';
import { filterNullish } from '~/utils/nullish';

import { Control, LAB_CONTROL } from '../control';

let nextUniqueId = 0;

interface ChangeEvent {
  type: 'input' | 'blur' | 'keydown';
  value: Rational | undefined;
}

@Component({
  selector: 'lab-input-number',
  imports: [FormsModule],
  templateUrl: './input-number.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputNumber,
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: InputNumber,
      multi: true,
    },
    { provide: LAB_CONTROL, useExisting: InputNumber },
  ],
  host: { class: 'inline-flex group' },
})
export class InputNumber
  extends Control<Rational>
  implements Validator, OnInit
{
  private uniqueId = (nextUniqueId++).toString();

  readonly id = input(`lab-input-number-${this.uniqueId}`);
  readonly value = model<Rational>();
  readonly disabled = model(false);
  readonly minimum = input<Rational | undefined>(rational.zero);
  readonly maximum = input<Rational | undefined>(undefined);
  readonly integer = input(false);

  private value$ = new Subject<ChangeEvent>();
  private emit$ = this.value$.pipe(
    takeUntilDestroyed(),
    debounce((e) => (e.type === 'input' ? timer(300) : of({}))),
    map((e) => e.value),
    filterNullish(),
    map((v) => (this.integer() ? v.round() : v)),
  );

  readonly text = linkedSignal<Rational | undefined, string>({
    source: this.value,
    computation: (val, previous) => {
      if (val == null) return '0';
      if (previous != null && rational(previous.value).eq(val))
        return previous.value;
      return val.toString();
    },
  });

  ngOnInit(): void {
    this.emit$.subscribe((v) => {
      this.setValue(v);
    });
  }

  validate(
    control: AbstractControl<Rational | undefined>,
  ): ValidationErrors | null {
    const val = control.value;
    if (val == null) return null;

    try {
      const min = this.minimum();
      const max = this.maximum();
      if ((min == null || val.gte(min)) && (max == null || val.lte(max)))
        return null;
    } catch {
      // ignore error
    }

    return { rational: { valid: false } };
  }

  onChange(event: Event): void {
    try {
      const text = this.text();
      const value = rational(text);
      this.value$.next({
        type: event.type as 'input' | 'keydown' | 'blur',
        value,
      });
      if (value && event.type === 'keydown') this.text.set(value.toString());
    } catch {
      // Ignore error
    }
  }
}
