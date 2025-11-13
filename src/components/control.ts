import {
  InjectionToken,
  InputSignal,
  ModelSignal,
  signal,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

export const LAB_CONTROL = new InjectionToken<Control>('LAB_CONTROL');

export abstract class Control<T = unknown> implements ControlValueAccessor {
  abstract readonly controlId: InputSignal<string>;
  abstract readonly value: ModelSignal<T | undefined>;
  abstract readonly disabled: ModelSignal<boolean>;
  abstract readonly labelledBy: InputSignal<string | undefined>;

  readonly touched = signal(false);
  onFormChange?: (value: T) => void;
  onFormTouched?: () => void;

  /**
   * Override this function to provide a custom equality function for the
   * control. Calls to `setValue` with a value equal to the current control
   * value will be skipped.
   */
  valuesEqual(a: T, b: T | undefined): boolean {
    return a === b;
  }

  setValue(value: T): void {
    this.markAsTouched();
    if (this.valuesEqual(value, this.value())) return;

    this.writeValue(value);
    this.onFormChange?.(value);
  }

  markAsTouched(): void {
    if (this.touched()) return;
    this.touched.set(true);
    this.onFormTouched?.();
  }

  writeValue(value: T): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onFormChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onFormTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }
}
