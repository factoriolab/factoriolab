import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryId, ItemId, Mocks, TestModule } from 'src/tests';
import { PickerComponent } from './picker.component';

describe('PickerComponent', () => {
  let component: PickerComponent;
  let fixture: ComponentFixture<PickerComponent>;
  let markForCheck: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PickerComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PickerComponent);
    component = fixture.componentInstance;
    const ref = fixture.debugElement.injector.get(ChangeDetectorRef);
    markForCheck = spyOn(ref.constructor.prototype, 'markForCheck');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should watch for search changes', () => {
      spyOn(component, 'inputSearch');
      component.searchCtrl.setValue('search');
      expect(component.inputSearch).toHaveBeenCalled();
    });
  });

  describe('clickOpen', () => {
    it('should open the dialog', () => {
      component.clickOpen(Mocks.Dataset, 'item', ItemId.IronPlate);
      expect(component.visible).toBeTrue();
      expect(markForCheck).toHaveBeenCalled();
    });
  });

  describe('clickId', () => {
    it('should emit the id and close the dialog', () => {
      spyOn(component.selectId, 'emit');
      component.visible = true;
      component.clickId(ItemId.IronPlate);
      expect(component.selectId.emit).toHaveBeenCalledWith(ItemId.IronPlate);
      expect(component.visible).toBeFalse();
    });
  });

  describe('inputSearch', () => {
    it('should skip if no search is specified', () => {
      component.inputSearch(null);
      expect(component.categoryIds).toEqual(Mocks.Dataset.categoryIds);
      expect(component.categoryRows).toEqual(Mocks.Dataset.categoryItemRows);
    });

    it('should search items', () => {
      component.inputSearch('petrol');
      expect(component.categoryIds.length).toEqual(2);
      expect(component.categoryRows[CategoryId.Fluids]).toEqual([
        [ItemId.PetroleumGas],
      ]);
    });
  });
});
