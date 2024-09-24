import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemId, setInputs, TestModule } from '~/tests';

import { ItemComponent } from './item.component';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    component = fixture.componentInstance;
    setInputs(fixture, {
      id: ItemId.AssemblingMachine2,
      collectionLabel: 'data.items',
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('recipes', () => {
    it('should calculate relevant recipes', () => {
      let recipes = component.recipes();
      expect(recipes.producedBy.length).toEqual(1);
      expect(recipes.consumedBy.length).toEqual(1);
      expect(recipes.producible.length).toEqual(170);
      expect(recipes.unlocked.length).toEqual(0);
      setInputs(fixture, { id: ItemId.SteelProcessing });
      recipes = component.recipes();
      expect(recipes.unlocked.length).toEqual(2);
    });
  });

  describe('changeExcluded', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      spyOn(component.settingsSvc, 'apply');
      component.changeExcluded(true);
      expect(component.settingsSvc.apply).toHaveBeenCalledWith({
        excludedItemIds: new Set([ItemId.AssemblingMachine2]),
      });
    });
  });

  describe('changeChecked', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      spyOn(component.settingsSvc, 'apply');
      component.changeChecked(true);
      expect(component.settingsSvc.apply).toHaveBeenCalledWith({
        checkedItemIds: new Set([ItemId.AssemblingMachine2]),
      });
    });
  });
});
