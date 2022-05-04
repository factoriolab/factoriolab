import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { TestUtility } from 'src/tests';
import { ValidateNumberDirective } from './';

enum DataTest {
  Input = 'lab-validate-number-input',
}

@Component({
  template: `<input
    #input
    labValidateNumber
    [labValidateMinimum]="labValidateMinimum"
    [(ngModel)]="model"
    data-test="lab-validate-number-input"
  />`,
})
class TestValidateNumberDirectiveComponent {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  model = null;
  labValidateMinimum = '1';
}

describe('ValidateNumberDirective', () => {
  let component: TestValidateNumberDirectiveComponent;
  let fixture: ComponentFixture<TestValidateNumberDirectiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ValidateNumberDirective,
        TestValidateNumberDirectiveComponent,
      ],
      imports: [FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestValidateNumberDirectiveComponent);
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

    it('should validate a valid number', () => {
      TestUtility.setTextDt(fixture, DataTest.Input, '1 1/3');
      fixture.detectChanges();
      expect(
        component.input.nativeElement.classList.contains('ng-invalid')
      ).toBeFalse();
    });

    it('should validate invalid value', () => {
      TestUtility.setTextDt(fixture, DataTest.Input, '1 1');
      fixture.detectChanges();
      expect(
        component.input.nativeElement.classList.contains('ng-invalid')
      ).toBeTrue();
    });

    it('should validate value below minimum value', () => {
      TestUtility.setTextDt(fixture, DataTest.Input, '0');
      fixture.detectChanges();
      expect(
        component.input.nativeElement.classList.contains('ng-invalid')
      ).toBeTrue();
    });
  });
});
