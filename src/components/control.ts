import { InputSignal, ModelSignal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

export abstract class Control<T = unknown> implements ControlValueAccessor {
  abstract readonly controlId: InputSignal<string>;
  abstract readonly value: ModelSignal<T | undefined>;
  abstract readonly disabled: ModelSignal<boolean>;
  abstract readonly labelledBy: InputSignal<string | undefined>;

  onFormChange?: (value: T | undefined) => void;
  onFormTouched?: () => void;

  /**
   * Override this function to provide a custom equality function for the
   * control. Calls to `writeValue` with a value equal to the current control
   * value will be skipped.
   */
  valuesEqual(a: T | undefined, b: T | undefined): boolean {
    return a === b;
  }

  setValue(value: T | null | undefined): void {
    value = value ?? undefined;
    if (this.valuesEqual(value, this.value())) return;

    this.writeValue(value);
    this.onFormChange?.(value);
  }

  writeValue(value: T | undefined): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: T | undefined) => void): void {
    this.onFormChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onFormTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }
}
