import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import { Rational } from '~/models';

@Component({
  selector: 'lab-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements OnChanges {
  @Input() title = '';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() minimum = '0';
  @Input() digits = 2;

  @Output() setValue = new EventEmitter<string>();

  isMinimum = false;
  min = Rational.zero;
  width = 5;

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
    if (changes['digits']) {
      this.width = 0.75 + this.digits * 0.625;
    }
  }

  changeValue(event: Event): void {
    try {
      const target = event.target as HTMLInputElement;
      const value = target.value;
      const rational = Rational.fromString(value);
      if (rational.gte(this.min)) {
        this.setValue.emit(value);
      }
    } catch {}
  }

  increase(): void {
    try {
      const rational = Rational.fromString(this.value);
      const newValue = rational.isInteger()
        ? rational.add(Rational.one)
        : rational.ceil();
      this.setValue.emit(newValue.toString());
    } catch {}
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
    } catch {}
  }
}
