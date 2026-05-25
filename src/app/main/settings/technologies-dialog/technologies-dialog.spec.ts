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

  describe('status', () => {
    it('should filter technologies', () => {
      component['filterText'].set('optics');
      const status = component['status']();
      expect(status.available.length).toEqual(0);
      expect(status.locked.length).toEqual(0);
      expect(status.researched.length).toEqual(1);
    });

    it('should set up lists of available, locked, and researched technologies', () => {
      component['selection'].set(new Set([RecipeId.MiningProductivity]));
      const status = component['status']();
      expect(status.available.length).toEqual(8);
      expect(status.researched.length).toEqual(1);
      expect(status.locked.length).toEqual(183);
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
      component.toggleId(RecipeId.Electronics);
      expect(component['selection']()).toEqual(
        new Set([RecipeId.Electronics, RecipeId.Automation]),
      );
    });

    it('should remove id and any dependencies from the selection', () => {
      component['selection'].set(
        new Set([RecipeId.Electronics, RecipeId.Automation]),
      );
      spyOn(component['selection'], 'set');
      component.toggleId(RecipeId.Automation);
      expect(component['selection']()).toEqual(new Set());
    });
  });

  describe('openImport', () => {
    it('open the dialog and handle the result', () => {
      spyOn(component['dialog'], 'open').and.returnValue({
        closed: of([RecipeId.Electronics]),
      } as any);
      component.openImport();
      expect(component['selection']()).toEqual(
        new Set([RecipeId.Electronics, RecipeId.Automation]),
      );
    });
  });

  describe('save', () => {
    it('should apply the selection', () => {
      const researchedTechnologyIds = new Set([
        RecipeId.Electronics,
        RecipeId.Automation,
      ]);
      component['selection'].set(researchedTechnologyIds);
      spyOn(component['settingsStore'], 'apply');
      component.save();
      expect(component['settingsStore'].apply).toHaveBeenCalledWith({
        researchedTechnologyIds,
      });
    });

    it('should emit null if all technologies are selected', () => {
      component['selection'].set(new Set(component['data']().technologyIds));
      spyOn(component['settingsStore'], 'apply');
      component.save();
      expect(component['settingsStore'].apply).toHaveBeenCalledWith({
        researchedTechnologyIds: undefined,
      });
    });
  });
});
