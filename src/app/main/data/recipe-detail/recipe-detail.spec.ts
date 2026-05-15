import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { RecipeDetail } from './recipe-detail';

describe('RecipeDetail', () => {
  let component: RecipeDetail;
  let fixture: ComponentFixture<RecipeDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, RecipeDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeDetail);
    setInputs(fixture, {
      id: RecipeId.NuclearFuelReprocessing,
      collectionLabel: 'data.recipes',
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

  describe('info', () => {
    it('should handle undefined recipe', () => {
      setInputs(fixture, { id: 'not-found' });
      const info = component['info']();
      expect(info.ingredientIds).toEqual([]);
      expect(info.catalystIds).toEqual([]);
      expect(info.productIds).toEqual([]);
    });
  });

  describe('changeExcluded', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      spyOn(component['settingsStore'], 'updateField');
      component.changeExcluded(false);
      expect(component['settingsStore'].updateField).toHaveBeenCalledWith(
        'excludedRecipeIds',
        new Set(),
        new Set([RecipeId.NuclearFuelReprocessing]),
      );
    });
  });

  describe('changeChecked', () => {
    it('should update the set and pass with defaults to the store dispatcher', () => {
      spyOn(component['settingsStore'], 'apply');
      component.changeChecked(true);
      expect(component['settingsStore'].apply).toHaveBeenCalledWith({
        checkedRecipeIds: new Set([RecipeId.NuclearFuelReprocessing]),
      });
    });
  });
});
