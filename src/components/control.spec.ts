import { Directive, input, model } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Control } from './control';

@Directive()
class TestControl extends Control<number> {
  controlId = input('');
  value = model<number>();
  disabled = model(false);
  labelledBy = input<string>();
}

describe('Control', () => {
  let control: TestControl;

  beforeEach(() => {
    TestBed.runInInjectionContext(() => {
      control = new TestControl();
    });
  });

  describe('valuesEqual', () => {
    it('should compare values by equality', () => {
      expect(control.valuesEqual(1, 2)).toBeFalse();
      expect(control.valuesEqual(1, 1)).toBeTrue();
    });
  });

  describe('setValue', () => {
    it('should call to writeValue', () => {
      spyOn(control, 'writeValue');
      control.setValue(1);
      expect(control.writeValue).toHaveBeenCalledWith(1);
    });

    it('should fall back to undefined', () => {
      control.setValue(1);
      spyOn(control, 'writeValue');
      control.setValue(null);
      expect(control.writeValue).toHaveBeenCalledWith(undefined);
    });

    it('should skip repeat values', () => {
      control.setValue(1);
      spyOn(control, 'writeValue');
      control.setValue(1);
      expect(control.writeValue).not.toHaveBeenCalled();
    });
  });

  describe('writeValue', () => {
    it('should set the form value', () => {
      control.writeValue(1);
      expect(control.value()).toEqual(1);
    });
  });
});
