import { ComponentFixture, TestBed } from '@angular/core/testing';

import { rational } from '~/models/rational';
import { ItemId, Mocks, RecipeId, TestModule } from '~/tests';

import { ModulesOverlayComponent } from './modules-overlay.component';

describe('ModulesOverlayComponent', () => {
  let component: ModulesOverlayComponent;
  let fixture: ComponentFixture<ModulesOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ModulesOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModulesOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('show', () => {
    it('should show the overlay', () => {
      const event = {} as any;
      spyOn(component as any, '_show');
      component.show(
        event,
        Mocks.moduleSettings,
        Mocks.dataset.machineEntities[ItemId.AssemblingMachine3],
        RecipeId.AdvancedCircuit,
      );
      expect(component.machine()).toEqual(
        Mocks.dataset.machineEntities[ItemId.AssemblingMachine3],
      );
      expect(component.modules()).toEqual(Mocks.moduleSettings);
      expect(component.modules()).not.toBe(Mocks.moduleSettings);
      expect(component.recipeId()).toEqual(RecipeId.AdvancedCircuit);
      expect(component['_show']).toHaveBeenCalledWith(event);
    });
  });

  describe('save', () => {
    it('should emit a list filtered for nonzero module entries', () => {
      spyOn(component.setValue, 'emit');
      component.modules.set([
        { id: ItemId.ProductivityModule, count: rational.zero },
      ]);
      component.save();
      expect(component.setValue.emit).toHaveBeenCalledWith([]);
    });
  });
});
