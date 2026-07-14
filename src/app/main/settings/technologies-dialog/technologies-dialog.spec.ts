import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';

import { TechnologiesDialog } from './technologies-dialog';

describe('TechnologiesDialog', () => {
  let component: TechnologiesDialog;
  let fixture: ComponentFixture<TechnologiesDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, TechnologiesDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(TechnologiesDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('result', () => {
    it('should compare the selection against the dataset', () => {
      expect(component.result()).toBeUndefined();
      component['selection'].set(new Set());
      expect(component.result()).toEqual(new Set());
    });
  });

  describe('status', () => {
    it('should filter technologies', () => {
      component['filterText'].set('laser');
      const status = component['status']();
      expect(status.available.length).toEqual(0);
      expect(status.locked.length).toEqual(0);
      expect(status.researched.length).toEqual(10);
    });

    it('should set up lists of available, locked, and researched technologies', () => {
      component['selection'].set(new Set([RecipeId.MiningProductivity]));
      const status = component['status']();
      expect(status.available.length).toEqual(2);
      expect(status.researched.length).toEqual(1);
      expect(status.locked.length).toEqual(193);
    });
  });

  describe('selectAll', () => {
    it('should set the selection to all', () => {
      spyOn(component['selection'], 'set');
      component.selectAll(true);
      expect(component['selection'].set).toHaveBeenCalledWith(
        new Set(component['data']().technologyIds),
      );
    });

    it('should set the selection to empty', () => {
      spyOn(component['selection'], 'set');
      component.selectAll(false);
      expect(component['selection'].set).toHaveBeenCalledWith(new Set());
    });
  });

  describe('toggleId', () => {
    it('should add the id and any dependencies to the selection', () => {
      component['selection'].set(new Set());
      component.toggleId(RecipeId.AutomationSciencePackTechnology);
      expect(component['selection']()).toEqual(
        new Set([
          RecipeId.Electronics,
          RecipeId.AutomationSciencePackTechnology,
          RecipeId.SteamPower,
        ]),
      );
    });

    it('should remove id and any dependencies from the selection', () => {
      component['selection'].set(
        new Set([
          RecipeId.Electronics,
          RecipeId.AutomationSciencePackTechnology,
          RecipeId.SteamPower,
        ]),
      );
      spyOn(component['selection'], 'set');
      component.toggleId(RecipeId.SteamPower);
      expect(component['selection']()).toEqual(new Set([RecipeId.Electronics]));
    });
  });

  describe('openImport', () => {
    it('open the dialog and handle the result', () => {
      spyOn(component['dialog'], 'open').and.returnValue({
        closed: of([RecipeId.AutomationSciencePackTechnology]),
      } as any);
      component.openImport();
      expect(component['selection']()).toEqual(
        new Set([
          RecipeId.AutomationSciencePackTechnology,
          RecipeId.SteamPower,
          RecipeId.Electronics,
        ]),
      );
    });
  });
});
