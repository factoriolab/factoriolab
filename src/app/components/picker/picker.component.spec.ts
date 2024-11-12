import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Quality } from '~/models/enum/quality';
import { CategoryId, ItemId, Mocks, RecipeId, TestModule } from '~/tests';

import { PickerComponent } from './picker.component';

describe('PickerComponent', () => {
  let component: PickerComponent;
  let fixture: ComponentFixture<PickerComponent>;
  let markForCheck: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, PickerComponent],
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

  describe('clickOpen', () => {
    it('should open the items dialog', () => {
      component.clickOpen(
        'item',
        Mocks.adjustedDataset.itemIds,
        ItemId.IronPlate,
      );
      expect(component.visible).toBeTrue();
      expect(markForCheck).toHaveBeenCalled();
    });

    it('should open the recipes dialog', () => {
      component.clickOpen(
        'recipe',
        Mocks.adjustedDataset.recipeIds,
        RecipeId.IronPlate,
      );
      expect(component.visible).toBeTrue();
      expect(markForCheck).toHaveBeenCalled();
    });

    it('should handle a set', () => {
      component.clickOpen(
        'item',
        Mocks.adjustedDataset.itemIds,
        new Set([ItemId.IronPlate]),
      );
      expect(component.visible).toBeTrue();
      expect(markForCheck).toHaveBeenCalled();
    });

    it('should open as item multiselect', () => {
      component.clickOpen('item', Mocks.adjustedDataset.itemIds, [
        ItemId.IronPlate,
      ]);
      expect(component.visible).toBeTrue();
      expect(component.isMultiselect).toBeTrue();
      expect(component.selection?.length).toEqual(1);
    });

    it('should open as recipe multiselect', () => {
      component.clickOpen('recipe', Mocks.adjustedDataset.recipeIds, [
        RecipeId.IronPlate,
      ]);
      expect(component.visible).toBeTrue();
      expect(component.isMultiselect).toBeTrue();
      expect(component.selection?.length).toEqual(1);
    });
  });

  describe('selectAll', () => {
    it('should set the selection to empty', () => {
      component.selection = [RecipeId.AdvancedCircuit];
      component.selectAll(true);
      expect(component.selection).toEqual([]);
    });

    it('should set the selection to all', () => {
      component.selection = [];
      component.allSelectItems = [{ value: RecipeId.AdvancedCircuit }];
      component.selectAll(false);
      expect(component.selection.length).toEqual(1);
    });
  });

  describe('toggleCategory', () => {
    it('should toggle the items in the passed category', () => {
      component.clickOpen('item', Mocks.dataset.itemIds, [ItemId.Water]);
      component.toggleCategory(CategoryId.Fluids);
      expect(component.selection?.length).toEqual(8);
    });
  });

  describe('reset', () => {
    it('should set the selection back to the default value', () => {
      component.selection = [ItemId.IronPlate];
      component.default = [];
      component.reset();
      expect(component.selection).toEqual([]);
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

    it('should toggle when opened as a multiselect', () => {
      component.selection = [];
      component.clickId(RecipeId.AdvancedCircuit);
      expect(component.selection).toEqual([RecipeId.AdvancedCircuit]);
      component.clickId(RecipeId.AdvancedCircuit);
      expect(component.selection).toEqual([]);
    });
  });

  describe('onHide', () => {
    it('should emit selected ids if array', () => {
      spyOn(component.selectIds, 'emit');
      component.selection = [RecipeId.AdvancedCircuit];
      component.onHide();
      expect(component.selectIds.emit).toHaveBeenCalledWith(
        new Set([RecipeId.AdvancedCircuit]),
      );
    });
  });

  describe('inputSearch', () => {
    beforeEach(() => {
      component.clickOpen('item', Mocks.adjustedDataset.itemIds);
    });

    it('should skip if no search is specified', () => {
      spyOn(component.filterSvc, 'filter');
      component.search = '';
      component.quality = Quality.Any;
      component.inputSearch();
      expect(component.filterSvc.filter).not.toHaveBeenCalled();
    });

    it('should search items', () => {
      component.search = 'petrol';
      component.inputSearch();
      expect(component.categoryIds.length).toEqual(1);
      expect(component.categoryRows[CategoryId.Fluids]).toEqual([
        [ItemId.PetroleumGas],
      ]);
    });

    it('should search items with quality', () => {
      component.search = 'petrol';
      component.quality = Quality.Legendary;
      component.inputSearch();
      expect(component.categoryIds.length).toEqual(0);
    });
  });
});
