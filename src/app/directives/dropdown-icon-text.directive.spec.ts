import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectItem } from 'primeng/api';

import { TestModule } from 'src/tests';
import { IdType } from '~/models';

@Component({
  template: `<p-dropdown
    [labDropdownIconText]="type"
    [options]="options"
    [ngModel]="value"
    (onChange)="onChange($event)"
  ></p-dropdown>`,
})
class TestDropdownIconTextDirectiveComponent {
  type: IdType | '' | undefined = 'recipe';
  options: SelectItem[] = [];
  value = null;
  onChange(data: any): void {}
}

describe('DropdownIconTextDirective', () => {
  let component: TestDropdownIconTextDirectiveComponent;
  let fixture: ComponentFixture<TestDropdownIconTextDirectiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestDropdownIconTextDirectiveComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDropdownIconTextDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
