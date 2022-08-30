import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestModule } from 'src/tests';
import { InputNumberComponent } from './input-number.component';

@Component({
  selector: 'lab-test-input',
  template: `<lab-input-number
    [title]="title"
    [placeholder]="placeholder"
    [value]="value"
    [minimum]="minimum"
    [digits]="digits"
    (setValue)="setValue($event)"
  ></lab-input-number>`,
})
class TestInputNumberComponent {
  @ViewChild(InputNumberComponent) child!: InputNumberComponent;
  title = 'title';
  placeholder = 'placeholder';
  value = '10';
  minimum = '1';
  digits = '2';
  setValue(data: string): void {}
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

  // describe('ngOnChanges', () => {
  //   it('should handle changes to minimum', () => {
  //     component.minimum = '10';
  //     fixture.detectChanges();
  //     expect(component.child.isMinimum).toBeTrue();
  //   });
  // });

  // describe('changeValue', () => {
  //   it('should emit a valid value', () => {
  //     spyOn(component, 'setValue');
  //     TestUtility.setTextDt(fixture, DataTest.Input, '1 1/3');
  //     fixture.detectChanges();
  //     expect(component.setValue).toHaveBeenCalledWith('1 1/3');
  //   });

  //   it('should ignore invalid events', () => {
  //     spyOn(component, 'setValue');
  //     TestUtility.setTextDt(fixture, DataTest.Input, '1 1');
  //     fixture.detectChanges();
  //     expect(component.setValue).not.toHaveBeenCalled();
  //   });

  //   it('should ignore negative rates', () => {
  //     spyOn(component, 'setValue');
  //     TestUtility.setTextDt(fixture, DataTest.Input, '-1');
  //     fixture.detectChanges();
  //     expect(component.setValue).not.toHaveBeenCalled();
  //   });
  // });

  // describe('increase', () => {
  //   it('should emit a valid value', () => {
  //     spyOn(component, 'setValue');
  //     TestUtility.clickDt(fixture, DataTest.Increase);
  //     fixture.detectChanges();
  //     expect(component.setValue).toHaveBeenCalledWith('11');
  //   });

  //   it('should ignore invalid events', () => {
  //     component.value = '1 1';
  //     fixture.detectChanges();
  //     spyOn(component, 'setValue');
  //     TestUtility.clickDt(fixture, DataTest.Increase);
  //     fixture.detectChanges();
  //     expect(component.setValue).not.toHaveBeenCalled();
  //   });

  //   it('should round up a fractional value', () => {
  //     component.value = '1.5';
  //     fixture.detectChanges();
  //     spyOn(component, 'setValue');
  //     TestUtility.clickDt(fixture, DataTest.Increase);
  //     fixture.detectChanges();
  //     expect(component.setValue).toHaveBeenCalledWith('2');
  //   });
  // });

  // describe('decrease', () => {
  //   it('should emit a valid value', () => {
  //     spyOn(component, 'setValue');
  //     TestUtility.clickDt(fixture, DataTest.Decrease);
  //     fixture.detectChanges();
  //     expect(component.setValue).toHaveBeenCalledWith('9');
  //   });

  //   it('should ignore invalid events', () => {
  //     component.value = '1 1';
  //     fixture.detectChanges();
  //     spyOn(component, 'setValue');
  //     TestUtility.clickDt(fixture, DataTest.Decrease);
  //     fixture.detectChanges();
  //     expect(component.setValue).not.toHaveBeenCalled();
  //   });

  //   it('should round down a fractional value', () => {
  //     component.value = '1.5';
  //     fixture.detectChanges();
  //     spyOn(component, 'setValue');
  //     TestUtility.clickDt(fixture, DataTest.Decrease);
  //     fixture.detectChanges();
  //     expect(component.setValue).toHaveBeenCalledWith('1');
  //   });

  //   it('should not decrease below minimum (click)', () => {
  //     component.value = '1';
  //     fixture.detectChanges();
  //     spyOn(component.child, 'decrease');
  //     TestUtility.clickDt(fixture, DataTest.Decrease);
  //     fixture.detectChanges();
  //     expect(component.child.decrease).not.toHaveBeenCalled();
  //   });

  //   it('should not decrease below minimum (function)', () => {
  //     component.value = '1';
  //     fixture.detectChanges();
  //     spyOn(component, 'setValue');
  //     component.child.decrease();
  //     fixture.detectChanges();
  //     expect(component.setValue).not.toHaveBeenCalled();
  //   });
  // });
});
