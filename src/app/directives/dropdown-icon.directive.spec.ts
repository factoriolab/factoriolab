import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectItem } from 'primeng/api';

import { TestModule } from 'src/tests';
import { IdType } from '~/models';

@Component({
  template: `<p-dropdown
    [labDropdownIcon]="type"
    [options]="options"
    [ngModel]="value"
    (onChange)="onChange($event)"
  ></p-dropdown>`,
})
class TestDropdownIconDirectiveComponent {
  type: IdType | '' | undefined = 'recipe';
  options: SelectItem[] = [];
  value = null;
  onChange(data: any): void {}
}

describe('DropdownIconDirective', () => {
  let component: TestDropdownIconDirectiveComponent;
  let fixture: ComponentFixture<TestDropdownIconDirectiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestDropdownIconDirectiveComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDropdownIconDirectiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
