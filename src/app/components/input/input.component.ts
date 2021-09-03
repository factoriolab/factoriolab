import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { Rational } from '~/models';

@Component({
  selector: 'lab-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements OnChanges {
  static widthCache: { [x: number]: number } = {};

  @Input() title: string;
  @Input() placeholder: string;
  @Input() value: string;
  @Input() set minimum(value: string) {
    this.min = Rational.fromString(value);
  }
  @Input() set digits(value: number) {
    if (InputComponent.widthCache[value]) {
      this.width = InputComponent.widthCache[value];
    } else {
      this.width = 0.75 + value * 0.625;
      InputComponent.widthCache[value] = this.width;
    }
  }

  @Output() setValue = new EventEmitter<string>();

  width: number;
  min = Rational.zero;
  isMinimum = false;

  constructor() {}

  ngOnChanges(): void {
    this.isMinimum = Rational.fromString(this.value).eq(this.min);
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
