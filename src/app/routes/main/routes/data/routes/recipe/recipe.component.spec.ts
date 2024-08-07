import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import {
  DispatchTest,
  Mocks,
  RecipeId,
  TestModule,
  TestUtility,
} from 'src/tests';
import { LabState, Recipes } from '~/store';
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

  describe('toggleRecipe', () => {
    it('should handle an unrecognized recipe', () => {
      spyOn(component, 'setRecipeExcluded');
      TestUtility.setInputs(fixture, { id: 'id' });
      component.toggleRecipe();
      expect(component.setRecipeExcluded).not.toHaveBeenCalled();
    });

    it('should calculate default excluded state for a recipe', () => {
      spyOn(component, 'setRecipeExcluded');
      component.toggleRecipe();
      expect(component.setRecipeExcluded).toHaveBeenCalledWith(
        RecipeId.NuclearFuelReprocessing,
        false,
        true,
      );
    });

    it('should default to empty excluded recipe ids array', () => {
      spyOn(component, 'setRecipeExcluded');
      const data = { ...Mocks.getAdjustedDataset(), ...{ defaults: null } };
      mockStore.overrideSelector(Recipes.selectAdjustedDataset, data);
      mockStore.refreshState();
      component.toggleRecipe();
      expect(component.setRecipeExcluded).toHaveBeenCalledWith(
        RecipeId.NuclearFuelReprocessing,
        false,
        false,
      );
      mockStore.resetSelectors();
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.props('setRecipeExcluded', Recipes.setExcluded);
    dispatch.props('setRecipeChecked', Recipes.setChecked);
    dispatch.props('setRecipeCost', Recipes.setCost);
    dispatch.props('resetRecipe', Recipes.resetRecipe);
  });
});
