import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectItem } from 'primeng/api';

import { TestModule } from 'src/tests';

@Component({
  template: `<p-dropdown
      labDropdownBase
      [options]="options"
      [ngModel]="value"
      (onChange)="onChange($event)"
    ></p-dropdown
    ><lab-content></lab-content>`,
})
class TestDropdownBaseDirectiveComponent {
  options: SelectItem[] = [];
  value = null;
  onChange(_: unknown): void {}
}

describe('DropdownBaseDirective', () => {
  let component: TestDropdownBaseDirectiveComponent;
  let fixture: ComponentFixture<TestDropdownBaseDirectiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestDropdownBaseDirectiveComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDropdownBaseDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
