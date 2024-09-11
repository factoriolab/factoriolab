import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { LabState, Recipes } from '~/store';
import { CategoryId, ItemId, Mocks, RecipeId, TestModule } from '~/tests';

import { PickerComponent } from './picker.component';

describe('PickerComponent', () => {
  let component: PickerComponent;
  let fixture: ComponentFixture<PickerComponent>;
  let mockStore: MockStore<LabState>;
  let markForCheck: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, PickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PickerComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    const ref = fixture.debugElement.injector.get(ChangeDetectorRef);
    markForCheck = spyOn(ref.constructor.prototype, 'markForCheck');
    fixture.detectChanges();
  });

  afterEach(() => {
    mockStore.resetSelectors();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('clickOpen', () => {
    it('should open the items dialog', () => {
      component.clickOpen(
        'item',
        Mocks.AdjustedDataset.itemIds,
        ItemId.IronPlate,
      );
      expect(component.visible).toBeTrue();
      expect(markForCheck).toHaveBeenCalled();
    });

    it('should open the recipes dialog', () => {
      component.clickOpen(
        'recipe',
        Mocks.AdjustedDataset.recipeIds,
        RecipeId.IronPlate,
      );
      expect(component.visible).toBeTrue();
      expect(markForCheck).toHaveBeenCalled();
    });

    it('should handle a set', () => {
      component.clickOpen(
        'item',
        Mocks.AdjustedDataset.itemIds,
        new Set([ItemId.IronPlate]),
      );
      expect(component.visible).toBeTrue();
      expect(markForCheck).toHaveBeenCalled();
    });

    it('should open as item multiselect', () => {
      component.clickOpen('item', Mocks.AdjustedDataset.itemIds, [
        ItemId.IronPlate,
      ]);
      expect(component.visible).toBeTrue();
      expect(component.isMultiselect).toBeTrue();
      expect(component.selection?.length).toEqual(1);
    });

    it('should open as recipe multiselect', () => {
      component.clickOpen('recipe', Mocks.AdjustedDataset.recipeIds, [
        RecipeId.IronPlate,
      ]);
      expect(component.visible).toBeTrue();
      expect(component.isMultiselect).toBeTrue();
      expect(component.selection?.length).toEqual(1);
    });

    it('should open as recipe multiselect with null defaults', () => {
      const data = { ...Mocks.getAdjustedDataset(), ...{ defaults: null } };
      mockStore.overrideSelector(Recipes.selectAdjustedDataset, data);
      mockStore.refreshState();
      component.clickOpen('recipe', Mocks.AdjustedDataset.recipeIds, [
        RecipeId.IronPlate,
      ]);
      expect(component.visible).toBeTrue();
      expect(component.isMultiselect).toBeTrue();
      expect(component.selection?.length).toEqual(1);
      mockStore.resetSelectors();
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
      component.clickOpen('item', Mocks.AdjustedDataset.itemIds);
    });

    it('should skip if no search is specified', () => {
      component.search = '';
      component.inputSearch();
      expect(component.categoryIds).toEqual(Mocks.AdjustedDataset.categoryIds);
      expect(component.categoryRows).toEqual(
        Mocks.AdjustedDataset.categoryItemRows,
      );
    });

    it('should search items', () => {
      component.search = 'petrol';
      component.inputSearch();
      expect(component.categoryIds.length).toEqual(1);
      expect(component.categoryRows[CategoryId.Fluids]).toEqual([
        [ItemId.PetroleumGas],
      ]);
    });
  });
});
