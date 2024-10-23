import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { rational } from '~/models/rational';
import { setInputs, TestModule } from '~/tests';

import { InputNumberComponent } from './input-number.component';

describe('InputNumberComponent', () => {
  let component: InputNumberComponent;
  let fixture: ComponentFixture<InputNumberComponent>;
  let emit: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, InputNumberComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputNumberComponent);
    component = fixture.componentInstance;
    setInputs(fixture, {
      value: rational(10n),
      maximum: rational(100n),
    });
    fixture.detectChanges();
    emit = spyOn(component.setValue, 'emit');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should handle incrementing values with invalid string', () => {
      component._value = 'asdf';
      setInputs(fixture, { value: rational(3n) });
      expect(component._value).toEqual('3');
    });
  });

  describe('isMinimum', () => {
    it('should handle valid/invalid text', () => {
      expect(component.isMinimum()).toBeFalse();
      setInputs(fixture, { value: 'err' });
      expect(component.isMinimum()).toBeFalse();
      setInputs(fixture, { minimum: null });
      expect(component.isMinimum()).toBeFalse();
    });
  });

  describe('isMaximum', () => {
    it('should handle valid/invalid text', () => {
      expect(component.isMaximum()).toBeFalse();
      setInputs(fixture, { value: 'err' });
      expect(component.isMaximum()).toBeFalse();
      setInputs(fixture, { maximum: null });
      expect(component.isMaximum()).toBeFalse();
    });
  });

  describe('changeValue', () => {
    it('should emit an input value', fakeAsync(() => {
      component._value = '1 1/3';
      component.changeValue('input');
      tick(500);
      expect(emit).toHaveBeenCalledWith(rational(4n, 3n));
    }));

    it('should emit a blur value', fakeAsync(() => {
      component._value = '1 1/3';
      component.changeValue('blur');
      tick(500);
      expect(emit).toHaveBeenCalledWith(rational(4n, 3n));
    }));

    it('should not emit invalid values', fakeAsync(() => {
      component._value = 'abc';
      component.changeValue('input');
      tick(500);
      expect(emit).not.toHaveBeenCalled();
    }));

    it('should simplify values when the user hits enter', fakeAsync(() => {
      component._value = '1 1/3';
      component.changeValue('enter');
      tick(500);
      expect(emit).toHaveBeenCalledWith(rational(4n, 3n));
      expect(component._value).toEqual('4/3');
    }));

    it('should round if set to integer mode', fakeAsync(() => {
      setInputs(fixture, { integer: true });
      component._value = '0.5';
      component.changeValue('input');
      tick(500);
      expect(emit).toHaveBeenCalledWith(rational.one);
    }));
  });

  describe('increase', () => {
    it('should emit a value', () => {
      component.increase();
      expect(emit).toHaveBeenCalledWith(rational(11n));
    });

    it('should round up a fractional value', () => {
      setInputs(fixture, { value: rational(3n, 2n) });
      component.increase();
      expect(emit).toHaveBeenCalledWith(rational(2n));
    });
  });

  describe('decrease', () => {
    it('should emit a value', () => {
      component.decrease();
      expect(emit).toHaveBeenCalledWith(rational(9n));
    });

    it('should round down a fractional value', () => {
      setInputs(fixture, { value: rational(3n, 2n) });
      component.decrease();
      expect(emit).toHaveBeenCalledWith(rational.one);
    });
  });
});
