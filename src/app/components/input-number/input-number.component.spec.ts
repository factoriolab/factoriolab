import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { TestModule, TestUtility } from 'src/tests';
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
    TestUtility.setInputs(fixture, { value: '10', maximum: '100' });
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

  // describe('changeValue', () => {
  //   it('should emit an input value', fakeAsync(() => {
  //     component.changeValue('1 1/3', 'input');
  //     tick(500);
  //     expect(emit).toHaveBeenCalledWith('1 1/3');
  //   }));

  //   it('should emit a blur value', fakeAsync(() => {
  //     component.changeValue('1 1/3', 'blur');
  //     tick(500);
  //     expect(emit).toHaveBeenCalledWith('4/3');
  //   }));

  //   it('should not emit invalid values', fakeAsync(() => {
  //     component.changeValue('abc', 'input');
  //     tick(500);
  //     expect(emit).not.toHaveBeenCalled();
  //   }));
  // });

  // describe('increase', () => {
  //   it('should emit a value', () => {
  //     component.increase();
  //     expect(emit).toHaveBeenCalledWith('11');
  //   });

  //   it('should round up a fractional value', () => {
  //     TestUtility.setInputs(fixture, { value: '1.5' });
  //     component.increase();
  //     expect(emit).toHaveBeenCalledWith('2');
  //   });
  // });

  // describe('decrease', () => {
  //   it('should emit a value', () => {
  //     component.decrease();
  //     expect(emit).toHaveBeenCalledWith('9');
  //   });

  //   it('should round down a fractional value', () => {
  //     TestUtility.setInputs(fixture, { value: '1.5' });
  //     component.decrease();
  //     expect(emit).toHaveBeenCalledWith('1');
  //   });
  // });
});
