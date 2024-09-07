import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, ItemId, TestModule, TestUtility } from 'src/tests';
import { Items, LabState, Machines, Settings } from '~/store';
import { ItemComponent } from './item.component';

describe('ItemComponent', () => {
  let component: ItemComponent;
  let fixture: ComponentFixture<ItemComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    TestUtility.setInputs(fixture, {
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
      TestUtility.setInputs(fixture, { id: ItemId.SteelProcessing });
      recipes = component.recipes();
      expect(recipes.unlocked.length).toEqual(2);
    });
  });

  describe('changeExcluded', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      spyOn(component, 'setExcludedItems');
      component.changeExcluded(true);
      expect(component.setExcludedItems).toHaveBeenCalledWith(
        new Set([ItemId.AssemblingMachine2]),
      );
    });
  });

  describe('changeChecked', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      spyOn(component, 'setCheckedItems');
      component.changeChecked(true);
      expect(component.setCheckedItems).toHaveBeenCalledWith(
        new Set([ItemId.AssemblingMachine2]),
      );
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.props('setExcludedItems', Settings.setExcludedItems);
    dispatch.props('setCheckedItems', Settings.setCheckedItems);
    dispatch.props('resetItem', Items.resetItem);
    dispatch.props('resetMachine', Machines.resetMachine);
  });
});
