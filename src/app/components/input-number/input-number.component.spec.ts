import { Component, ViewChild } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { TestModule } from 'src/tests';
import { InputNumberComponent } from './input-number.component';

@Component({
  selector: 'lab-test-input',
  template: `<lab-input-number
    [value]="value"
    [minimum]="minimum"
    [width]="width"
    [inputId]="inputId"
    (setValue)="setValue($event)"
  ></lab-input-number>`,
})
class TestInputNumberComponent {
  @ViewChild(InputNumberComponent) child!: InputNumberComponent;
  value = '10';
  minimum = '1';
  width = '';
  inputId = '';
  setValue(_: string): void {}
}

describe('InputNumberComponent', () => {
  let component: TestInputNumberComponent;
  let fixture: ComponentFixture<TestInputNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputNumberComponent, TestInputNumberComponent],
      imports: [TestModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestInputNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should handle changes to minimum', () => {
      component.minimum = '10';
      fixture.detectChanges();
      expect(component.child.isMinimum).toBeTrue();
    });

    it('should handle invalid values', () => {
      component.value = 'err';
      fixture.detectChanges();
      expect(component.child.isMinimum).toBeFalse();
    });
  });

  describe('changeValue', () => {
    it('should emit an input value', fakeAsync(() => {
      spyOn(component, 'setValue');
      component.child.changeValue('1 1/3', 'input');
      tick(500);
      expect(component.setValue).toHaveBeenCalledWith('1 1/3');
    }));

    it('should emit a blur value', fakeAsync(() => {
      spyOn(component, 'setValue');
      component.child.changeValue('1 1/3', 'blur');
      tick(500);
      expect(component.setValue).toHaveBeenCalledWith('1 1/3');
    }));

    it('should not emit invalid values', fakeAsync(() => {
      spyOn(component, 'setValue');
      component.child.changeValue('abc', 'input');
      tick(500);
      expect(component.setValue).not.toHaveBeenCalled();
    }));
  });

  describe('increase', () => {
    it('should emit a value', () => {
      spyOn(component, 'setValue');
      component.child.increase();
      expect(component.setValue).toHaveBeenCalledWith('11');
    });

    it('should round up a fractional value', () => {
      component.value = '1.5';
      fixture.detectChanges();
      spyOn(component, 'setValue');
      component.child.increase();
      expect(component.setValue).toHaveBeenCalledWith('2');
    });
  });

  describe('decrease', () => {
    it('should emit a value', () => {
      spyOn(component, 'setValue');
      component.child.decrease();
      expect(component.setValue).toHaveBeenCalledWith('9');
    });

    it('should round down a fractional value', () => {
      component.value = '1.5';
      fixture.detectChanges();
      spyOn(component, 'setValue');
      component.child.decrease();
      expect(component.setValue).toHaveBeenCalledWith('1');
    });
  });
});
