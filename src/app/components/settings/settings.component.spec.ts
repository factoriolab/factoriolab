import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { Confirmation } from 'primeng/api';

import { Game } from '~/models/enum/game';
import { rational } from '~/models/rational';
import { assert, ItemId, Mocks, TestModule } from '~/tests';

import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  const id = 'id';
  const value = 'value';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, SettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('openCreateState', () => {
    it('should start the create state from the menu', () => {
      component.state = id;
      component.editStateMenu[0].command!({});
      expect(component.editValue).toEqual('');
      expect(component.editState).toEqual('create');
    });
  });

  describe('overwriteState', () => {
    it('should re-save the state with the new value', () => {
      spyOn(component.preferencesSvc, 'saveState');
      component.state = 'id';
      spyOnProperty(component, 'search').and.returnValue('search');
      component.editStateMenu[1].command!({});
      expect(component.preferencesSvc.saveState).toHaveBeenCalledWith(
        '1.1',
        'id',
        'search',
      );
    });
  });

  describe('openEditState', () => {
    it('should start the edit state from the menu', () => {
      component.state = id;
      component.editStateMenu[2].command!({});
      expect(component.editValue).toEqual(id);
      expect(component.editState).toEqual('edit');
    });
  });

  describe('clickDeleteState', () => {
    it('should emit to remove the state from the menu', fakeAsync(() => {
      spyOn(component.preferencesSvc, 'removeState');
      component.state = id;
      component.editStateMenu[3].command!({});
      tick();
      expect(component.preferencesSvc.removeState).toHaveBeenCalledWith(
        '1.1',
        id,
      );
      expect(component.state).toEqual('');
    }));
  });

  describe('search', () => {
    it('should get the window.location property', () => {
      expect(component.search).toEqual(window.location.search.substring(1));
    });
  });

  describe('state effect', () => {
    it('should ignore if no matching state is found', () => {
      expect(component.state).toEqual('');
    });

    it('should set state to matching saved state', () => {
      component.preferencesSvc.saveState(
        Mocks.modId,
        'name',
        window.location.search.substring(1),
      );
      fixture.detectChanges();
      expect(component.state).toEqual('name');
    });
  });

  describe('clickResetSettings', () => {
    it('should set up a confirmation dialog and clear settings', async () => {
      let confirm: Confirmation | undefined;
      spyOn(component.contentSvc, 'confirm').and.callFake(
        (c: Confirmation) => (confirm = c),
      );
      component.clickResetSettings();
      assert(confirm?.accept != null);
      spyOn(localStorage, 'clear');
      spyOn(component.router, 'navigate');
      spyOn(component.contentSvc, 'reload');
      await confirm.accept();
      expect(localStorage.clear).toHaveBeenCalled();
      expect(component.router.navigate).toHaveBeenCalled();
      expect(component.contentSvc.reload).toHaveBeenCalled();
    });
  });

  describe('setSearch', () => {
    it('should call the router to navigate', () => {
      spyOn(component.router, 'navigateByUrl');
      component.setSearch('v=9');
      expect(component.router.navigateByUrl).toHaveBeenCalled();
    });
  });

  describe('copySearchToClipboard', () => {
    it('should copy the text to the clipboard', () => {
      spyOn(navigator.clipboard, 'writeText');
      component.copySearchToClipboard('v=9');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('v=9');
    });
  });

  describe('setState', () => {
    it('should call the router to navigate', () => {
      spyOn(component.router, 'navigate');
      component.setState('name', Mocks.preferencesState.states[Mocks.modId]);
      expect(component.state).toEqual('name');
      expect(component.router.navigate).toHaveBeenCalledWith([], {
        queryParams: { z: 'zip' },
      });
    });

    it('should return if the state is falsy', () => {
      spyOn(component.router, 'navigate');
      component.setState('', {});
      expect(component.router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('clickSaveState', () => {
    beforeEach(() => {
      spyOn(component.preferencesSvc, 'saveState');
      spyOn(component.preferencesSvc, 'removeState');
    });

    it('should emit to create the new saved state', () => {
      component.editValue = id;
      component.editState = 'create';
      spyOnProperty(component, 'search').and.returnValue(value);
      component.clickSaveState();
      expect(component.preferencesSvc.saveState).toHaveBeenCalledWith(
        Mocks.modId,
        id,
        value,
      );
      expect(component.preferencesSvc.removeState).not.toHaveBeenCalled();
      expect(component.editState).toBeNull();
    });

    it('should emit to edit the saved state', () => {
      component.editValue = id;
      component.editState = 'edit';
      component.state = id;
      spyOnProperty(component, 'search').and.returnValue(value);
      component.clickSaveState();
      expect(component.preferencesSvc.saveState).toHaveBeenCalledWith(
        Mocks.modId,
        id,
        value,
      );
      expect(component.preferencesSvc.removeState).toHaveBeenCalledWith(
        Mocks.modId,
        id,
      );
      expect(component.editState).toBeNull();
    });

    it('should skip if invalid or not editing', () => {
      component.editValue = '';
      component.editState = 'create';
      component.clickSaveState();
      component.editValue = 'id';
      component.editState = null;
      component.clickSaveState();
      expect(component.preferencesSvc.saveState).not.toHaveBeenCalled();
    });
  });

  describe('setGame', () => {
    it('should map a game to its default mod id', () => {
      spyOn(component, 'setMod');
      component.setGame(Game.Factorio);
      expect(component.setMod).toHaveBeenCalledWith('spa');
    });
  });

  describe('setMod', () => {
    it('should map a game to its default mod id', () => {
      spyOn(component.router, 'navigate');
      component.setMod('mod');
      expect(component.router.navigate).toHaveBeenCalledWith(['mod', 'list']);
    });
  });

  describe('changeLocations', () => {
    it('should set the locations', () => {
      spyOn(component.settingsSvc, 'updateField');
      component.changeLocations(['id2']);
      expect(component.settingsSvc.updateField).toHaveBeenCalledWith(
        'locationIds',
        new Set(['id2']),
        new Set(['id']),
      );
    });
  });

  describe('changeModules', () => {
    it('should dehydrate the modules', () => {
      spyOn(component.recipeSvc, 'dehydrateModules');
      spyOn(component.machinesSvc, 'updateEntity');
      component.changeModules(ItemId.AssemblingMachine2, []);
      expect(component.recipeSvc.dehydrateModules).toHaveBeenCalled();
      expect(component.machinesSvc.updateEntity).toHaveBeenCalled();
    });
  });

  describe('changeBeacons', () => {
    it('should dehydrate the beacons', () => {
      spyOn(component.recipeSvc, 'dehydrateBeacons');
      spyOn(component.machinesSvc, 'updateEntity');
      component.changeBeacons(ItemId.AssemblingMachine2, []);
      expect(component.recipeSvc.dehydrateBeacons).toHaveBeenCalled();
      expect(component.machinesSvc.updateEntity).toHaveBeenCalled();
    });
  });

  describe('changeDefaultBeacons', () => {
    it('should dehydrate the beacons', () => {
      spyOn(component.recipeSvc, 'dehydrateBeacons');
      spyOn(component.settingsSvc, 'apply');
      component.changeDefaultBeacons([]);
      expect(component.recipeSvc.dehydrateBeacons).toHaveBeenCalled();
      expect(component.settingsSvc.apply).toHaveBeenCalled();
    });
  });

  describe('toggleBeaconReceivers', () => {
    it('should turn off beacon power estimation', () => {
      spyOn(component.settingsSvc, 'apply');
      component.toggleBeaconReceivers(false);
      expect(component.settingsSvc.apply).toHaveBeenCalledWith({
        beaconReceivers: undefined,
      });
    });

    it('should turn on beacon power estimation', () => {
      spyOn(component.settingsSvc, 'apply');
      component.toggleBeaconReceivers(true);
      expect(component.settingsSvc.apply).toHaveBeenCalledWith({
        beaconReceivers: rational.one,
      });
    });
  });

  describe('addMachine', () => {
    it('should update the set and pass to the store action', () => {
      spyOn(component.settingsSvc, 'updateField');
      component.addMachine(ItemId.AssemblingMachine2);
      expect(component.settingsSvc.updateField).toHaveBeenCalledWith(
        'machineRankIds',
        [
          ItemId.AssemblingMachine3,
          ItemId.ElectricFurnace,
          ItemId.ElectricMiningDrill,
          ItemId.AssemblingMachine2,
        ],
        [
          ItemId.AssemblingMachine3,
          ItemId.ElectricFurnace,
          ItemId.ElectricMiningDrill,
        ],
      );
    });
  });

  describe('setMachine', () => {
    it('should update the set and pass to the store action', () => {
      spyOn(component.settingsSvc, 'updateField');
      component.setMachine(
        ItemId.AssemblingMachine3,
        ItemId.AssemblingMachine2,
      );
      expect(component.settingsSvc.updateField).toHaveBeenCalledWith(
        'machineRankIds',
        [
          ItemId.AssemblingMachine2,
          ItemId.ElectricFurnace,
          ItemId.ElectricMiningDrill,
        ],
        [
          ItemId.AssemblingMachine3,
          ItemId.ElectricFurnace,
          ItemId.ElectricMiningDrill,
        ],
      );
    });
  });

  describe('removeMachine', () => {
    it('should update the set and pass to the store action', () => {
      spyOn(component.settingsSvc, 'updateField');
      component.removeMachine(ItemId.AssemblingMachine3);
      expect(component.settingsSvc.updateField).toHaveBeenCalledWith(
        'machineRankIds',
        [ItemId.ElectricFurnace, ItemId.ElectricMiningDrill],
        [
          ItemId.AssemblingMachine3,
          ItemId.ElectricFurnace,
          ItemId.ElectricMiningDrill,
        ],
      );
    });
  });
});
