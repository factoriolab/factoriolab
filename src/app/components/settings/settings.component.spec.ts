import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { Confirmation } from 'primeng/api';

import { Game } from '~/models/enum/game';
import { rational } from '~/models/rational';
import { assert, ItemId, Mocks, RecipeId, TestModule } from '~/tests';
import { RecipeUtility } from '~/utilities/recipe.utility';

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
        Game.Factorio,
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
        Game.Factorio,
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

  describe('ngOnInit', () => {
    it('should ignore if no matching state is found', () => {
      expect(component.state).toEqual('');
    });

    it('should set state to matching saved state', () => {
      spyOnProperty(component, 'search').and.returnValue('z=zip');
      spyOn(component.settingsSvc, 'gameStates').and.returnValue({
        name: 'z=zip',
      });
      component.ngOnInit();
      expect(component.state).toEqual('name');
    });
  });

  describe('clickResetSettings', () => {
    it('should set up a confirmation dialog and clear settings', () => {
      let confirm: Confirmation | undefined;
      spyOn(component.contentSvc, 'confirm').and.callFake(
        (c: Confirmation) => (confirm = c),
      );
      component.clickResetSettings();
      assert(confirm?.accept != null);
      spyOn(localStorage, 'clear');
      spyOn(component.router, 'navigate');
      confirm.accept();
      expect(localStorage.clear).toHaveBeenCalled();
      expect(component.router.navigate).toHaveBeenCalled();
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
      component.setState('name', Mocks.preferencesState.states[Game.Factorio]);
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
        Game.Factorio,
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
        Game.Factorio,
        id,
        value,
      );
      expect(component.preferencesSvc.removeState).toHaveBeenCalledWith(
        Game.Factorio,
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
      expect(component.setMod).toHaveBeenCalledWith('1.1');
    });
  });

  describe('setMod', () => {
    it('should map a game to its default mod id', () => {
      spyOn(component.router, 'navigate');
      component.setMod('mod');
      expect(component.router.navigate).toHaveBeenCalledWith(['mod', 'list']);
    });
  });

  describe('changeExcludedRecipes', () => {
    it('should set up defaults to pass to the store action', () => {
      spyOn(component.settingsSvc, 'apply');
      const excludedRecipeIds = new Set([RecipeId.AdvancedCircuit]);
      component.changeExcludedRecipes(excludedRecipeIds);
      expect(component.settingsSvc.apply).toHaveBeenCalledWith({
        excludedRecipeIds,
      });
    });
  });

  describe('changeFuel', () => {
    it('should calculate the default value for the passed machine', () => {
      spyOn(component.machinesSvc, 'updateEntityField');
      component.changeFuel(
        ItemId.StoneFurnace,
        ItemId.Coal,
        { fuelOptions: [{ label: '', value: ItemId.Wood }] },
        [ItemId.Wood],
      );
      expect(component.machinesSvc.updateEntityField).toHaveBeenCalledWith(
        ItemId.StoneFurnace,
        'fuelId',
        ItemId.Coal,
        ItemId.Wood,
      );
    });
  });

  describe('changeModules', () => {
    it('should dehydrate the modules', () => {
      spyOn(RecipeUtility, 'dehydrateModules');
      spyOn(component.machinesSvc, 'updateEntity');
      component.changeModules(ItemId.AssemblingMachine2, []);
      expect(RecipeUtility.dehydrateModules).toHaveBeenCalled();
      expect(component.machinesSvc.updateEntity).toHaveBeenCalled();
    });
  });

  describe('changeBeacons', () => {
    it('should dehydrate the beacons', () => {
      spyOn(RecipeUtility, 'dehydrateBeacons');
      spyOn(component.machinesSvc, 'updateEntity');
      component.changeBeacons(ItemId.AssemblingMachine2, []);
      expect(RecipeUtility.dehydrateBeacons).toHaveBeenCalled();
      expect(component.machinesSvc.updateEntity).toHaveBeenCalled();
    });
  });

  describe('changeDefaultBeacons', () => {
    it('should dehydrate the beacons', () => {
      spyOn(RecipeUtility, 'dehydrateBeacons');
      spyOn(component.settingsSvc, 'apply');
      component.changeDefaultBeacons([]);
      expect(RecipeUtility.dehydrateBeacons).toHaveBeenCalled();
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
      component.addMachine(ItemId.AssemblingMachine2, undefined);
      expect(component.settingsSvc.updateField).toHaveBeenCalledWith(
        'machineRankIds',
        [
          ItemId.AssemblingMachine3,
          ItemId.ElectricFurnace,
          ItemId.ElectricMiningDrill,
          ItemId.AssemblingMachine2,
        ],
        undefined,
      );
    });
  });

  describe('setMachine', () => {
    it('should update the set and pass to the store action', () => {
      spyOn(component.settingsSvc, 'updateField');
      component.setMachine(
        ItemId.AssemblingMachine3,
        ItemId.AssemblingMachine2,
        undefined,
      );
      expect(component.settingsSvc.updateField).toHaveBeenCalledWith(
        'machineRankIds',
        [
          ItemId.AssemblingMachine2,
          ItemId.ElectricFurnace,
          ItemId.ElectricMiningDrill,
        ],
        undefined,
      );
    });
  });

  describe('removeMachine', () => {
    it('should update the set and pass to the store action', () => {
      spyOn(component.settingsSvc, 'updateField');
      component.removeMachine(ItemId.AssemblingMachine3, undefined);
      expect(component.settingsSvc.updateField).toHaveBeenCalledWith(
        'machineRankIds',
        [ItemId.ElectricFurnace, ItemId.ElectricMiningDrill],
        undefined,
      );
    });
  });
});
