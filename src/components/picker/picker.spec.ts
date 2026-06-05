import { TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';

import { Picker } from './picker';

describe('Picker', () => {
  let service: Picker;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Picker);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('pickItem', () => {
    it('should open the dialog', () => {
      spyOn(service['dialog'], 'open').and.returnValue({
        closed: EMPTY,
      } as any);
      service.pickItem();
      expect(service['dialog'].open).toHaveBeenCalled();
    });
  });

  describe('pickRecipe', () => {
    it('should open the dialog', () => {
      spyOn(service['dialog'], 'open').and.returnValue({
        closed: EMPTY,
      } as any);
      service.pickRecipe();
      expect(service['dialog'].open).toHaveBeenCalled();
    });
  });

  describe('pickExcludedRecipes', () => {
    it('should open the dialog and apply the result', () => {
      spyOn(service['dialog'], 'open').and.returnValue({
        closed: of(new Set()),
      } as any);
      spyOn(service['settingsStore'], 'apply');
      service.pickExcludedRecipes();
      expect(service['dialog'].open).toHaveBeenCalled();
      expect(service['settingsStore'].apply).toHaveBeenCalledWith({
        excludedRecipeIds: new Set(),
      });
    });
  });

  describe('pickExcludedItems', () => {
    it('should open the dialog', () => {
      spyOn(service['dialog'], 'open').and.returnValue({
        closed: of(new Set()),
      } as any);
      spyOn(service['settingsStore'], 'apply');
      service.pickExcludedItems();
      expect(service['dialog'].open).toHaveBeenCalled();
      expect(service['settingsStore'].apply).toHaveBeenCalledWith({
        excludedItemIds: new Set(),
      });
    });
  });
});
