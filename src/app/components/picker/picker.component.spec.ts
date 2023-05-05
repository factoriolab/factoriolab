import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryId, ItemId, Mocks, RecipeId, TestModule } from 'src/tests';
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
    it('should open the products dialog', () => {
      component.clickOpen(
        Mocks.Dataset,
        'item',
        Mocks.Dataset.itemIds,
        ItemId.IronPlate
      );
      expect(component.visible).toBeTrue();
      expect(markForCheck).toHaveBeenCalled();
    });

    it('should open the producers dialog', () => {
      component.clickOpen(
        Mocks.Dataset,
        'recipe',
        Mocks.Dataset.recipeIds,
        RecipeId.IronPlate
      );
      expect(component.visible).toBeTrue();
      expect(markForCheck).toHaveBeenCalled();
    });

    it('should open as multiselect', () => {
      component.clickOpen(Mocks.Dataset, 'recipe', Mocks.Dataset.recipeIds, [
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
      expect(component.selectIds.emit).toHaveBeenCalledWith([
        RecipeId.AdvancedCircuit,
      ]);
    });
  });

  describe('inputSearch', () => {
    beforeEach(() => {
      component.clickOpen(Mocks.Dataset, 'item', Mocks.Dataset.itemIds);
    });

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
