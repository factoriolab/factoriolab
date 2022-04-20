import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, TestUtility, ItemId } from 'src/tests';
import { DialogComponent, IconComponent } from '~/components';
import { IdType, DisplayRate, Dataset } from '~/models';
import { SelectComponent } from './select.component';
import { TranslateModule } from "@ngx-translate/core";

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
      [columns]="columns"
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
  columns: number | undefined;
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
      imports: [
        TranslateModule.forRoot(),
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

  describe('ngOnChanges', () => {
    it('should handle undefined options', () => {
      component.options = undefined;
      fixture.detectChanges();
      expect(component.child.rows).toEqual([[]]);
    });

    it('should calculate width from specified number of columns', () => {
      component.columns = 3;
      fixture.detectChanges();
      expect(component.child.width).toEqual(7.125);
    });

    it('should calculate width based on number of options', () => {
      component.options = ['1', '2', '3', '4', '5'];
      fixture.detectChanges();
      expect(component.child.width).toEqual(7.125);
    });

    it('should calculate width based maximum row size', () => {
      component.options = ['a-1', 'a-2', 'a-3', 'a-4', 'a-5', 'b-1'];
      component.includeEmptyModule = true;
      fixture.detectChanges();
      expect(component.child.width).toEqual(11.875);
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
