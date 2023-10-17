import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { MemoizedSelector } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';
import { deflate, inflate } from 'pako';
import { of } from 'rxjs';

import { ItemId, Mocks, RecipeId, TestModule } from 'src/tests';
import {
  BeaconSettings,
  DisplayRate,
  Game,
  InserterCapacity,
  InserterTarget,
  MaximizeType,
  Objective,
  ObjectiveType,
  ObjectiveUnit,
  Preset,
  Rational,
  ResearchSpeed,
} from '~/models';
import {
  App,
  Datasets,
  Items,
  LabState,
  Machines,
  Objectives,
  Preferences,
  Recipes,
  Settings,
} from '~/store';
import { ContentService } from './content.service';
import { DataService } from './data.service';
import {
  EMPTY,
  FALSE,
  MIN_ZIP,
  NULL,
  RouterService,
  Section,
  TRUE,
  Zip,
  ZipData,
  ZipVersion,
} from './router.service';

const mockObjective: Objective = {
  id: '1',
  targetId: ItemId.SteelChest,
  value: '1',
  unit: ObjectiveUnit.Belts,
  type: ObjectiveType.Output,
};
const mockObjectivesState: Objectives.ObjectivesState = {
  ids: ['1'],
  entities: {
    ['1']: mockObjective,
  },
  index: 2,
};
const mockItemsState: Items.ItemsState = {
  [ItemId.SteelChest]: {
    excluded: true,
    beltId: ItemId.TransportBelt,
    wagonId: ItemId.CargoWagon,
  },
};
const mockRecipesState: Recipes.RecipesState = {
  [RecipeId.SteelChest]: {
    machineId: ItemId.AssemblingMachine2,
    machineModuleIds: [ItemId.EfficiencyModule, ItemId.EfficiencyModule],
    beacons: [
      {
        count: '1',
        id: ItemId.Beacon,
        moduleIds: [ItemId.SpeedModule, ItemId.SpeedModule],
        total: '8',
      },
    ],
    overclock: 200,
    cost: '100',
  },
};
const mockMachinesState: Machines.MachinesState = {
  ids: [ItemId.AssemblingMachine2, ItemId.SteelFurnace],
  entities: {
    ['']: {
      moduleRankIds: [ItemId.ProductivityModule, ItemId.SpeedModule],
      beaconCount: '1',
      beaconId: ItemId.Beacon,
      beaconModuleRankIds: [ItemId.SpeedModule],
    },
  },
};
const mockSettingsState: Settings.SettingsState = {
  modId: '1.0',
  researchedTechnologyIds: null,
  netProductionOnly: true,
  surplusMachinesOutput: false,
  preset: Preset.Modules,
  beaconReceivers: '1',
  proliferatorSprayId: ItemId.ProductivityModule,
  beltId: ItemId.TransportBelt,
  fuelRankIds: [ItemId.Coal],
  cargoWagonId: ItemId.CargoWagon,
  fluidWagonId: ItemId.FluidWagon,
  flowRate: 1200,
  inserterTarget: InserterTarget.Chest,
  miningBonus: 100,
  researchSpeed: ResearchSpeed.Speed0,
  inserterCapacity: InserterCapacity.Capacity0,
  displayRate: DisplayRate.PerHour,
  maximizeType: MaximizeType.Weight,
  costs: {
    factor: '2',
    machine: '10',
    footprint: '1',
    unproduceable: '0',
    excluded: '100',
    surplus: '0',
    maximize: '-100000',
  },
};
const mockZip: Zip = {
  bare: 'p=steel-chest*1*1',
  hash: 'pC6*1*1',
};
const mockZipPartial: Zip = {
  bare:
    '&e=1*speed-module~speed-module*beacon*8&i=steel-chest*1*transport-belt*c' +
    'argo-wagon&r=steel-chest**assembling-machine-2*effectivity-module~effect' +
    'ivity-module*0*200*100&f=1*productivity-module~speed-module*1*speed-modu' +
    'le*beacon_assembling-machine-2_steel-furnace&s=1.0**2*1*transport-belt*c' +
    'oal**100*0*0*0*cargo-wagon*fluid-wagon**1*productivity-module*1**2*1' +
    '0*0*100**-100000',
  hash:
    '&e1*G~G*A*8&bB&iC6*1*C*A&rDB**B*A~A*0*200*100&f1*D~G*1*G*A_B_Q&s*2*1' +
    '*C*A**Bk*A*0*0*A*B**1*D*1**2*10*0*100**-100000',
};
const mockState: LabState = {
  objectivesState: mockObjectivesState,
  itemsState: mockItemsState,
  recipesState: mockRecipesState,
  machinesState: mockMachinesState,
  settingsState: mockSettingsState,
} as any;
function mockEmptyZip(): Zip {
  return { bare: '', hash: '' };
}
function mockZipData(objectives?: Zip, config?: Zip): ZipData {
  return {
    objectives: objectives ?? mockEmptyZip(),
    config: config ?? mockEmptyZip(),
    objectiveBeaconMap: {},
    recipeBeaconMap: {},
  };
}

describe('RouterService', () => {
  let service: RouterService;
  let mockStore: MockStore<LabState>;
  let mockGetZipState: MemoizedSelector<
    LabState,
    {
      objectives: Objectives.ObjectivesState;
      itemsState: Items.ItemsState;
      recipesState: Recipes.RecipesState;
      machinesState: Machines.MachinesState;
      settings: Settings.SettingsState;
    }
  >;
  let router: Router;
  let dataSvc: DataService;
  let contentSvc: ContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
    });
    service = TestBed.inject(RouterService);
    service.initialize();
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(Datasets.getHashRecord, {
      [Settings.initialSettingsState.modId]: Mocks.Hash,
      [mockSettingsState.modId]: Mocks.Hash,
    });
    mockGetZipState = mockStore.overrideSelector(Objectives.getZipState, {
      objectives: Objectives.initialObjectivesState,
      itemsState: Items.initialItemsState,
      recipesState: Recipes.initialRecipesState,
      machinesState: Machines.initialMachinesState,
      settings: Settings.initialSettingsState,
    });
    router = TestBed.inject(Router);
    dataSvc = TestBed.inject(DataService);
    contentSvc = TestBed.inject(ContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update state from router', () => {
    spyOn(service, 'updateState');
    (router.events as any).next(new NavigationEnd(2, '/', '/'));
    expect(service.updateState).toHaveBeenCalled();
  });

  it('should run first update of url if settings modified', (done) => {
    (router.events as any).next(new NavigationEnd(2, '/', '/'));
    spyOn(service, 'updateUrl').and.callFake(() => {
      expect(service.updateUrl).toHaveBeenCalled();
      done();
    });
    mockGetZipState.setResult({
      objectives: Objectives.initialObjectivesState,
      itemsState: { [ItemId.Wood]: { excluded: true } },
      recipesState: Recipes.initialRecipesState,
      machinesState: Machines.initialMachinesState,
      settings: Settings.initialSettingsState,
    });
    mockStore.refreshState();
    service.first = true;
  });

  describe('migrateOldStates', () => {
    it('should skip if keys match', () => {
      spyOn(mockStore, 'dispatch');
      service.migrateOldStates(Mocks.PreferencesState.states);
      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should migrate saved states into correct games', () => {
      spyOn(mockStore, 'dispatch');
      service.migrateOldStates({
        ...Preferences.initialPreferencesState.states,
        ...{ id: 's=dsp' },
      } as any);
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        new Preferences.SetStatesAction({
          ...Preferences.initialPreferencesState.states,
          ...{
            [Game.DysonSphereProgram]: { id: 's=dsp' },
          },
        }),
      );
    });
  });

  describe('getModIdFromState', () => {
    it('should handle zipped states', () => {
      let result = service.getModIdFromState(
        'z=eJwrcInQMlQrcknU0nLScq9zVyuzBAA04gVG&v=9',
      );
      expect(result).toBeUndefined();

      result = service.getModIdFromState(
        'z=eJwrMNcyVEvyUCtyctTSStZyVStWK7MEADvbBYI_&v=9',
      );
      expect(result).toEqual('dsp');
    });

    it('should handle invalid states', () => {
      let result = service.getModIdFromState('z=');
      expect(result).toBeUndefined();

      result = service.getModIdFromState('s=');
      expect(result).toBeUndefined();
    });
  });

  describe('getGameFromModId', () => {
    it('should return default value', () => {
      expect(service.getGameFromModId(undefined)).toEqual(Game.Factorio);
      expect(service.getGameFromModId('fake')).toEqual(Game.Factorio);
    });
  });

  describe('updateUrl', () => {
    it('should update url with products', () => {
      spyOn(service, 'zipState').and.returnValue(of(mockZipData()));
      spyOn(service, 'getHash').and.returnValue('test');
      spyOn(router, 'navigateByUrl');
      service.updateUrl(
        Objectives.initialObjectivesState,
        Items.initialItemsState,
        Recipes.initialRecipesState,
        Machines.initialMachinesState,
        Settings.initialSettingsState,
      );
      expect(router.navigateByUrl).toHaveBeenCalledWith('/?test');
    });

    it('should preserve a hash', () => {
      spyOn(service, 'zipState').and.returnValue(of(mockZipData()));
      spyOn(service, 'getHash').and.returnValue('test');
      spyOn(router, 'navigateByUrl');
      spyOnProperty(router, 'url').and.returnValue('path#hash');
      service.updateUrl(
        Objectives.initialObjectivesState,
        Items.initialItemsState,
        Recipes.initialRecipesState,
        Machines.initialMachinesState,
        Settings.initialSettingsState,
      );
      expect(router.navigateByUrl).toHaveBeenCalledWith('path?test#hash');
    });
  });

  describe('zipState', () => {
    it('should zip state', () => {
      let zip: ZipData | undefined;
      service
        .zipState(
          Objectives.initialObjectivesState,
          Items.initialItemsState,
          Recipes.initialRecipesState,
          Machines.initialMachinesState,
          Settings.initialSettingsState,
        )
        .subscribe((z) => (zip = z));
      expect(zip).toEqual(mockZipData());
    });

    it('should zip full state', () => {
      let zip: ZipData | undefined;
      service
        .zipState(
          mockObjectivesState,
          mockItemsState,
          mockRecipesState,
          mockMachinesState,
          mockSettingsState,
        )
        .subscribe((z) => (zip = z));
      expect(zip?.objectives).toEqual(mockZip);
      expect(zip?.config).toEqual(mockZipPartial);
    });
  });

  describe('stepHref', () => {
    it('should return null if hash is undefined', () => {
      expect(
        service.stepHref(
          { id: '', itemId: ItemId.Wood },
          mockEmptyZip(),
          undefined,
        ),
      ).toBeNull();
    });

    it('should return null for no items or machines', () => {
      expect(
        service.stepHref(
          { id: '', itemId: ItemId.Wood },
          mockEmptyZip(),
          Mocks.Hash,
        ),
      ).toBeNull();
    });

    it('should return get the hash for items from specific step', () => {
      spyOn(service, 'zipObjectives');
      spyOn(service, 'getHash').and.returnValue('test');
      expect(
        service.stepHref(
          { id: '', itemId: ItemId.Wood, items: Rational.one },
          mockEmptyZip(),
          Mocks.Hash,
        ),
      ).toEqual('list?test');
    });

    it('should return get the hash for machines from specific step', () => {
      spyOn(service, 'zipObjectives');
      spyOn(service, 'getHash').and.returnValue('test');
      expect(
        service.stepHref(
          {
            id: '',
            recipeId: RecipeId.AdvancedCircuit,
            machines: Rational.one,
          },
          mockEmptyZip(),
          Mocks.Hash,
        ),
      ).toEqual('list?test');
    });
  });

  describe('getHash', () => {
    it('should preserve a small state', () => {
      spyOn(service, 'bytesToBase64').and.returnValue('');
      const result = service.getHash(mockZipData(mockZip));
      expect(result).toEqual(`${mockZip.bare}&v=${service.version}`);
    });

    it('should zip a large state', () => {
      spyOn(service, 'bytesToBase64').and.returnValue('test');
      service.zipTail.bare = 'a'.repeat(MIN_ZIP);
      const result = service.getHash(mockZipData());
      expect(result).toEqual('z=test&v=' + service.version);
    });
  });

  describe('getParams', () => {
    it('should handle params with & and =', () => {
      expect(service.getParams('p=prod&s=sett')).toEqual({
        p: 'prod',
        s: 'sett',
      });
    });

    it('should handle params with no =', () => {
      expect(service.getParams('abc')).toEqual({ a: 'bc' });
    });
  });

  describe('updateState', () => {
    beforeEach(() => {
      spyOn(service, 'dispatch');
    });

    it('should skip unless event is NavigationEnd', () => {
      (router.events as any).next(new NavigationStart(2, ''));
      expect(service.dispatch).not.toHaveBeenCalled();
    });

    it('should skip unless hash is found', () => {
      (router.events as any).next(new NavigationEnd(2, '/', '/'));
      expect(service.dispatch).not.toHaveBeenCalled();
    });

    it('should skip unless new zip is found', () => {
      service.zip = mockZip.bare;
      const url = `/#${mockZip.bare}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).not.toHaveBeenCalled();
    });

    it('should log warning on bad zipped url', () => {
      spyOn(console, 'warn');
      spyOn(console, 'error');
      expect(() => {
        service.updateState(new NavigationEnd(2, '/#z=test', '/#z=test'));
      }).toThrow();
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('should unzip empty v0', () => {
      const url = '/#z=eJwrsAUAAR8Arg==';
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p=', {} as any);
    });

    it('should unzip v0', () => {
      spyOn(contentSvc, 'confirm');
      const url =
        '/#z=eJxtUNsKwyAM.Zr5EHDUFsZeZC.7j6E2toJVp3ZjL.v2dbSD2pUQyOXk5CSBp4xo' +
        'qeoxZWDAyL2sEMkZMRtUjsKl4GOmEm0GJWLn6VN03pFYQEVKOEhrXEcHoXrjkNaAWqPK' +
        '5mHyiw6-HS2-.0vTlhQQ2x9inYBEobyDuqqATX4mmjMIcWpueIupknEhue1JvM036DE6' +
        'oZAkzo4VHJrrzuleWGBfIc1pUTPb6ieg7WjaJb58AJs7glk_';
      (router.events as any).next(new NavigationEnd(2, url, url));

      const mockStateV0: App.PartialState = {
        ...mockState,
        ...{ settingsState: { ...mockState.settingsState } },
      };
      delete mockStateV0.settingsState?.beaconReceivers;
      delete mockStateV0.settingsState?.researchedTechnologyIds;
      delete mockStateV0.settingsState?.maximizeType;
      mockStateV0.settingsState!.costs = {};
      delete mockStateV0.settingsState?.proliferatorSprayId;
      delete mockStateV0.settingsState?.netProductionOnly;
      delete mockStateV0.settingsState?.surplusMachinesOutput;
      expect(service.dispatch).toHaveBeenCalledWith(
        'p=steel-chest*1*1&q=steel-chest*1&b=1&i=steel-chest*1*transport-belt' +
          '*cargo-wagon&r=steel-chest*assembling-machine-2*effectivity-module' +
          '~effectivity-module*1*speed-module~speed-module*beacon*200*100*8&f' +
          '=1*productivity-module~speed-module*1*speed-module*beacon_assembli' +
          'ng-machine-2_steel-furnace&s=1.0*%3D*1*transport-belt*coal*1200*36' +
          '00*100*0*0*0*cargo-wagon*fluid-wagon*?',
        mockStateV0,
      );
      expect(contentSvc.confirm).toHaveBeenCalled(); // Log warning for expensive field
    });

    it('should unzip empty v1', () => {
      const v1Empty = 'p=&v=1';
      const url = `/?${v1Empty}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(v1Empty, {} as any);
    });

    it('should unzip v1', () => {
      spyOn(contentSvc, 'confirm');
      const v1Full =
        'p=steel-chest*1*1&i=steel-chest*1*transport-belt*cargo-wagon&r=steel' +
        '-chest*assembling-machine-2*effectivity-module~effectivity-module*1*' +
        'speed-module~speed-module*beacon*200*100*8&f=1*productivity-module~s' +
        'peed-module*1*speed-module*beacon_assembling-machine-2_steel-furnace' +
        '&s=1.0*2*1*=*transport-belt*coal*1200*100*0*0*0*1*cargo-wagon*fluid-' +
        'wagon*?*2*10*0*100*1*productivity-module&v=1';
      const url = `/?${v1Full}`;
      (router.events as any).next(new NavigationEnd(2, url, url));

      const mockStateV1: App.PartialState = {
        ...mockState,
        ...{
          settingsState: {
            ...mockState.settingsState,
            ...{ costs: { ...mockState.settingsState.costs } },
          },
        },
      };
      delete mockStateV1.settingsState?.netProductionOnly;
      delete mockStateV1.settingsState?.researchedTechnologyIds;
      delete mockStateV1.settingsState?.maximizeType;
      delete mockStateV1.settingsState?.costs?.surplus;
      delete mockStateV1.settingsState?.costs?.maximize;
      delete mockStateV1.settingsState?.costs?.footprint;
      delete mockStateV1.settingsState?.surplusMachinesOutput;
      expect(service.dispatch).toHaveBeenCalledWith(v1Full, mockStateV1);
      expect(contentSvc.confirm).toHaveBeenCalled(); // Log warning for expensive field
    });

    it('should unzip empty v2', () => {
      const url = '/?z=eJwrUCszAgADVAE.';
      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v2', {} as any);
    });

    it('should unzip v2', () => {
      spyOn(contentSvc, 'confirm');
      const url =
        '/?z=eJwdjLEKgDAMRP8mw01NB3ERSVpwFj-g4CCIiyjo1m.3KuGSXI6XM3VQqKwu-78m' +
        'mFzZ4bBq7FOdYIghQKleNkXmiQGseJnljqSGxmF54QdnYCkaPYLpb9sDZHniBxSMGkU_';

      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      (router.events as any).next(new NavigationEnd(2, url, url));
      const mockStateV2: App.PartialState = {
        ...mockState,
        ...{
          settingsState: {
            ...mockState.settingsState,
            ...{ costs: { ...mockState.settingsState.costs } },
          },
        },
      };
      delete mockStateV2.settingsState?.netProductionOnly;
      delete mockStateV2.settingsState?.researchedTechnologyIds;
      delete mockStateV2.settingsState?.maximizeType;
      delete mockStateV2.settingsState?.costs?.surplus;
      delete mockStateV2.settingsState?.costs?.maximize;
      delete mockStateV2.settingsState?.costs?.footprint;
      delete mockStateV2.settingsState?.surplusMachinesOutput;
      expect(service.dispatch).toHaveBeenCalledWith(
        'pC6*1*1&bB&iC6*1*C*A&rDB*B*A~A*B*G~G*A*200*100*8&f1*D~G*B*G*A_B_Q&s2' +
          '*1*=*C*A*Sw*Bk*A*0*0*1*A*B*?*2*10*0*100*1*D&v2',
        mockStateV2,
      );
      expect(contentSvc.confirm).toHaveBeenCalled(); // Log warning for expensive field
    });

    it('should unzip empty v3', () => {
      const url = '/?z=eJwrUCszBgADVQFA';
      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v3', {} as any);
    });

    it('should unzip v3', () => {
      spyOn(contentSvc, 'confirm');
      const url =
        '/?z=eJwdjL0KgEAMg9-mQ6brCeIi0t6Bs.gABw6CuPgDuvnsRilt-BLSLdVQqOzZeSeX' +
        '5TcSTA5aDnuM3D89DDEEKLeRWZFpMYAVL4OckdB-PYw3fKUGjlIdHZj--D1Alqt6AbeM' +
        'G5w_';

      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      (router.events as any).next(new NavigationEnd(2, url, url));

      const mockStateV3: App.PartialState = {
        ...mockState,
        ...{
          settingsState: {
            ...mockState.settingsState,
            ...{ costs: { ...mockState.settingsState.costs } },
          },
        },
      };
      delete mockStateV3.settingsState?.netProductionOnly;
      delete mockStateV3.settingsState?.researchedTechnologyIds;
      delete mockStateV3.settingsState?.maximizeType;
      delete mockStateV3.settingsState?.costs?.surplus;
      delete mockStateV3.settingsState?.costs?.maximize;
      delete mockStateV3.settingsState?.costs?.footprint;
      delete mockStateV3.settingsState?.surplusMachinesOutput;

      expect(service.dispatch).toHaveBeenCalledWith(
        'pC6*1*1&qDB*1&bB&iC6*1*C*A&rDB*B*A~A*1*G~G*A*200*100*8&f1*D~G*1*G*A_' +
          'B_Q&s2*1*=*C*A*Sw*Bk*A*0*0*1*A*B*?*2*10*0*100*1*D&v3',
        mockStateV3,
      );
      expect(contentSvc.confirm).toHaveBeenCalled(); // Log warning for expensive field
    });

    it('should unzip empty v4', () => {
      const v4Empty = 'p=&v=4';
      const url = `/?${v4Empty}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(v4Empty, {} as any);
    });

    it('should unzip v4', () => {
      const v4Full =
        'p=steel-chest*1*1&q=steel-chest*1&i=steel-chest*1*transport-belt*car' +
        'go-wagon&r=steel-chest*assembling-machine-2*effectivity-module~effec' +
        'tivity-module*1*speed-module~speed-module*beacon*200*100*8&f=1*produ' +
        'ctivity-module~speed-module*1*speed-module*beacon_assembling-machine' +
        '-2_steel-furnace&s=1.0*2*1*%3D*transport-belt*coal*1200*100*0*0*0*ca' +
        'rgo-wagon*fluid-wagon**2*10*0*100*1*productivity-module&v=4';
      const url = `/?${v4Full}`;
      (router.events as any).next(new NavigationEnd(2, url, url));

      const mockStateV4: App.PartialState = {
        ...mockState,
        ...{
          settingsState: {
            ...mockState.settingsState,
            ...{ costs: { ...mockState.settingsState.costs } },
          },
        },
      };
      delete mockStateV4.settingsState?.netProductionOnly;
      delete mockStateV4.settingsState?.researchedTechnologyIds;
      delete mockStateV4.settingsState?.maximizeType;
      delete mockStateV4.settingsState?.costs?.surplus;
      delete mockStateV4.settingsState?.costs?.maximize;
      delete mockStateV4.settingsState?.costs?.footprint;
      delete mockStateV4.settingsState?.surplusMachinesOutput;

      expect(service.dispatch).toHaveBeenCalledWith(v4Full, mockStateV4);
    });

    it('should unzip empty v5', () => {
      const url = '/?z=eJwrUCszBQADVwFC&v=5';
      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v5', {} as any);
    });

    it('should unzip v5', () => {
      const url =
        '/?z=eJwdjDsKgDAQRG-zxVRJQLGx2E0gtXiAgIUgNn5Au5zdiSz7mTfMHrGHh5czGedi' +
        'sv0gQuUiMmhV6lwzFME5ePYgq0ciogEtVia5A8XYcphf2M7tWMoPoNXulmRMnu4DZYwb' +
        'BA__&v=5';

      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      (router.events as any).next(new NavigationEnd(2, url, url));

      const mockStateV5: App.PartialState = {
        ...mockState,
        ...{
          settingsState: {
            ...mockState.settingsState,
            ...{ costs: { ...mockState.settingsState.costs } },
          },
        },
      };
      delete mockStateV5.settingsState?.netProductionOnly;
      delete mockStateV5.settingsState?.researchedTechnologyIds;
      delete mockStateV5.settingsState?.maximizeType;
      delete mockStateV5.settingsState?.costs?.surplus;
      delete mockStateV5.settingsState?.costs?.maximize;
      delete mockStateV5.settingsState?.costs?.footprint;
      delete mockStateV5.settingsState?.surplusMachinesOutput;

      expect(service.dispatch).toHaveBeenCalledWith(
        'pC6*1*1&qDB*1&bB&iC6*1*C*A&rDB*B*A~A*1*G~G*A*200*100*8&f1*D~G*1*G*A_' +
          'B_Q&s2*1*=*C*A*Sw*Bk*A*0*0*A*B**2*10*0*100*1*D&v5',
        mockStateV5,
      );
    });

    it('should unzip empty v6', () => {
      const v6Empty = 'p=&v=6';
      const url = `/?${v6Empty}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(v6Empty, {} as any);
    });

    it('should unzip v6', () => {
      const v6Full =
        'p=steel-chest*1*1&q=steel-chest*1&e=1*speed-module~speed-module*beac' +
        'on*8&i=steel-chest*1*transport-belt*cargo-wagon&r=steel-chest*assemb' +
        'ling-machine-2*effectivity-module~effectivity-module*0*200*100&f=1*p' +
        'roductivity-module~speed-module*1*speed-module*beacon_assembling-mac' +
        'hine-2_steel-furnace&s=1.0*2*1*%3D*transport-belt*coal*1200*100*0*0*' +
        '0*cargo-wagon*fluid-wagon**2*10*0*100*1*productivity-module*1&v=6';
      const url = `/?${v6Full}`;
      (router.events as any).next(new NavigationEnd(2, url, url));

      const mockStateV6: App.PartialState = {
        ...mockState,
        ...{
          settingsState: {
            ...mockState.settingsState,
            ...{ costs: { ...mockState.settingsState.costs } },
          },
        },
      };
      // delete mockStateV6.settingsState?.netProductionOnly;
      delete mockStateV6.settingsState?.researchedTechnologyIds;
      delete mockStateV6.settingsState?.maximizeType;
      delete mockStateV6.settingsState?.costs?.surplus;
      delete mockStateV6.settingsState?.costs?.maximize;
      delete mockStateV6.settingsState?.costs?.footprint;
      delete mockStateV6.settingsState?.surplusMachinesOutput;

      expect(service.dispatch).toHaveBeenCalledWith(v6Full, mockStateV6);
    });

    it('should unzip empty v7', () => {
      const url = '/?z=eJwrUCszBwADWQFE&v=7';
      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v7', {} as any);
    });

    it('should unzip v7', () => {
      const url =
        '/?z=eJwdjbEKg1AMRf8mw5kSB-3ikPjAWfwAoWChdGkr6Oa3m-dyueGcS75Di2HyK5G5' +
        'GuM54jzkGfK-2YDLP2ngp6M0qpiqvIySbi7wJZZJtiaPvvrMB.Gh2poZkKh2q1tKftq7' +
        'C.WaHBw_&v=7';

      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      (router.events as any).next(new NavigationEnd(2, url, url));

      const mockStateV7: App.PartialState = {
        ...mockState,
        ...{
          settingsState: {
            ...mockState.settingsState,
            ...{ costs: { ...mockState.settingsState.costs } },
          },
        },
      };
      delete mockStateV7.settingsState?.researchedTechnologyIds;
      delete mockStateV7.settingsState?.maximizeType;
      delete mockStateV7.settingsState?.costs?.surplus;
      delete mockStateV7.settingsState?.costs?.maximize;
      delete mockStateV7.settingsState?.costs?.footprint;
      delete mockStateV7.settingsState?.surplusMachinesOutput;

      expect(service.dispatch).toHaveBeenCalledWith(
        'pC6*1*1&qDB*1&e1*G~G*A*8&bB&iC6*1*C*A&rDB*B*A~A*0*200*100&f1*D~G*1*G' +
          '*A_B_Q&s2*1*=*C*A*Sw*Bk*A*0*0*A*B**2*10*0*100*1*D*1&v7',
        mockStateV7,
      );
    });

    it('should unzip empty v8', () => {
      const url = '/?z=eJwrUCuzAAADWgFF&v=8';
      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v8', {} as any);
    });

    it('should unzip v8', () => {
      const url =
        '/?z=eJwli0EKwlAMRG-TxYNC0kXpTpIWuhYPUBAUxI0o2F3P3vkayAwM772mgSDsFiz7' +
        'QjLatezxWyfS3nNBkXvi9O6Eu92DWbAUcq31bJ8T.V.gslFPGu1KyWL12YC2yVd2Kp19' +
        'xwOrTh0O&v=8';

      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      (router.events as any).next(new NavigationEnd(2, url, url));

      const mockStateV8: App.PartialState = {
        ...mockState,
        ...{
          settingsState: {
            ...mockState.settingsState,
            ...{ costs: { ...mockState.settingsState.costs } },
          },
        },
      };
      delete mockStateV8.settingsState?.surplusMachinesOutput;
      delete mockStateV8.settingsState?.costs?.footprint;

      expect(service.dispatch).toHaveBeenCalledWith(
        'pC6*1*1&e1*G~G*A*8&bB&iC6*1*C*A&rDB**B*A~A*0*200*100&f1*D~G*1*G*A_B_' +
          'Q&s?*2*1*C*A*Sw*Bk*A*0*0*A*B**1*D*1*A*2*10*0*100*0*-100000&v8',
        mockStateV8,
      );
    });
  });

  describe('dispatch', () => {
    it('should dispatch a state', () => {
      spyOn(mockStore, 'dispatch');
      service.dispatch('test', mockState);
      expect(service.zip).toEqual('test');
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        new App.LoadAction(mockState),
      );
    });
  });

  describe('migrate', () => {
    it('should return latest version without alteration', () => {
      const originalParams = { [Section.Version]: ZipVersion.Version9 };
      const { params } = service.migrate({ ...originalParams }, false);
      expect(params).toEqual(originalParams);
    });
  });

  describe('migrateV0', () => {
    it('should handle unrecognized/null baseid', () => {
      const { params } = service.migrateV0({
        params: { [Section.Settings]: '---' },
        warnings: [],
        isBare: true,
      });
      expect(params[Section.Settings]).toEqual(NULL);
    });

    it('should handle preset without other settings', () => {
      const { params } = service.migrateV0({
        params: { [Section.Mod]: '0' },
        warnings: [],
        isBare: true,
      });
      expect(params[Section.Settings]).toEqual('?**?*0');
    });
  });

  describe('migrateV2', () => {
    it('should handle undefined beaconCount', () => {
      const { params } = service.migrateV2({
        params: {
          [Section.Recipes]: '***?',
          [Section.Machines]: '**?',
        },
        warnings: [],
        isBare: false,
      });
      expect(params[Section.Recipes]).toEqual('');
      expect(params[Section.Machines]).toEqual('');
    });
  });

  describe('migrateV6', () => {
    it('should convert item objectives by machines into recipe objectives', () => {
      const { params } = service.migrateV6({
        params: {
          [Section.Objectives]: 'coal*1*3',
        },
        warnings: [],
        isBare: true,
      });
      expect(params[Section.Objectives]).toEqual('');
      expect(params[Section.RecipeObjectives]).toEqual('coal*1');
    });

    it('should convert item objective by machines with limit step into maximize / limit recipe objectives', () => {
      const { params } = service.migrateV6({
        params: {
          [Section.Objectives]: 'iron-plate*1*3*iron-ore',
          [Section.RecipeObjectives]: 'coal*1',
        },
        warnings: [],
        isBare: true,
      });
      expect(params[Section.Objectives]).toEqual('');
      expect(params[Section.RecipeObjectives]).toEqual(
        'coal*1_iron-plate*1*2_iron-ore*1*3',
      );
    });

    it('should convert item objective with limit step into maximize / limit item objectives', () => {
      const { params } = service.migrateV6({
        params: {
          [Section.Objectives]: 'iron-plate*1**iron-ore',
        },
        warnings: [],
        isBare: true,
      });
      expect(params[Section.Objectives]).toEqual(
        'iron-plate*1**2_iron-ore*1**3',
      );
    });

    it('should remove item default recipe', () => {
      const { params } = service.migrateV6({
        params: {
          [Section.Items]: 'coal*1*transport-belt*cargo-wagon*coal',
        },
        warnings: [],
        isBare: true,
      });
      expect(params[Section.Items]).toEqual(
        'coal*1*transport-belt*cargo-wagon',
      );
    });

    it('should convert disabled recipes into excluded recipes', () => {
      const { params } = service.migrateV6({
        params: {
          [Section.Settings]: '***coal',
        },
        warnings: [],
        isBare: true,
      });
      expect(params[Section.Settings]).toEqual('');
      expect(params[Section.Recipes]).toEqual('coal*1');
    });

    it('should convert disabled recipes into excluded recipes on existing recipe settings', () => {
      const { params } = service.migrateV6({
        params: {
          [Section.Settings]: '***coal',
          [Section.Recipes]: 'coal*electric-mining-drill',
        },
        warnings: [],
        isBare: true,
      });
      expect(params[Section.Settings]).toEqual('');
      expect(params[Section.Recipes]).toEqual('coal*1*electric-mining-drill');
    });
  });

  describe('migrateV7', () => {
    it('should convert hashed objectives by machines to use items', () => {
      const { params } = service.migrateV7({
        params: {
          [Section.Objectives]: 'Dc*1*3',
          [Section.Settings]: '0**=*A**Po**A*0',
          [Section.Version]: '7',
        },
        warnings: [],
        isBare: false,
      });
      expect(params[Section.Objectives]).toEqual('Dc*1*0');
    });
  });

  describe('migrateV8', () => {
    it('should convert recipe objectives to unified objectives', () => {
      const { params } = service.migrateV8({
        params: {
          [Section.Objectives]: 'steel-chest*1*1',
          [Section.RecipeObjectives]: 'steel-chest*1',
        },
        warnings: [],
        isBare: true,
      });

      expect(params[Section.Objectives]).toEqual(
        'steel-chest*1*1_steel-chest*1*3',
      );
    });
  });

  describe('zipBeacons', () => {
    it('should generate maps for objective and recipe beacons', () => {
      const beacons: BeaconSettings[] = [
        {
          count: '1',
          id: ItemId.Beacon,
          moduleIds: [ItemId.SpeedModule, ItemId.SpeedModule],
        },
      ];
      const result = service.zipBeacons(
        [
          {
            id: '0',
            targetId: RecipeId.IronPlate,
            value: '1',
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Output,
            beacons,
          },
        ],
        { [RecipeId.IronPlate]: { beacons } },
        Mocks.Hash,
      );
      expect(result.objectives).toEqual(service.empty);
      expect(result.config).toEqual({
        bare: '&e=1*speed-module~speed-module*beacon',
        hash: '&e1*G~G*A',
      });
      expect(result.objectiveBeaconMap).toEqual({ ['0']: [0] });
      expect(result.recipeBeaconMap).toEqual({ [RecipeId.IronPlate]: [0] });
    });
  });

  describe('zipObjectives', () => {
    it('should handle RateUnit Items', () => {
      const zip = mockZipData();
      service.zipObjectives(
        zip,
        [
          {
            id: '0',
            targetId: ItemId.SteelChest,
            value: '1',
            unit: ObjectiveUnit.Items,
            type: ObjectiveType.Output,
          },
        ],
        Mocks.Hash,
      );
      expect(zip.objectives).toEqual({
        bare: 'p=steel-chest*1',
        hash: 'pC6*1',
      });
    });

    it('should handle RateUnit Belts', () => {
      const zip = mockZipData();
      service.zipObjectives(
        zip,
        [
          {
            id: '0',
            targetId: ItemId.SteelChest,
            value: '1',
            unit: ObjectiveUnit.Belts,
            type: ObjectiveType.Output,
          },
        ],
        Mocks.Hash,
      );
      expect(zip.objectives).toEqual({
        bare: 'p=steel-chest*1*1',
        hash: 'pC6*1*1',
      });
    });

    it('should handle RateUnit Wagons', () => {
      const zip = mockZipData();
      service.zipObjectives(
        zip,
        [
          {
            id: '0',
            targetId: ItemId.SteelChest,
            value: '1',
            unit: ObjectiveUnit.Wagons,
            type: ObjectiveType.Output,
          },
        ],
        Mocks.Hash,
      );
      expect(zip.objectives).toEqual({
        bare: 'p=steel-chest*1*2',
        hash: 'pC6*1*2',
      });
    });

    it('should handle RateUnit Machines', () => {
      const zip = mockZipData();
      service.zipObjectives(
        zip,
        [
          {
            id: '0',
            targetId: RecipeId.SteelChest,
            value: '1',
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Output,
          },
        ],
        Mocks.Hash,
      );
      expect(zip.objectives).toEqual({
        bare: 'p=steel-chest*1*3',
        hash: 'pDB*1*3',
      });
    });
  });

  describe('unzipObjectives', () => {
    it('bare should unzip', () => {
      const result = service.unzipObjectives(
        {
          ['p']: 'steel-chest*1*1',
        },
        [],
      );
      expect(result).toEqual({
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            targetId: ItemId.SteelChest,
            value: '1',
            unit: ObjectiveUnit.Belts,
            type: ObjectiveType.Output,
          },
        },
        index: 2,
      });
    });

    it('hash should map values to empty strings if null', () => {
      const result = service.unzipObjectives(
        { ['p']: '*1**Bd' },
        [],
        Mocks.Hash,
      );
      expect(result).toEqual({
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            targetId: '',
            value: '1',
            unit: ObjectiveUnit.Items,
            type: ObjectiveType.Output,
          },
        },
        index: 2,
      });
    });

    it('bare should map beacons', () => {
      const result = service.unzipObjectives({ ['p']: '*1*3****0' }, []);
      expect(result).toEqual({
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            targetId: '',
            value: '1',
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Output,
            beacons: [{}],
          },
        },
        index: 2,
      });
    });

    it('hash should map beacons', () => {
      const result = service.unzipObjectives(
        { ['p']: '*1*3****0' },
        [],
        Mocks.Hash,
      );
      expect(result).toEqual({
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            targetId: '',
            value: '1',
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Output,
            beacons: [{}],
          },
        },
        index: 2,
      });
    });
  });

  describe('unzipItems', () => {
    it('should remove unspecified fields', () => {
      const result = service.unzipItems({
        ['i']: 'steel-chest*1*transport-belt*',
      });
      expect(result).toEqual({
        [ItemId.SteelChest]: { excluded: true, beltId: ItemId.TransportBelt },
      });
    });

    it('hash should map id to empty string if null', () => {
      const result = service.unzipItems({ ['i']: '*1*C*' }, Mocks.Hash);
      expect(result).toEqual({
        ['']: { excluded: true, beltId: ItemId.TransportBelt },
      });
    });
  });

  describe('unzipRecipes', () => {
    it('should remove unspecified fields', () => {
      const result = service.unzipRecipes(
        {
          ['r']: 'steel-chest**assembling-machine-2*',
        },
        [],
      );
      expect(result).toEqual({
        [RecipeId.SteelChest]: { machineId: ItemId.AssemblingMachine2 },
      });
    });

    it('hash should map values to empty strings if null', () => {
      const result = service.unzipRecipes({ ['r']: '**A*' }, [], Mocks.Hash);
      expect(result).toEqual({
        ['']: { machineId: ItemId.AssemblingMachine1 },
      });
    });

    it('bare should map beacons', () => {
      const result = service.unzipRecipes({ ['r']: 'iron-plate****0' }, []);
      expect(result).toEqual({
        [ItemId.IronPlate]: {
          beacons: [{}],
        },
      });
    });

    it('hash should map beacons', () => {
      const result = service.unzipRecipes({ ['r']: 'B****0' }, [], Mocks.Hash);
      expect(result).toEqual({
        [RecipeId.AdvancedCircuit]: {
          beacons: [{}],
        },
      });
    });
  });

  describe('zipMachines', () => {
    it('should handle null ids', () => {
      const zip = mockZipData();
      service.zipMachines(
        zip,
        {
          ids: undefined,
          entities: { ['']: {} },
        },
        Mocks.Hash,
      );
      expect(zip.config).toEqual({ bare: '', hash: '' });
    });
  });

  describe('unzipMachines', () => {
    it('bare should unzip empty ids', () => {
      const result = service.unzipMachines({ ['f']: '_' });
      expect(result).toEqual({
        ids: undefined,
        entities: {},
      });
    });

    it('hash should unzip empty ids', () => {
      const result = service.unzipMachines({ ['f']: '_' }, Mocks.Hash);
      expect(result).toEqual({
        ids: undefined,
        entities: {},
      });
    });

    it('hash should map values to empty strings if null', () => {
      const result = service.unzipMachines({ ['f']: '1_?**1' }, Mocks.Hash);
      expect(result).toEqual({
        ids: [''],
        entities: { ['']: { beaconCount: '1' } },
      });
    });
  });

  describe('zipList', () => {
    it('should zip a list of strings', () => {
      expect(service.zipList([mockZip, mockZip])).toEqual({
        bare: encodeURIComponent(mockZip.bare + '_' + mockZip.bare),
        hash: mockZip.hash + '_' + mockZip.hash,
      });
    });
  });

  describe('zipFields', () => {
    it('should zip a list of fields', () => {
      expect(service.zipFields(['a', 'b', '', ''])).toEqual('a*b');
    });
  });

  describe('zipTruthyString', () => {
    it('should handle falsy', () => {
      expect(service.zipTruthyString(undefined)).toEqual('');
    });

    it('should handle truthy', () => {
      expect(service.zipTruthyString('a')).toEqual('a');
    });
  });

  describe('zipTruthyNum', () => {
    it('should handle falsy', () => {
      expect(service.zipTruthyNumber(undefined)).toEqual('');
    });

    it('should handle truthy', () => {
      expect(service.zipTruthyNumber(1)).toEqual('1');
    });
  });

  describe('zipTruthyBool', () => {
    it('should handle falsy', () => {
      expect(service.zipTruthyBool(undefined)).toEqual('');
    });

    it('should handle false', () => {
      expect(service.zipTruthyBool(false)).toEqual(FALSE);
    });

    it('should handle true', () => {
      expect(service.zipTruthyBool(true)).toEqual(TRUE);
    });
  });

  describe('zipTruthyArray', () => {
    it('should handle falsy', () => {
      expect(service.zipTruthyArray(undefined)).toEqual('');
    });

    it('should handle empty', () => {
      expect(service.zipTruthyArray([])).toEqual(EMPTY);
    });

    it('should handle truthy', () => {
      expect(service.zipTruthyArray(['a'])).toEqual('a');
    });
  });

  describe('zipTruthyNArray', () => {
    it('should handle falsy', () => {
      expect(service.zipTruthyNArray(undefined, [])).toEqual('');
    });

    it('should handle empty', () => {
      expect(service.zipTruthyNArray([], [])).toEqual(EMPTY);
    });

    it('should handle truthy', () => {
      expect(service.zipTruthyNArray(['a'], ['a'])).toEqual('A');
    });
  });

  describe('zipDiffString', () => {
    it('should handle default', () => {
      expect(service.zipDiffString('a', 'a')).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffString(undefined, 'a')).toEqual(NULL);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffString('a', 'b')).toEqual('a');
    });
  });

  describe('zipDiffNumber', () => {
    it('should handle default', () => {
      expect(service.zipDiffNumber(0, 0)).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffNumber(undefined, 0)).toEqual(NULL);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffNumber(0, 1)).toEqual('0');
    });
  });

  describe('zipDiffDisplayRate', () => {
    it('should handle default', () => {
      expect(
        service.zipDiffDisplayRate(
          DisplayRate.PerMinute,
          DisplayRate.PerMinute,
        ),
      ).toEqual('');
    });

    it('should handle falsy', () => {
      expect(
        service.zipDiffDisplayRate(undefined, DisplayRate.PerMinute),
      ).toEqual(NULL);
    });

    it('should handle truthy', () => {
      expect(
        service.zipDiffDisplayRate(DisplayRate.PerSecond, undefined),
      ).toEqual('0');
      expect(
        service.zipDiffDisplayRate(DisplayRate.PerMinute, undefined),
      ).toEqual('1');
      expect(
        service.zipDiffDisplayRate(DisplayRate.PerHour, undefined),
      ).toEqual('2');
    });
  });

  describe('zipDiffBool', () => {
    it('should handle default', () => {
      expect(service.zipDiffBool(false, false)).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffBool(undefined, false)).toEqual(NULL);
    });

    it('should handle true/false', () => {
      expect(service.zipDiffBool(false, true)).toEqual(FALSE);
      expect(service.zipDiffBool(true, false)).toEqual(TRUE);
    });
  });

  describe('zipDiffNullableArray', () => {
    it('should handle default', () => {
      expect(service.zipDiffNullableArray(['a', 'b'], ['b', 'a'])).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffNullableArray(undefined, [])).toEqual(NULL);
      expect(service.zipDiffNullableArray([], undefined)).toEqual(EMPTY);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffNullableArray(['b', 'a'], ['a', 'c'])).toEqual(
        'a~b',
      );
    });
  });

  describe('zipDiffRank', () => {
    it('should handle default', () => {
      expect(service.zipDiffRank(['a', 'b'], ['a', 'b'])).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffRank(undefined, [])).toEqual(NULL);
      expect(service.zipDiffRank([], undefined)).toEqual(EMPTY);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffRank(['a', 'b'], ['b', 'a'])).toEqual('a~b');
    });
  });

  describe('zipDiffNString', () => {
    it('should handle default', () => {
      expect(service.zipDiffNString('a', 'a', [])).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffNString(undefined, 'a', [])).toEqual(NULL);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffNString('a', 'b', ['a'])).toEqual('A');
    });
  });

  describe('zipDiffNNumber', () => {
    it('should handle default', () => {
      expect(service.zipDiffNNumber(0, 0)).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffNNumber(undefined, 0)).toEqual(NULL);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffNNumber(0, 1)).toEqual('A');
    });
  });

  describe('zipDiffNullableNArray', () => {
    it('should handle default', () => {
      expect(service.zipDiffNullableNArray(['a', 'b'], ['b', 'a'], [])).toEqual(
        '',
      );
    });

    it('should handle falsy', () => {
      expect(service.zipDiffNullableNArray(undefined, [], [])).toEqual(NULL);
      expect(service.zipDiffNullableNArray([], undefined, [])).toEqual(EMPTY);
    });

    it('should handle truthy', () => {
      expect(
        service.zipDiffNullableNArray(['b', 'a'], ['a', 'c'], ['a', 'b']),
      ).toEqual('A~B');
    });
  });

  describe('zipDiffNRank', () => {
    it('should handle default', () => {
      expect(service.zipDiffNRank(['a', 'b'], ['a', 'b'], [])).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffNRank(undefined, [], [])).toEqual(NULL);
      expect(service.zipDiffNRank([], undefined, [])).toEqual(EMPTY);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffNRank(['b', 'a'], ['a', 'c'], ['a', 'b'])).toEqual(
        'B~A',
      );
    });
  });

  describe('parseString', () => {
    it('should handle undefined', () => {
      expect(service.parseString(undefined)).toBeUndefined();
      expect(service.parseString(undefined)).toBeUndefined();
      expect(service.parseString('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseString(NULL)).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseString('a')).toEqual('a');
    });
  });

  describe('parseBool', () => {
    it('should handle undefined', () => {
      expect(service.parseBool(undefined)).toBeUndefined();
      expect(service.parseBool('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseBool(NULL)).toBeUndefined();
    });

    it('should parse false', () => {
      expect(service.parseBool(FALSE)).toBeFalse();
    });

    it('should parse true', () => {
      expect(service.parseBool(TRUE)).toBeTrue();
    });
  });

  describe('parseNumber', () => {
    it('should handle undefined', () => {
      expect(service.parseNumber(undefined)).toBeUndefined();
      expect(service.parseNumber('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseNumber(NULL)).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseNumber('1')).toEqual(1);
    });
  });

  describe('parseDisplayRate', () => {
    it('should handle undefined', () => {
      expect(service.parseDisplayRate(undefined)).toBeUndefined();
      expect(service.parseDisplayRate('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseDisplayRate(NULL)).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseDisplayRate('0')).toEqual(DisplayRate.PerSecond);
      expect(service.parseDisplayRate('1')).toEqual(DisplayRate.PerMinute);
      expect(service.parseDisplayRate('2')).toEqual(DisplayRate.PerHour);
    });

    it('should return null if unrecognized', () => {
      expect(service.parseDisplayRate('3')).toBeUndefined();
    });
  });

  describe('parseArray', () => {
    it('should handle undefined', () => {
      expect(service.parseArray(undefined)).toBeUndefined();
      expect(service.parseArray('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseArray(NULL)).toBeUndefined();
    });

    it('should parse empty', () => {
      expect(service.parseArray(EMPTY)).toEqual([]);
    });

    it('should parse value', () => {
      expect(service.parseArray('a~b')).toEqual(['a', 'b']);
    });
  });

  describe('parseNString', () => {
    it('should handle undefined', () => {
      expect(service.parseNString(undefined, [])).toBeUndefined();
      expect(service.parseNString('', [])).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseNString(NULL, [])).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseNString('A', ['a'])).toEqual('a');
    });
  });

  describe('parseNNumber', () => {
    it('should handle undefined', () => {
      expect(service.parseNNumber(undefined)).toBeUndefined();
      expect(service.parseNNumber('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseNNumber(NULL)).toBeUndefined();
    });

    it('should parse value', () => {
      expect(service.parseNNumber('A')).toEqual(0);
    });
  });

  describe('parseNArray', () => {
    it('should handle undefined', () => {
      expect(service.parseNArray(undefined, [])).toBeUndefined();
      expect(service.parseNArray('', [])).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseNArray(NULL, [])).toBeUndefined();
    });

    it('should parse empty', () => {
      expect(service.parseNArray(EMPTY, [])).toEqual([]);
    });

    it('should parse value', () => {
      expect(service.parseNArray('A~B', ['a', 'b'])).toEqual(['a', 'b']);
    });
  });

  describe('parseNullableNArray', () => {
    it('should handle undefined', () => {
      expect(service.parseNullableNArray(undefined, [])).toBeUndefined();
      expect(service.parseNullableNArray('', [])).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseNullableNArray(NULL, [])).toBeNull();
    });

    it('should parse empty', () => {
      expect(service.parseNullableNArray(EMPTY, [])).toEqual([]);
    });

    it('should parse value', () => {
      expect(service.parseNullableNArray('A~B', ['a', 'b'])).toEqual([
        'a',
        'b',
      ]);
    });
  });

  describe('getId', () => {
    it('should convert n to id', () => {
      expect(service.getId(600)).toEqual('JY');
    });
  });

  describe('getN', () => {
    it('should convert id to n', () => {
      expect(service.getN('JY')).toEqual(600);
    });
  });

  describe('getBase64Code', () => {
    it('should check charCode validity', () => {
      expect(() => service.getBase64Code(257)).toThrowError(
        'Unable to parse base64 string.',
      );
    });

    it('should check code validity', () => {
      expect(() => service.getBase64Code(0)).toThrowError(
        'Unable to parse base64 string.',
      );
    });

    it('should return a valid code', () => {
      expect(service.getBase64Code(45)).toEqual(62);
    });
  });

  describe('bytesToBase64', () => {
    it('should convert Uint8array to string', () => {
      const z = 'abcdefghij';
      const result = service.bytesToBase64(deflate(z));
      expect(result).toEqual('eJxLTEpOSU1Lz8jMAgAVhgP4');
    });

    it('should handle trailing octets', () => {
      expect(service.bytesToBase64(deflate('aa'))).toEqual('eJxLTAQAASUAww__');
      expect(service.bytesToBase64(deflate('aaa'))).toEqual('eJxLTEwEAAJJASQ_');
    });
  });

  describe('inflateSafe', () => {
    it('should attempt to mend a bad zip', () => {
      spyOn(console, 'warn');
      spyOn(service, 'inflateMend').and.callThrough();
      expect(() => service.inflateSafe('abcde')).toThrow();
      expect(console.warn).toHaveBeenCalled();
      expect(service.inflateMend).toHaveBeenCalledTimes(3);
    });
  });

  describe('inflateMend', () => {
    it('should attempt to inflate the zip and warn if successful', () => {
      spyOn(console, 'warn');
      expect(service.inflateMend('eJxLTAQAASUAww_', '_')).toEqual('aa');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should assume failure if return is empty/null', () => {
      spyOn(service, 'inflate').and.returnValue('');
      expect(() => service.inflateMend('eJxLTAQAASUAww_', '_')).toThrow();
    });
  });

  describe('base64ToBytes', () => {
    it('should check for invalid string length', () => {
      expect(() => service.base64ToBytes('aaa')).toThrowError(
        'Unable to parse base64 string.',
      );
    });

    it('should check for invalid missing octets', () => {
      expect(() => service.base64ToBytes('_aaa')).toThrowError(
        'Unable to parse base64 string.',
      );
    });

    it('should handle trailing octets', () => {
      expect(
        inflate(service.base64ToBytes('eJxLTAQAASUAww__'), { to: 'string' }),
      ).toEqual('aa');
      expect(
        inflate(service.base64ToBytes('eJxLTEwEAAJJASQ_'), { to: 'string' }),
      ).toEqual('aaa');
    });

    it('should convert string to bytes', () => {
      const result = inflate(
        service.base64ToBytes('eJxLTEpOSU1Lz8jMAgAVhgP4'),
        { to: 'string' },
      );
      expect(result).toEqual('abcdefghij');
    });
  });
});
