import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { TestModule, TestUtility } from 'src/tests';
import { rational } from '~/models';
import { InputNumberComponent } from './input-number.component';

describe('InputNumberComponent', () => {
  let component: InputNumberComponent;
  let fixture: ComponentFixture<InputNumberComponent>;
  let emit: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputNumberComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InputNumberComponent);
    component = fixture.componentInstance;
    TestUtility.setInputs(fixture, {
      value: rational(10n),
      maximum: rational(100n),
    });
    fixture.detectChanges();
    emit = spyOn(component.setValue, 'emit');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isMinimum', () => {
    it('should handle valid/invalid text', () => {
      expect(component.isMinimum()).toBeFalse();
      TestUtility.setInputs(fixture, { value: 'err' });
      expect(component.isMinimum()).toBeFalse();
      TestUtility.setInputs(fixture, { minimum: null });
      expect(component.isMinimum()).toBeFalse();
    });
  });

  describe('isMaximum', () => {
    it('should handle valid/invalid text', () => {
      expect(component.isMaximum()).toBeFalse();
      TestUtility.setInputs(fixture, { value: 'err' });
      expect(component.isMaximum()).toBeFalse();
      TestUtility.setInputs(fixture, { maximum: null });
      expect(component.isMaximum()).toBeFalse();
    });
  });

  describe('changeValue', () => {
    it('should emit an input value', fakeAsync(() => {
      component.changeValue('1 1/3', 'input');
      tick(500);
      expect(emit).toHaveBeenCalledWith(rational(4n, 3n));
    }));

    it('should emit a blur value', fakeAsync(() => {
      component.changeValue('1 1/3', 'blur');
      tick(500);
      expect(emit).toHaveBeenCalledWith(rational(4n, 3n));
    }));

    it('should not emit invalid values', fakeAsync(() => {
      component.changeValue('abc', 'input');
      tick(500);
      expect(emit).not.toHaveBeenCalled();
    }));
  });

  describe('increase', () => {
    it('should emit a value', () => {
      component.increase();
      expect(emit).toHaveBeenCalledWith(rational(11n));
    });

    it('should round up a fractional value', () => {
      TestUtility.setInputs(fixture, { value: rational(3n, 2n) });
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
      TestUtility.setInputs(fixture, { value: rational(3n, 2n) });
      component.decrease();
      expect(emit).toHaveBeenCalledWith(rational(1n));
    });
  });
});
