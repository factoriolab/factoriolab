import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ItemId } from '~/tests/item-id';
import { TestModule } from '~/tests/test-module';

import { Picker } from './picker';

describe('Picker', () => {
  let service: Picker;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestModule] });
    service = TestBed.inject(Picker);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('pickItem', () => {
    it('should open the dialog and filter the result', () => {
      spyOn(service['dialog'], 'open').and.returnValue({
        closed: of(ItemId.IronPlate),
      } as any);
      let result: string | undefined;
      service.pickItem().subscribe((r) => (result = r));
      expect(service['dialog'].open).toHaveBeenCalled();
      expect(result).toEqual(ItemId.IronPlate);
    });

    it('should prompt if a technology is selected with the same name as an item', () => {
      spyOn(service['dialog'], 'open').and.returnValue({
        closed: of(ItemId.ProductionSciencePackTechnology),
      } as any);
      spyOn(service['confirm'], 'open').and.returnValue(
        of(ItemId.ProductionSciencePackTechnology),
      );
      let result: string | undefined;
      service.pickItem().subscribe((r) => (result = r));
      expect(service['dialog'].open).toHaveBeenCalled();
      expect(service['confirm'].open).toHaveBeenCalled();
      expect(result).toEqual(ItemId.ProductionSciencePackTechnology);
    });

    it('should not prompt if a technology is selected with a unique name', () => {
      spyOn(service['dialog'], 'open').and.returnValue({
        closed: of(ItemId.MiningProductivity),
      } as any);
      spyOn(service['confirm'], 'open');
      let result: string | undefined;
      service.pickItem().subscribe((r) => (result = r));
      expect(service['dialog'].open).toHaveBeenCalled();
      expect(service['confirm'].open).not.toHaveBeenCalled();
      expect(result).toEqual(ItemId.MiningProductivity);
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
