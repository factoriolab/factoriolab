import { ViewChild, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Mocks, CategoryId, ItemId } from 'src/tests';
import { Dataset } from '~/models';
import { IconComponent } from '../icon/icon.component';
import { PickerComponent } from './picker.component';

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
      declarations: [IconComponent, PickerComponent, TestPickerComponent],
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
});
