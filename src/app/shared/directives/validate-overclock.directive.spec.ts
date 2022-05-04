import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { TestUtility } from 'src/tests';
import { ValidateOverclockDirective } from './';

enum DataTest {
  Input = 'lab-validate-overclock-input',
}

@Component({
  template: `<input
    #input
    labValidateOverclock
    [(ngModel)]="model"
    data-test="lab-validate-overclock-input"
  />`,
})
class TestValidateOverclockDirectiveComponent {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  model = null;
}

describe('ValidateOverclockDirective', () => {
  let component: TestValidateOverclockDirectiveComponent;
  let fixture: ComponentFixture<TestValidateOverclockDirectiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ValidateOverclockDirective,
        TestValidateOverclockDirectiveComponent,
      ],
      imports: [FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestValidateOverclockDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('validate', () => {
    it('should validate null value', () => {
      expect(
        component.input.nativeElement.classList.contains('ng-invalid')
      ).toBeFalse();
    });

    it('should validate a valid overclock', () => {
      TestUtility.setTextDt(fixture, DataTest.Input, '200');
      fixture.detectChanges();
      expect(
        component.input.nativeElement.classList.contains('ng-invalid')
      ).toBeFalse();
    });

    it('should validate invalid value', () => {
      TestUtility.setTextDt(fixture, DataTest.Input, '251');
      fixture.detectChanges();
      expect(
        component.input.nativeElement.classList.contains('ng-invalid')
      ).toBeTrue();
    });
  });
});
