import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Control } from '../control';
import { InputNumber } from '../input-number/input-number';
import { FormField } from './form-field';

@Component({
  template: `
    <lab-form-field #component label="label">
      <lab-input-number></lab-input-number>
    </lab-form-field>
  `,
  imports: [FormField, InputNumber],
})
class TestFormField {
  component = viewChild.required(FormField);
}

describe('FormField', () => {
  let component: TestFormField;
  let fixture: ComponentFixture<TestFormField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestFormField],
      providers: [{ provide: Control, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestFormField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
