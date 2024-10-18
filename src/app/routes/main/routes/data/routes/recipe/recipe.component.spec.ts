import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeId, setInputs, TestModule } from '~/tests';

import { RecipeComponent } from './recipe.component';

describe('RecipeComponent', () => {
  let component: RecipeComponent;
  let fixture: ComponentFixture<RecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, RecipeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeComponent);
    component = fixture.componentInstance;
    setInputs(fixture, {
      id: RecipeId.NuclearFuelReprocessing,
      collectionLabel: 'data.recipes',
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('info', () => {
    it('should handle undefined recipe', () => {
      setInputs(fixture, { id: 'not-found' });
      const info = component.info();
      expect(info.category).toBeUndefined();
      expect(info.ingredientIds).toEqual([]);
      expect(info.catalystIds).toEqual([]);
      expect(info.productIds).toEqual([]);
    });
  });

  describe('changeExcluded', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      spyOn(component.settingsSvc, 'updateField');
      component.changeExcluded(false);
      expect(component.settingsSvc.updateField).toHaveBeenCalledWith(
        'excludedRecipeIds',
        new Set(),
        new Set([RecipeId.NuclearFuelReprocessing]),
      );
    });
  });

  describe('changeChecked', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      spyOn(component.settingsSvc, 'apply');
      component.changeChecked(true);
      expect(component.settingsSvc.apply).toHaveBeenCalledWith({
        checkedRecipeIds: new Set([RecipeId.NuclearFuelReprocessing]),
      });
    });
  });
});
