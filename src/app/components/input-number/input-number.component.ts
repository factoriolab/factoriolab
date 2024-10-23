import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  HostBinding,
  input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { debounce, map, of, Subject, tap, timer } from 'rxjs';

import { ValidateNumberDirective } from '~/directives/validate-number.directive';
import { filterNullish } from '~/helpers';
import { Rational, rational } from '~/models/rational';
import { Optional } from '~/models/utils';

type EventType = 'input' | 'blur' | 'enter';

interface Event {
  value: string | null;
  type: EventType;
}

@Component({
  selector: 'lab-input-number',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    ValidateNumberDirective,
  ],
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNumberComponent implements OnInit, OnChanges {
  value = input(rational.zero);
  minimum = input<Optional<Rational>>(rational.zero);
  maximum = input<Optional<Rational>>(undefined);
  width = input('');
  inputId = input('inputnumber');
  integer = input(false);
  disabled = input(false);
  hideButtons = input(false);
  textButtons = input(false);

  _value = '';

  @Output() setValue = new EventEmitter<Rational>();

  @HostBinding('class') classAttr = 'p-element p-inputwrapper';

  setValue$ = new Subject<Event>();

  isMinimum = computed(() => {
    const value = this.value();
    const min = this.minimum();
    if (min == null) return false;
    try {
      return value.lte(min);
    } catch {
      return false;
    }
  });
  isMaximum = computed(() => {
    const value = this.value();
    const max = this.maximum();
    if (max == null) return false;
    try {
      return value.gte(max);
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
    tap((v) => {
      let value = rational(v);
      if (this.integer()) value = value.round();
      this.setValue.emit(value);
    }),
  );

  ngOnInit(): void {
    this.emitFilteredValues$.subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['value']) return;
    let old: Rational | undefined;
    try {
      old = rational(this._value);
    } catch {
      // Ignore error
    }

    if (!old?.eq(this.value())) this._value = this.value().toString();
  }

  changeValue(type: EventType): void {
    try {
      let value = this._value;
      const rat = rational(value);
      const min = this.minimum();
      const max = this.maximum();
      if ((min == null || rat.gte(min)) && (max == null || rat.lte(max))) {
        if (type === 'enter') {
          // Simplify value if user hits enter
          value = rat.toString();
          this._value = value;
        }

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
      const value = this.value();
      const newValue = value.isInteger()
        ? value.add(rational.one)
        : value.ceil();
      const max = this.maximum();
      if (max == null || newValue.lte(max)) this.setValue.emit(newValue);
    } catch {
      // ignore error
    }
  }

  decrease(): void {
    try {
      const value = this.value();
      const newValue = value.isInteger()
        ? value.sub(rational.one)
        : value.floor();
      const min = this.minimum();
      if (min == null || newValue.gte(min)) this.setValue.emit(newValue);
    } catch {
      // ignore error
    }
  }
}
