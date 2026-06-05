import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { ModuleSettings } from '~/state/module-settings';
import { ItemId } from '~/tests/item-id';
import { mockModuleSettings } from '~/tests/mocks/settings';
import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';
import { spread } from '~/utils/object';

import { Modules } from './modules';

describe('Modules', () => {
  let component: Modules;
  let fixture: ComponentFixture<Modules>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, Modules],
    }).compileComponents();

    fixture = TestBed.createComponent(Modules);
    component = fixture.componentInstance;
    setInputs(fixture, {
      entity:
        component['settingsStore'].dataset().machineRecord[
          ItemId.AssemblingMachine3
        ],
      value: mockModuleSettings,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('maximum', () => {
    it('should return null for machines with unlimited modules', () => {
      const entity = spread(
        component['settingsStore'].dataset().machineRecord[
          ItemId.AssemblingMachine3
        ],
        {
          modules: true,
        },
      );
      setInputs(fixture, { entity });
      expect(component['maximum']()).toEqual([undefined, undefined]);
    });
  });

  describe('setField', () => {
    it('should update the value of a specific field', () => {
      component['setField'](0, 'count', rational(3n));
      expect(component.value()[0].count).toEqual(rational(3n));
    });
  });

  describe('removeEntry', () => {
    it('should remove the entry at an index', async () => {
      component['removeEntry'](0);
      expect(component.value()).toHaveSize(1);
      await TestBed.inject(ApplicationRef).whenStable();
    });
  });

  describe('updateEmpty', () => {
    it('should immediately return if modules are disallowed or unlimited', () => {
      const modules = mockModuleSettings.map((m) => spread(m));
      spyOn(component, 'entity').and.returnValues(
        { modules: true },
        { modules: undefined },
      );
      component['updateEmpty'](modules);
      component['updateEmpty'](modules);
      expect(modules).toEqual(mockModuleSettings);
    });

    it('should increase the count of empty module slots', () => {
      const modules: ModuleSettings[] = [{ id: '', count: rational.zero }];
      component['updateEmpty'](modules);
      expect(modules[0].count).toEqual(rational(4n));
    });

    it('should add an entry for empty module slots', () => {
      const modules: ModuleSettings[] = [];
      component['updateEmpty'](modules);
      expect(modules[0].count).toEqual(rational(4n));
    });

    it('should decrease the count of empty module slots', () => {
      const modules: ModuleSettings[] = [{ id: '', count: rational(8n) }];
      component['updateEmpty'](modules);
      expect(modules[0].count).toEqual(rational(4n));
    });

    it('should remove the entry for empty module slots', () => {
      const modules: ModuleSettings[] = [
        { id: ItemId.SpeedModule, count: rational(4n) },
        { id: '', count: rational(8n) },
      ];
      component['updateEmpty'](modules);
      expect(modules).toEqual([
        { id: ItemId.SpeedModule, count: rational(4n) },
      ]);
    });
  });
});
