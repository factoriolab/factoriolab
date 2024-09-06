import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';
import { Confirmation } from 'primeng/api';

import {
  DispatchTest,
  ItemId,
  Mocks,
  RecipeId,
  TestModule,
  TestUtility,
} from 'src/tests';
import { Game, rational } from '~/models';
import { App, LabState, Machines, Preferences, Settings } from '~/store';
import { BrowserUtility, RecipeUtility } from '~/utilities';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let mockStore: MockStore<LabState>;
  const id = 'id';
  const value = 'value';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule, SettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(
      Settings.selectGameStates,
      Mocks.PreferencesState.states[Game.Factorio],
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should ignore if no matching state is found', () => {
      expect(component.state).toEqual('');
    });

    it('should set state to matching saved state', () => {
      spyOnProperty(BrowserUtility, 'search').and.returnValue('z=zip');
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
      TestUtility.assert(confirm?.accept != null);
      spyOn(localStorage, 'clear');
      spyOn(component, 'resetSettings');
      confirm.accept();
      expect(localStorage.clear).toHaveBeenCalled();
      expect(component.resetSettings).toHaveBeenCalled();
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
      component.setState('name', Mocks.PreferencesState.states[Game.Factorio]);
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
    it('should emit to create the new saved state', () => {
      spyOn(component, 'saveState');
      spyOn(component, 'removeState');
      component.editValue = id;
      component.editState = 'create';
      spyOnProperty(BrowserUtility, 'search').and.returnValue(value);
      component.clickSaveState(Game.Factorio);
      expect(component.saveState).toHaveBeenCalledWith(
        Game.Factorio,
        id,
        value,
      );
      expect(component.removeState).not.toHaveBeenCalled();
      expect(component.editState).toBeNull();
    });

    it('should emit to edit the saved state', () => {
      spyOn(component, 'saveState');
      spyOn(component, 'removeState');
      component.editValue = id;
      component.editState = 'edit';
      component.state = id;
      spyOnProperty(BrowserUtility, 'search').and.returnValue(value);
      component.clickSaveState(Game.Factorio);
      expect(component.saveState).toHaveBeenCalledWith(
        Game.Factorio,
        id,
        value,
      );
      expect(component.removeState).toHaveBeenCalledWith(Game.Factorio, id);
      expect(component.editState).toBeNull();
    });

    it('should skip if invalid or not editing', () => {
      spyOn(component, 'saveState');
      component.editValue = '';
      component.editState = 'create';
      component.clickSaveState(Game.Factorio);
      component.editValue = 'id';
      component.editState = null;
      component.clickSaveState(Game.Factorio);
      expect(component.saveState).not.toHaveBeenCalled();
    });
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
      spyOn(component, 'saveState');
      mockStore.overrideSelector(Settings.selectGame, Game.Factorio);
      component.state = 'id';
      spyOnProperty(BrowserUtility, 'search').and.returnValue('search');
      component.editStateMenu[1].command!({});
      expect(component.saveState).toHaveBeenCalledWith(
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
      spyOn(component, 'removeState');
      component.state = id;
      component.editStateMenu[3].command!({});
      tick();
      expect(component.removeState).toHaveBeenCalledWith(Game.Factorio, id);
      expect(component.state).toEqual('');
    }));
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
      spyOn(component, 'setExcludedRecipes');
      const set = new Set([RecipeId.AdvancedCircuit]);
      component.changeExcludedRecipes(set);
      expect(component.setExcludedRecipes).toHaveBeenCalledWith(
        set,
        new Set([RecipeId.NuclearFuelReprocessing]),
      );
    });
  });

  describe('changeFuel', () => {
    it('should calculate the default value for the passed machine', () => {
      spyOn(component, 'setFuel');
      component.changeFuel(
        ItemId.StoneFurnace,
        ItemId.Coal,
        { fuelOptions: [{ label: '', value: ItemId.Wood }] },
        [ItemId.Wood],
      );
      expect(component.setFuel).toHaveBeenCalledWith(
        ItemId.StoneFurnace,
        ItemId.Coal,
        ItemId.Wood,
      );
    });

    it('should handle no options specified in passed settings', () => {
      spyOn(component, 'setFuel');
      component.changeFuel(ItemId.StoneFurnace, ItemId.Coal, {}, [ItemId.Wood]);
      expect(component.setFuel).toHaveBeenCalledWith(
        ItemId.StoneFurnace,
        ItemId.Coal,
        undefined,
      );
    });
  });

  describe('changeModules', () => {
    it('should dehydrate the modules', () => {
      spyOn(RecipeUtility, 'dehydrateModules');
      spyOn(component, 'setModules');
      component.changeModules(ItemId.AssemblingMachine2, []);
      expect(RecipeUtility.dehydrateModules).toHaveBeenCalled();
      expect(component.setModules).toHaveBeenCalled();
    });
  });

  describe('changeBeacons', () => {
    it('should dehydrate the beacons', () => {
      spyOn(RecipeUtility, 'dehydrateBeacons');
      spyOn(component, 'setBeacons');
      component.changeBeacons(ItemId.AssemblingMachine2, []);
      expect(RecipeUtility.dehydrateBeacons).toHaveBeenCalled();
      expect(component.setBeacons).toHaveBeenCalled();
    });
  });

  describe('changeDefaultBeacons', () => {
    it('should dehydrate the beacons', () => {
      spyOn(RecipeUtility, 'dehydrateBeacons');
      spyOn(component, 'setDefaultBeacons');
      component.changeDefaultBeacons([]);
      expect(RecipeUtility.dehydrateBeacons).toHaveBeenCalled();
      expect(component.setDefaultBeacons).toHaveBeenCalled();
    });
  });

  describe('toggleBeaconReceivers', () => {
    it('should turn off beacon power estimation', () => {
      spyOn(component, 'setBeaconReceivers');
      component.toggleBeaconReceivers(false);
      expect(component.setBeaconReceivers).toHaveBeenCalledWith(undefined);
    });

    it('should turn on beacon power estimation', () => {
      spyOn(component, 'setBeaconReceivers');
      component.toggleBeaconReceivers(true);
      expect(component.setBeaconReceivers).toHaveBeenCalledWith(rational.one);
    });
  });

  describe('addMachine', () => {
    it('should update the set and pass to the store action', () => {
      spyOn(component, 'setMachineRank');
      component.addMachine(ItemId.AssemblingMachine2, undefined);
      expect(component.setMachineRank).toHaveBeenCalledWith(
        [
          ItemId.AssemblingMachine1,
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
      spyOn(component, 'setMachineRank');
      component.setMachine(
        ItemId.AssemblingMachine1,
        ItemId.AssemblingMachine2,
        undefined,
      );
      expect(component.setMachineRank).toHaveBeenCalledWith(
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
      spyOn(component, 'setMachineRank');
      component.removeMachine(ItemId.AssemblingMachine1, undefined);
      expect(component.setMachineRank).toHaveBeenCalledWith(
        [ItemId.ElectricFurnace, ItemId.ElectricMiningDrill],
        undefined,
      );
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.void('resetSettings', App.reset);
    dispatch.props('saveState', Preferences.saveState);
    dispatch.props('removeState', Preferences.removeState);
    dispatch.props(
      'setResearchedTechnologies',
      Settings.setResearchedTechnologies,
    );
    dispatch.props('setExcludedItems', Settings.setExcludedItems);
    dispatch.props('setExcludedRecipes', Settings.setExcludedRecipes);
    dispatch.props('setPreset', Settings.setPreset);
    dispatch.props('setFuelRank', Settings.setFuelRank);
    dispatch.props('setModuleRank', Settings.setModuleRank);
    dispatch.props('setDefaultBeacons', Settings.setBeacons);
    dispatch.props('setDefaultOverclock', Settings.setOverclock);
    dispatch.props('setMachineRank', Settings.setMachineRank);
    dispatch.props('setFuel', Machines.setFuel);
    dispatch.props('setModules', Machines.setModules);
    dispatch.props('setBeacons', Machines.setBeacons);
    dispatch.props('setOverclock', Machines.setOverclock);
    dispatch.props('setBeaconReceivers', Settings.setBeaconReceivers);
    dispatch.props('setProliferatorSpray', Settings.setProliferatorSpray);
    dispatch.props('setBelt', Settings.setBelt);
    dispatch.props('setPipe', Settings.setPipe);
    dispatch.props('setCargoWagon', Settings.setCargoWagon);
    dispatch.props('setFluidWagon', Settings.setFluidWagon);
    dispatch.props('setFlowRate', Settings.setFlowRate);
    dispatch.props('setInserterTarget', Settings.setInserterTarget);
    dispatch.props('setMiningBonus', Settings.setMiningBonus);
    dispatch.props('setResearchSpeed', Settings.setResearchBonus);
    dispatch.props('setInserterCapacity', Settings.setInserterCapacity);
    dispatch.props('setDisplayRate', Settings.setDisplayRate);
    dispatch.props('setPowerUnit', Preferences.setPowerUnit);
    dispatch.props('setLanguage', Preferences.setLanguage);
    dispatch.props('setTheme', Preferences.setTheme);
    dispatch.props('setBypassLanding', Preferences.setBypassLanding);
    dispatch.props('setHideDuplicateIcons', Preferences.setHideDuplicateIcons);
    dispatch.props('setDisablePaginator', Preferences.setDisablePaginator);
    dispatch.props('setMaximizeType', Settings.setMaximizeType);
    dispatch.props('setNetProductionOnly', Settings.setNetProductionOnly);
    dispatch.props(
      'setSurplusMachinesOutput',
      Settings.setSurplusMachinesOutput,
    );
    dispatch.props(
      'setConvertObjectiveValues',
      Preferences.setConvertObjectiveValues,
    );
  });
});
