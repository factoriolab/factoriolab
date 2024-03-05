import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { debounce, map, of, Subject, timer } from 'rxjs';

import { filterNullish } from '~/helpers';
import { Rational } from '~/models';

type EventType = 'input' | 'blur' | 'enter';

interface Event {
  value: string | null;
  type: EventType;
}

@UntilDestroy(this)
@Component({
  selector: 'lab-input-number',
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNumberComponent implements OnInit, OnChanges {
  @Input() value = '';
  @Input() minimum: string | null = '0';
  @Input() maximum: string | null = null;
  @Input() width = '';
  @Input() inputId = 'inputnumber';
  @Input() hideButtons = false;
  @Input() textButtons = false;

  @Output() setValue = new EventEmitter<string>();

  @HostBinding('class') classAttr = 'p-element p-inputwrapper';

  setValue$ = new Subject<Event>();
  isMinimum = false;
  isMaximum = false;
  min: Rational | null = Rational.zero;
  max: Rational | null = null;

  ngOnInit(): void {
    // Watch for all value changes to input field
    // Debounce input events by 300ms to avoid rapid updates
    // If last value is nullish (invalid), do not emit
    this.setValue$
      .pipe(
        untilDestroyed(this),
        debounce((e) => (e.type === 'input' ? timer(300) : of({}))),
        map((e) => e.value),
        filterNullish(),
      )
      .subscribe((v) => this.setValue.emit(v));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['minimum']) {
      this.min =
        this.minimum == null ? null : Rational.fromString(this.minimum);
    }

    if (changes['maximum']) {
      this.max =
        this.maximum == null ? null : Rational.fromString(this.maximum);
    }

    if (changes['value'] || changes['minimum']) {
      if (this.min != null) {
        try {
          this.isMinimum = Rational.fromString(this.value).lte(this.min);
        } catch {
          this.isMinimum = false;
        }
      } else {
        this.isMinimum = false;
      }
    }

    if (changes['value'] || changes['maximum']) {
      if (this.max != null) {
        try {
          this.isMaximum = Rational.fromString(this.value).gte(this.max);
        } catch {
          this.isMaximum = false;
        }
      } else {
        this.isMaximum = false;
      }
    }
  }

  changeValue(value: string, type: EventType): void {
    try {
      const rational = Rational.fromString(value);
      if (
        (this.min == null || rational.gte(this.min)) &&
        (this.max == null || rational.lte(this.max))
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
      const rational = Rational.fromString(this.value);
      const newValue = rational.isInteger()
        ? rational.add(Rational.one)
        : rational.ceil();
      if (this.max == null || newValue.lte(this.max)) {
        this.setValue.emit(newValue.toString());
      }
    } catch {
      // ignore error
    }
  }

  decrease(): void {
    try {
      const rational = Rational.fromString(this.value);
      const newValue = rational.isInteger()
        ? rational.sub(Rational.one)
        : rational.floor();
      if (this.min == null || newValue.gte(this.min)) {
        this.setValue.emit(newValue.toString());
      }
    } catch {
      // ignore error
    }
  }
}
