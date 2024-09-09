import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { DispatchTest, RecipeId, TestModule, TestUtility } from 'src/tests';

import { LabState, Recipes, Settings } from '~/store';

import { RecipeComponent } from './recipe.component';

describe('RecipeComponent', () => {
  let component: RecipeComponent;
  let fixture: ComponentFixture<RecipeComponent>;
  let mockStore: MockStore<LabState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, RecipeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeComponent);
    mockStore = TestBed.inject(MockStore);
    component = fixture.componentInstance;
    TestUtility.setInputs(fixture, {
      id: RecipeId.NuclearFuelReprocessing,
      collectionLabel: 'data.recipes',
    });
  });

  afterEach(() => mockStore.resetSelectors());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('info', () => {
    it('should handle undefined recipe', () => {
      TestUtility.setInputs(fixture, { id: 'not-found' });
      const info = component.info();
      expect(info.category).toBeUndefined();
      expect(info.ingredientIds).toEqual([]);
      expect(info.catalystIds).toEqual([]);
      expect(info.productIds).toEqual([]);
    });
  });

  describe('changeExcluded', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      spyOn(component, 'setExcludedRecipes');
      component.changeExcluded(false);
      expect(component.setExcludedRecipes).toHaveBeenCalledWith(
        new Set(),
        new Set([RecipeId.NuclearFuelReprocessing]),
      );
    });
  });

  describe('changeChecked', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      spyOn(component, 'setCheckedRecipes');
      component.changeChecked(true);
      expect(component.setCheckedRecipes).toHaveBeenCalledWith(
        new Set([RecipeId.NuclearFuelReprocessing]),
      );
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.props('setExcludedRecipes', Settings.setExcludedRecipes);
    dispatch.props('setCheckedRecipes', Settings.setCheckedRecipes);
    dispatch.props('setRecipeCost', Recipes.setCost);
    dispatch.props('resetRecipe', Recipes.resetRecipe);
  });
});
