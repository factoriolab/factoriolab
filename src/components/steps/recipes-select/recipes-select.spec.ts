import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { RecipesSelect } from './recipes-select';

describe('RecipesSelect', () => {
  let component: RecipesSelect;
  let fixture: ComponentFixture<RecipesSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, RecipesSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipesSelect);
    setInputs(fixture, { step: {} });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changeREcipesIncluded', () => {
    it('should update the SettingsStore', () => {
      spyOn<any>(component, 'recipes').and.returnValue({
        ids: [RecipeId.AdvancedCircuit, RecipeId.ElectronicCircuit],
      });
      spyOn(component['settingsStore'], 'updateField');
      component.changeRecipesIncluded([RecipeId.ElectronicCircuit]);
      expect(component['settingsStore'].updateField).toHaveBeenCalledWith(
        'excludedRecipeIds',
        new Set([RecipeId.NuclearFuelReprocessing, RecipeId.AdvancedCircuit]),
        new Set([RecipeId.NuclearFuelReprocessing]),
      );
    });

    it('should return early if step has no recipes', () => {
      spyOn(component['settingsStore'], 'updateField');
      component.changeRecipesIncluded([RecipeId.ElectronicCircuit]);
      expect(component['settingsStore'].updateField).not.toHaveBeenCalled();
    });
  });
});
