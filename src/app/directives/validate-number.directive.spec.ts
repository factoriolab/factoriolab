import { Component, viewChild } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';

import { rational } from '~/models/rational';

import { ValidateNumberDirective } from './validate-number.directive';

@Component({
  standalone: true,
  imports: [FormsModule, ValidateNumberDirective],
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
  model?: string;
  minimum = rational.one;
}

describe('ValidateNumberDirective', () => {
  let component: TestValidateNumberDirectiveComponent;
  let fixture: ComponentFixture<TestValidateNumberDirectiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestValidateNumberDirectiveComponent],
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
      component.model = '4/3';
      fixture.detectChanges();
      tick();
      expect(component.frm().valid).toBeTrue();
    }));

    it('should invalidate value below minimum value', fakeAsync(() => {
      component.model = '0';
      fixture.detectChanges();
      tick();
      expect(component.frm().valid).toBeFalse();
    }));
  });
});
