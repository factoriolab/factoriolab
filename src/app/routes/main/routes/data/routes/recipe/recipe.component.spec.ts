import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { DispatchTest, Mocks, RecipeId, TestModule } from 'src/tests';
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
    fixture.componentRef.setInput('id', RecipeId.NuclearFuelReprocessing);
    fixture.componentRef.setInput('collectionLabel', 'data.recipes');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleRecipe', () => {
    it('should handle an unrecognized recipe', () => {
      spyOn(component, 'setRecipeExcluded');
      fixture.componentRef.setInput('id', 'id');
      fixture.detectChanges();
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
      const data = { ...Mocks.getDataset(), ...{ defaults: null } };
      mockStore.overrideSelector(Recipes.getAdjustedDataset, data);
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
    dispatch.idValDef('setRecipeExcluded', Recipes.SetExcludedAction);
    dispatch.idVal('setRecipeChecked', Recipes.SetCheckedAction);
    dispatch.idVal('setRecipeCost', Recipes.SetCostAction);
    dispatch.val('resetRecipe', Recipes.ResetRecipeAction);
  });
});
