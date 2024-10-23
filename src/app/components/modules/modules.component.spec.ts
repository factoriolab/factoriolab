import { ComponentFixture, TestBed } from '@angular/core/testing';

import { spread } from '~/helpers';
import { rational } from '~/models/rational';
import { ModuleSettings } from '~/models/settings/module-settings';
import { ItemId, Mocks, setInputs, TestModule } from '~/tests';

import { ModulesComponent } from './modules.component';

describe('ModulesComponent', () => {
  let component: ModulesComponent;
  let fixture: ComponentFixture<ModulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ModulesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModulesComponent);
    component = fixture.componentInstance;
    setInputs(fixture, {
      entity: Mocks.dataset.machineEntities[ItemId.AssemblingMachine3],
      modules: Mocks.moduleSettings,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('maximum', () => {
    it('should return null for machines with unlimited modules', () => {
      fixture.componentRef.setInput(
        'entity',
        spread(Mocks.dataset.machineEntities[ItemId.AssemblingMachine3], {
          modules: true,
        }),
      );
      fixture.detectChanges();
      expect(component.maximum()).toEqual([undefined, undefined]);
    });
  });

  describe('setCount', () => {
    it('should update module count at an index and emit the new collection', () => {
      spyOn(component, 'updateEmpty');
      spyOn(component.setValue, 'emit');
      component.setCount(0, rational(2n));
      expect(component.updateEmpty).toHaveBeenCalled();
      expect(component.setValue.emit).toHaveBeenCalled();
    });
  });

  describe('setCount', () => {
    it('should update module id at an index and emit the new collection', () => {
      const originalEvent = { stopPropagation: (): void => {} };
      const value = ItemId.ProductivityModule;
      spyOn(originalEvent, 'stopPropagation');
      spyOn(component.setValue, 'emit');
      component.setId(0, { originalEvent, value } as any);
      expect(originalEvent.stopPropagation).toHaveBeenCalled();
      expect(component.setValue.emit).toHaveBeenCalled();
    });
  });

  describe('removeEntry', () => {
    it('should remove the entry at an index and emit the new collection', () => {
      spyOn(component, 'updateEmpty');
      spyOn(component.setValue, 'emit');
      component.removeEntry(0);
      expect(component.updateEmpty).toHaveBeenCalled();
      expect(component.setValue.emit).toHaveBeenCalled();
    });
  });

  describe('updateEmpty', () => {
    it('should immediately return if modules are disallowed or unlimited', () => {
      const modules = Mocks.moduleSettings.map((m) => spread(m));
      spyOn(component, 'entity').and.returnValues(
        { modules: true },
        { modules: undefined },
      );
      component.updateEmpty(modules);
      component.updateEmpty(modules);
      expect(modules).toEqual(Mocks.moduleSettings);
    });

    it('should increase the count of empty module slots', () => {
      const modules: ModuleSettings[] = [
        { id: ItemId.Module, count: rational.zero },
      ];
      component.updateEmpty(modules);
      expect(modules[0].count).toEqual(rational(4n));
    });

    it('should add an entry for empty module slots', () => {
      const modules: ModuleSettings[] = [];
      component.updateEmpty(modules);
      expect(modules[0].count).toEqual(rational(4n));
    });

    it('should decrease the count of empty module slots', () => {
      const modules: ModuleSettings[] = [
        { id: ItemId.Module, count: rational(8n) },
      ];
      component.updateEmpty(modules);
      expect(modules[0].count).toEqual(rational(4n));
    });

    it('should remove the entry for empty module slots', () => {
      const modules: ModuleSettings[] = [
        { id: ItemId.SpeedModule, count: rational(4n) },
        { id: ItemId.Module, count: rational(8n) },
      ];
      component.updateEmpty(modules);
      expect(modules).toEqual([
        { id: ItemId.SpeedModule, count: rational(4n) },
      ]);
    });
  });
});
