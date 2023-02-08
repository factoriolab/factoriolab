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

type EventType = 'input' | 'blur';

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
  @Input() minimum = '0';
  @Input() width = '';
  @Input() inputId = 'inputnumber';
  @Input() hideButtons = false;
  @Input() textButtons = false;
  @Input() debounceTime = 300;

  @Output() setValue = new EventEmitter<string>();

  @HostBinding('class') classAttr = 'p-element p-inputwrapper';

  setValue$ = new Subject<Event>();
  isMinimum = false;
  min = Rational.zero;

  ngOnInit(): void {
    // Watch for all value changes to input field
    // Debounce to avoid rapid updates
    // If last value is nullish (invalid), do not emit
    this.setValue$
      .pipe(
        untilDestroyed(this),
        debounce((e) => (e.type === 'input' ? timer(300) : of({}))),
        map((e) => e.value),
        filterNullish()
      )
      .subscribe((v) => this.setValue.emit(v));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['minimum']) {
      this.min = Rational.fromString(this.minimum);
    }
    if (changes['value'] || changes['minimum']) {
      try {
        this.isMinimum = Rational.fromString(this.value).lte(this.min);
      } catch {
        this.isMinimum = false;
      }
    }
  }

  changeValue(value: string, type: EventType): void {
    try {
      const rational = Rational.fromString(value);
      if (rational.gte(this.min)) {
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
      this.setValue.emit(newValue.toString());
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
      if (newValue.gte(this.min)) {
        this.setValue.emit(newValue.toString());
      }
    } catch {
      // ignore error
    }
  }
}
