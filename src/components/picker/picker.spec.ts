import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

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
    it('should open the dialog and filter the result', () => {
      spyOn(service['dialog'], 'open').and.returnValue({
        closed: of('result'),
      } as any);
      let result: string | undefined;
      service.pickItem().subscribe((r) => (result = r));
      expect(service['dialog'].open).toHaveBeenCalled();
      expect(result).toEqual('result');
    });
  });

  describe('pickRecipe', () => {
    it('should open the dialog', () => {
      spyOn(service['dialog'], 'open').and.returnValue({
        closed: of('result'),
      } as any);
      let result: string | undefined;
      service.pickRecipe().subscribe((r) => (result = r));
      service.pickRecipe();
      expect(service['dialog'].open).toHaveBeenCalled();
      expect(result).toEqual('result');
    });
  });

  describe('pickExcludedRecipes', () => {
    it('should open the dialog and apply the result', () => {
      spyOn(service['dialog'], 'open').and.returnValue({
        closed: of(undefined),
        componentInstance: { selection: () => new Set() },
      } as any);
      spyOn(service['settingsStore'], 'apply');
      service.pickExcludedRecipes();
      expect(service['dialog'].open).toHaveBeenCalled();
      expect(service['settingsStore'].apply).toHaveBeenCalledWith({
        excludedRecipeIds: new Set(),
      });
    });
  });

  describe('pickExcludedItems and apply the result', () => {
    it('should open the dialog', () => {
      spyOn(service['dialog'], 'open').and.returnValue({
        closed: of(undefined),
        componentInstance: { selection: () => new Set() },
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
