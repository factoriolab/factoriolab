import { ViewChild, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';

import {
  Mocks,
  CategoryId,
  ItemId,
  TestUtility,
  initialState,
} from 'src/tests';
import { Dataset } from '~/models';
import { DialogComponent } from '../dialog/dialog.component';
import { IconComponent } from '../icon/icon.component';
import { PickerComponent } from './picker.component';

enum DataTest {
  Open = 'lab-picker-open',
  Search = 'lab-picker-search',
  SearchValue = 'lab-picker-search-value',
}

@Component({
  selector: 'lab-test-picker',
  template: `
    <lab-picker
      [data]="data"
      [selected]="selected"
      (selectId)="selectId($event)"
    ></lab-picker>
  `,
})
class TestPickerComponent {
  @ViewChild(PickerComponent) child: PickerComponent;
  data: Dataset = Mocks.Data;
  selected: string = null;
  cancel(): void {}
  selectTab(data): void {}
  selectId(data): void {}
}

describe('PickerComponent', () => {
  let component: TestPickerComponent;
  let fixture: ComponentFixture<TestPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        IconComponent,
        DialogComponent,
        PickerComponent,
        TestPickerComponent,
      ],
      imports: [FormsModule],
      providers: [provideMockStore({ initialState })],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('clickOpen', () => {
    it('should set up the dialog', () => {
      component.child.search = true;
      component.child.searchValue = 'test';
      TestUtility.clickDt(fixture, DataTest.Open);
      expect(component.child.open).toBeTrue();
      expect(component.child.search).toBeFalse();
      expect(component.child.searchValue).toBe('');
      expect(component.child.categoryIds).toEqual(component.data.categoryIds);
      expect(component.child.categoryItemRows).toEqual(
        component.data.categoryItemRows
      );
    });
  });

  describe('setTab', () => {
    it('should do nothing if data is falsy', () => {
      component.child.tab = null;
      component.data = null;
      fixture.detectChanges();
      expect(component.child.tab).toBeNull();
    });

    it('should set to first category if selected is falsy', () => {
      component.selected = null;
      fixture.detectChanges();
      expect(component.child.tab).toEqual(CategoryId.Logistics);
    });

    it('should set to a matching category', () => {
      component.selected = ItemId.CopperCable;
      fixture.detectChanges();
      expect(component.child.tab).toEqual(CategoryId.Intermediate);
    });
  });

  describe('inputSearch', () => {
    beforeEach(() => {
      TestUtility.clickDt(fixture, DataTest.Open);
      fixture.detectChanges();
      TestUtility.clickDt(fixture, DataTest.Search);
      fixture.detectChanges();
    });

    it('should filter out matching items and categories', () => {
      TestUtility.setTextDt(fixture, DataTest.SearchValue, 'module speed');
      expect(component.child.tab).toEqual(CategoryId.Production);
      expect(component.child.categoryIds).toEqual([CategoryId.Production]);
      expect(component.child.categoryItemRows[CategoryId.Production]).toEqual([
        [ItemId.SpeedModule, ItemId.SpeedModule2, ItemId.SpeedModule3],
      ]);
    });

    it('should persist matching category', () => {
      component.child.tab = CategoryId.Research;
      TestUtility.setTextDt(fixture, DataTest.SearchValue, 'speed');
      expect(component.child.tab).toEqual(CategoryId.Research);
    });
  });
});
