import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
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
import { Game } from '~/models';
import { ContentService } from '~/services';
import {
  App,
  Items,
  LabState,
  Machines,
  Preferences,
  Recipes,
  Settings,
} from '~/store';
import { BrowserUtility } from '~/utilities';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let router: Router;
  let mockStore: MockStore<LabState>;
  let contentSvc: ContentService;
  const id = 'id';
  const value = 'value';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsComponent],
      imports: [TestModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    router = TestBed.inject(Router);
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(
      Settings.getGameStates,
      Mocks.PreferencesState.states[Game.Factorio],
    );
    contentSvc = TestBed.inject(ContentService);
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
      spyOn(contentSvc, 'confirm').and.callFake(
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
      spyOn(router, 'navigateByUrl');
      component.setSearch('v=9');
      expect(router.navigateByUrl).toHaveBeenCalled();
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
      spyOn(router, 'navigate');
      component.setState('name', Mocks.PreferencesState.states[Game.Factorio]);
      expect(component.state).toEqual('name');
      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { z: 'zip' },
      });
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
      mockStore.overrideSelector(Settings.getGame, Game.Factorio);
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

  describe('setExcludedRecipes', () => {
    it('should set up a batch of actions to set recipe excluded states', () => {
      spyOn(component, 'setRecipeExcludedBatch');
      component.setExcludedRecipes(
        [...Mocks.RawDataset.defaults!.excludedRecipeIds, RecipeId.Coal],
        Mocks.RecipesStateInitial,
        Mocks.Dataset,
      );
      expect(component.setRecipeExcludedBatch).toHaveBeenCalledWith([
        { id: RecipeId.Coal, value: true, def: false },
      ]);
    });

    it('should handle null defaults', () => {
      spyOn(component, 'setRecipeExcludedBatch');
      component.setExcludedRecipes(
        [...Mocks.RawDataset.defaults!.excludedRecipeIds, RecipeId.Coal],
        Mocks.RecipesStateInitial,
        {
          ...Mocks.Dataset,
          ...{ defaults: undefined },
        },
      );
      expect(component.setRecipeExcludedBatch).toHaveBeenCalledWith([
        { id: RecipeId.Coal, value: true, def: false },
      ]);
    });
  });

  describe('setExcludedItems', () => {
    it('should set up a batch of actions to set item excluded states', () => {
      spyOn(component, 'setItemExcludedBatch');
      component.setExcludedItems(
        [ItemId.Coal],
        Mocks.ItemsStateInitial,
        Mocks.Dataset,
      );
      expect(component.setItemExcludedBatch).toHaveBeenCalledWith([
        { id: ItemId.Coal, value: true },
      ]);
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

  describe('changeBeaconModuleRank', () => {
    it('should set the defaults for the default machine', () => {
      spyOn(component, 'setBeaconModuleRank');
      component.changeBeaconModuleRank('', [], {
        beaconModuleId: 'beaconModuleId',
      } as any);
      expect(component.setBeaconModuleRank).toHaveBeenCalledWith(
        '',
        [],
        ['beaconModuleId'],
      );
    });

    it('should set the defaults for a specific machine', () => {
      spyOn(component, 'setBeaconModuleRank');
      component.changeBeaconModuleRank(ItemId.AssemblingMachine1, [], {
        beaconModuleRankIds: ['beaconModuleId'],
      } as any);
      expect(component.setBeaconModuleRank).toHaveBeenCalledWith(
        ItemId.AssemblingMachine1,
        [],
        ['beaconModuleId'],
      );
    });
  });

  describe('toggleBeaconReceivers', () => {
    it('should turn off beacon power estimation', () => {
      spyOn(component, 'setBeaconReceivers');
      component.toggleBeaconReceivers(false);
      expect(component.setBeaconReceivers).toHaveBeenCalledWith(null);
    });

    it('should turn on beacon power estimation', () => {
      spyOn(component, 'setBeaconReceivers');
      component.toggleBeaconReceivers(true);
      expect(component.setBeaconReceivers).toHaveBeenCalledWith('1');
    });
  });

  it('should dispatch actions', () => {
    const dispatch = new DispatchTest(mockStore, component);
    dispatch.void('resetSettings', App.ResetAction);
    dispatch.keyIdVal('saveState', Preferences.SaveStateAction);
    dispatch.keyId('removeState', Preferences.RemoveStateAction);
    dispatch.val('setMod', Settings.SetModAction);
    dispatch.val(
      'setResearchedTechnologies',
      Settings.SetResearchedTechnologiesAction,
    );
    dispatch.val('setItemExcludedBatch', Items.SetExcludedBatchAction);
    dispatch.val('setRecipeExcludedBatch', Recipes.SetExcludedBatchAction);
    dispatch.val('setNetProductionOnly', Settings.SetNetProductionOnlyAction);
    dispatch.val(
      'setSurplusMachinesOutput',
      Settings.SetSurplusMachinesOutputAction,
    );
    dispatch.val('setPreset', Settings.SetPresetAction);
    dispatch.valDef('removeMachine', Machines.RemoveAction);
    dispatch.idValDef('setMachine', Machines.SetMachineAction);
    dispatch.idValDef('setFuel', Machines.SetFuelAction);
    dispatch.idValDef('setModuleRank', Machines.SetModuleRankAction);
    dispatch.idValDef('setOverclock', Machines.SetOverclockAction);
    dispatch.idValDef('setBeaconCount', Machines.SetBeaconCountAction);
    dispatch.idValDef('setBeacon', Machines.SetBeaconAction);
    dispatch.idValDef(
      'setBeaconModuleRank',
      Machines.SetBeaconModuleRankAction,
    );
    dispatch.valDef('setMachineRank', Machines.SetRankAction);
    dispatch.valDef('addMachine', Machines.AddAction);
    dispatch.val('setBeaconReceivers', Settings.SetBeaconReceiversAction);
    dispatch.val('setProliferatorSpray', Settings.SetProliferatorSprayAction);
    dispatch.valDef('setBelt', Settings.SetBeltAction);
    dispatch.valDef('setPipe', Settings.SetPipeAction);
    dispatch.valDef('setCargoWagon', Settings.SetCargoWagonAction);
    dispatch.valDef('setFluidWagon', Settings.SetFluidWagonAction);
    dispatch.valDef('setFuels', Settings.SetFuelRankAction);
    dispatch.val('setFlowRate', Settings.SetFlowRateAction);
    dispatch.val('setInserterTarget', Settings.SetInserterTargetAction);
    dispatch.val('setMiningBonus', Settings.SetMiningBonusAction);
    dispatch.val('setResearchSpeed', Settings.SetResearchSpeedAction);
    dispatch.val('setInserterCapacity', Settings.SetInserterCapacityAction);
    dispatch.valPrev('setDisplayRate', Settings.SetDisplayRateAction);
    dispatch.val('setMaximizeType', Settings.SetMaximizeTypeAction);
    dispatch.val('setPowerUnit', Preferences.SetPowerUnitAction);
    dispatch.val('setLanguage', Preferences.SetLanguageAction);
    dispatch.val('setTheme', Preferences.SetThemeAction);
    dispatch.val('setBypassLanding', Preferences.SetBypassLandingAction);
    dispatch.val(
      'setHideDuplicateIcons',
      Preferences.SetHideDuplicateIconsAction,
    );
    dispatch.val('setDisablePaginator', Preferences.SetDisablePaginatorAction);
    dispatch.val('setFlowDiagram', Preferences.SetFlowDiagramAction);
    dispatch.val('setSankeyAlign', Preferences.SetSankeyAlignAction);
    dispatch.val('setLinkSize', Preferences.SetLinkSizeAction);
    dispatch.val('setLinkText', Preferences.SetLinkTextAction);
    dispatch.val('setFlowHideExcluded', Preferences.SetFlowHideExcludedAction);
  });
});
