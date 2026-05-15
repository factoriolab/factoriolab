import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemId } from '~/tests/item-id';
import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { ItemDetail } from './item-detail';

describe('ItemDetail', () => {
  let component: ItemDetail;
  let fixture: ComponentFixture<ItemDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ItemDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetail);
    setInputs(fixture, {
      id: ItemId.AssemblingMachine2,
      collectionLabel: 'data.items',
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('category', () => {
    it('should handle missing object', () => {
      setInputs(fixture, { id: 'id' });
      expect(component['category']()).toBeUndefined();
    });
  });

  describe('recipes', () => {
    it('should calculate relevant recipes', () => {
      let recipes = component['recipes']();
      expect(recipes.producedBy.length).toEqual(1);
      expect(recipes.consumedBy.length).toEqual(1);
      expect(recipes.producible.length).toEqual(170);
      expect(recipes.unlocked).toBeUndefined();
      setInputs(fixture, { id: ItemId.SteelProcessing });
      recipes = component['recipes']();
      expect(recipes.unlocked?.length).toEqual(2);
    });
  });

  describe('changeExcluded', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      vi.spyOn(component['settingsStore'], 'apply');
      component.changeExcluded(true);
      expect(component['settingsStore'].apply).toHaveBeenCalledWith({
        excludedItemIds: new Set([ItemId.AssemblingMachine2]),
      });
    });
  });

  describe('changeChecked', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      vi.spyOn(component['settingsStore'], 'apply');
      component.changeChecked(true);
      expect(component['settingsStore'].apply).toHaveBeenCalledWith({
        checkedItemIds: new Set([ItemId.AssemblingMachine2]),
      });
    });
  });
});
