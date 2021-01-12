import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestUtility, ItemId } from 'src/tests';
import { DialogComponent, IconComponent } from '~/components';
import { IdType, DisplayRate, Dataset } from '~/models';
import { SelectComponent } from './select.component';

enum DataTest {
  Open = 'lab-select-open',
  None = 'lab-select-none',
  Option = 'lab-select-option',
}

@Component({
  selector: 'lab-test-select',
  template: `
    <lab-select
      [data]="data"
      [selected]="selected"
      [options]="options"
      [selectType]="selectType"
      [displayRate]="displayRate"
      [includeEmptyModule]="includeEmptyModule"
      (selectId)="selectId($event)"
    >
    </lab-select>
  `,
})
class TestSelectComponent {
  @ViewChild(SelectComponent) child: SelectComponent;
  data: Dataset = Mocks.Data;
  selected = ItemId.AssemblingMachine1;
  options: string[] = [
    ItemId.AssemblingMachine1,
    ItemId.AssemblingMachine2,
    ItemId.AssemblingMachine3,
  ];
  selectType = IdType.Item;
  displayRate = DisplayRate.PerMinute;
  includeEmptyModule = false;
  selectId(data): void {}
}

describe('SelectComponent', () => {
  let component: TestSelectComponent;
  let fixture: ComponentFixture<TestSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DialogComponent,
        IconComponent,
        SelectComponent,
        TestSelectComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('width', () => {
    it('should make room for all options when <= 4', () => {
      expect(component.child.width).toEqual(11);
    });

    it('should calculate based on number of options', () => {
      component.options = ['1', '2', '3', '4', '5'];
      fixture.detectChanges();
      expect(component.child.width).toEqual(8.625);
    });
  });

  describe('clickId', () => {
    it('should emit the selection', () => {
      spyOn(component, 'selectId');
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
      TestUtility.clickDt(fixture, DataTest.Option);
      expect(component.selectId).toHaveBeenCalledWith(
        ItemId.AssemblingMachine1
      );
      expect(component.child.open).toBeFalse();
    });
  });
});
