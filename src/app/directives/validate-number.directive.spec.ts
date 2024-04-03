import { Component, viewChild } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';

import { Rational, rational } from '~/models';
import { ValidateNumberDirective } from './validate-number.directive';

@Component({
  template: `<form #frm="ngForm">
    <input
      labValidateNumber
      [minimum]="minimum"
      [(ngModel)]="model"
      name="value"
    />
  </form>`,
})
class TestValidateNumberDirectiveComponent {
  frm = viewChild.required<NgForm>('frm');
  model: Rational | null = null;
  minimum = rational(1n);
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

    fixture = TestBed.createComponent(TestValidateNumberDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('validate', () => {
    it('should validate null value', () => {
      expect(component.frm().valid).toBeTrue();
    });

    it('should validate a valid number', fakeAsync(() => {
      component.model = rational(4n, 3n);
      fixture.detectChanges();
      tick();
      expect(component.frm().valid).toBeTrue();
    }));

    it('should invalidate value below minimum value', fakeAsync(() => {
      component.model = rational(0n);
      fixture.detectChanges();
      tick();
      expect(component.frm().valid).toBeFalse();
    }));
  });
});
