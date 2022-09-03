import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import { Rational } from '~/models';

@Component({
  selector: 'lab-input-number',
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNumberComponent implements OnChanges {
  @Input() value = '';
  @Input() minimum = '0';
  @Input() width = '';
  @Input() inputId = 'inputnumber';
  @Input() hideButtons = false;

  @Output() setValue = new EventEmitter<string>();

  @HostBinding('class') classAttr = 'p-element p-inputwrapper';

  isMinimum = false;
  min = Rational.zero;

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

  changeValue(value: string): void {
    try {
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
