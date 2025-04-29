import { Component, model } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

import { Optional } from '~/models/utils';

@Component({ template: '' })
export class FormComponent<T> implements ControlValueAccessor {
  value = model<T>();
  disabled = model(false);

  onFormChange?: (value: T) => void;
  onFormTouched?: () => void;

  setValue(value: T): void {
    this.onFormTouched?.();
    if (value === this.value()) return;
    this.writeValue(value);
    this.onFormChange?.(value);
  }

  writeValue(value: Optional<T>): void {
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
