import { ComponentFixture, TestBed } from '@angular/core/testing';

import { rational } from '~/rational/rational';
import { SettingsStore } from '~/state/settings/settings-store';
import { ItemId } from '~/tests/item-id';
import { TestModule } from '~/tests/test-module';
import { setInputs } from '~/tests/utils';

import { ModulesSelect } from './modules-select';

describe('ModulesSelect', () => {
  let component: ModulesSelect;
  let fixture: ComponentFixture<ModulesSelect>;
  let settingsStore: SettingsStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, ModulesSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(ModulesSelect);
    settingsStore = TestBed.inject(SettingsStore);
    setInputs(fixture, {
      machine: settingsStore.dataset().machineRecord[ItemId.AssemblingMachine3],
    });
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('open', () => {
    it('should set the editValue', () => {
      spyOn(component['editValue'], 'set');
      component.open();
      expect(component['editValue'].set).toHaveBeenCalledWith([]);
    });
  });

  describe('save', () => {
    it('should emit a list filtered for nonzero module entries', () => {
      spyOn(component, 'setValue');
      component['editValue'].set([
        { id: ItemId.ProductivityModule, count: rational.zero },
      ]);
      component.save();
      expect(component.setValue).toHaveBeenCalledWith([]);
    });
  });
});
