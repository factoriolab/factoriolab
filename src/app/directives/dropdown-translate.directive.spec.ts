import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectItem } from 'primeng/api';

import { TestModule } from 'src/tests';

@Component({
  template: `<p-dropdown
      labDropdownTranslate
      [options]="options"
      [ngModel]="value"
      (onChange)="onChange($event)"
    ></p-dropdown
    ><lab-content></lab-content>`,
})
class TestDropdownTranslateDirectiveComponent {
  options: SelectItem[] = [];
  value = null;
  onChange(_: unknown): void {}
}

describe('DropdownTranslateDirective', () => {
  let component: TestDropdownTranslateDirectiveComponent;
  let fixture: ComponentFixture<TestDropdownTranslateDirectiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestDropdownTranslateDirectiveComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDropdownTranslateDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
