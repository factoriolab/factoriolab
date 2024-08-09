import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NavigationEnd, NavigationStart } from '@angular/router';
import { MemoizedSelector } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { ItemId, Mocks, RecipeId, TestModule } from 'src/tests';
import {
  DisplayRate,
  Game,
  InserterCapacity,
  InserterTarget,
  MaximizeType,
  MIN_ZIP,
  Objective,
  ObjectiveType,
  ObjectiveUnit,
  Preset,
  rational,
  Zip,
  ZipData,
  ZipMachineSettings,
} from '~/models';
import {
  App,
  Datasets,
  Items,
  LabState,
  Machines,
  Objectives,
  Recipes,
  Settings,
} from '~/store';
import { RouterService } from './router.service';

const mockObjective: Objective = {
  id: '1',
  targetId: ItemId.SteelChest,
  value: rational.one,
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
const mockMigratedObjectivesState: Objectives.ObjectivesState = {
  ids: ['1', '2'],
  entities: {
    ['1']: mockObjective,
    ['2']: {
      id: '2',
      targetId: ItemId.SteelChest,
      value: rational.one,
      unit: ObjectiveUnit.Machines,
      type: ObjectiveType.Output,
    },
  },
  index: 3,
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
    modules: [{ count: rational(2n), id: ItemId.EfficiencyModule }],
    beacons: [
      {
        count: rational.one,
        id: ItemId.Beacon,
        modules: [{ count: rational(2n), id: ItemId.SpeedModule }],
        total: rational(8n),
      },
    ],
    overclock: rational(200n),
    cost: rational(100n),
  },
};
const mockMachinesState: Machines.MachinesState = {
  ids: [ItemId.AssemblingMachine2, ItemId.SteelFurnace],
  fuelRankIds: [ItemId.Coal],
  moduleRankIds: [ItemId.ProductivityModule, ItemId.SpeedModule],
  beacons: [
    {
      count: rational.one,
      id: ItemId.Beacon,
      modules: [{ id: ItemId.SpeedModule }],
    },
  ],
  entities: {},
};
const mockSettingsState: Settings.SettingsState = {
  modId: '1.0',
  researchedTechnologyIds: null,
  netProductionOnly: true,
  surplusMachinesOutput: false,
  preset: Preset.Modules,
  beaconReceivers: rational.one,
  proliferatorSprayId: ItemId.ProductivityModule,
  beltId: ItemId.TransportBelt,
  cargoWagonId: ItemId.CargoWagon,
  fluidWagonId: ItemId.FluidWagon,
  flowRate: rational(1200n),
  inserterTarget: InserterTarget.Chest,
  miningBonus: rational(100n),
  researchBonus: rational.zero,
  inserterCapacity: InserterCapacity.Capacity0,
  displayRate: DisplayRate.PerHour,
  maximizeType: MaximizeType.Weight,
  costs: {
    factor: rational(2n),
    machine: rational(10n),
    footprint: rational.one,
    unproduceable: rational.zero,
    excluded: rational(100n),
    surplus: rational.zero,
    maximize: rational(-100000n),
  },
};
const mockZip: Zip = {
  bare: 'p=steel-chest**1',
  hash: 'pC6**1',
};
const mockZipPartial: Zip = {
  bare:
    '&m=2*effectivity-module_2*speed-module_*speed-module&e=1*1*beacon*8_1*2*' +
    'beacon&i=steel-chest*1*transport-belt*cargo-wagon&r=steel-chest**assembl' +
    'ing-machine-2*0*0*200*100&f=%3D*productivity-module~speed-module*1*coal_' +
    'assembling-machine-2_steel-furnace&s=1.0**2*1*transport-belt**100*0*0*0*' +
    'cargo-wagon*fluid-wagon**1*productivity-module*1**2*10*0*100**-100000',
  hash:
    '&m2*A_2*G_*G&e1*1*A*8_1*2*A&bB&iC6*1*C*A&rDB**B*0*0*200*100&f=*D~G*1*A_B' +
    '_Q&s*2*1*C**Bk*A*0*0*A*B**1*D*1**2*10*0*100**-100000',
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
function mockEmptyMachineSettings(): ZipMachineSettings {
  return { moduleMap: {}, beaconMap: {} };
}
function mockZipData(objectives?: Zip, config?: Zip): ZipData {
  return {
    objectives: objectives ?? mockEmptyZip(),
    config: config ?? mockEmptyZip(),
    objectiveSettings: mockEmptyMachineSettings(),
    recipeSettings: mockEmptyMachineSettings(),
    machineSettings: mockEmptyMachineSettings(),
  };
}

describe('RouterService', () => {
  let service: RouterService;
  let mockStore: MockStore<LabState>;
  let selectMockGetZipState: MemoizedSelector<
    LabState,
    {
      objectives: Objectives.ObjectivesState;
      itemsState: Items.ItemsState;
      recipesState: Recipes.RecipesState;
      machinesState: Machines.MachinesState;
      settings: Settings.SettingsState;
    }
  >;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
    });
    service = TestBed.inject(RouterService);
    service.initialize();
    mockStore = TestBed.inject(MockStore);
    mockStore.overrideSelector(Datasets.selectHash, {
      [Settings.initialState.modId]: Mocks.Hash,
      [mockSettingsState.modId]: Mocks.Hash,
    });
    selectMockGetZipState = mockStore.overrideSelector(
      Objectives.selectZipState,
      {
        objectives: Objectives.initialState,
        itemsState: Items.initialState,
        recipesState: Recipes.initialState,
        machinesState: Machines.initialState,
        settings: Settings.initialState,
      },
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update state from router', () => {
    spyOn(service, 'updateState');
    (service.router.events as any).next(new NavigationEnd(2, '/', '/'));
    expect(service.updateState).toHaveBeenCalled();
  });

  it('should run first update of url if settings modified', fakeAsync(() => {
    spyOn(service, 'updateUrl');
    selectMockGetZipState.setResult({
      objectives: Objectives.initialState,
      itemsState: { [ItemId.Wood]: { excluded: true } },
      recipesState: Recipes.initialState,
      machinesState: Machines.initialState,
      settings: Settings.initialState,
    });
    mockStore.refreshState();
    service.first = true;
    service.updateState(new NavigationEnd(2, '/', '/'));
    tick();
    expect(service.updateUrl).toHaveBeenCalled();
  }));

  describe('getModIdFromState', () => {
    it('should handle zipped states', async () => {
      let result = await service.getModIdFromState(
        'z=eJwrcInQMlQrcknU0nLScq9zVyuzBAA04gVG&v=9',
      );
      expect(result).toBeUndefined();

      result = await service.getModIdFromState(
        'z=eJwrMNcyVEvyUCtyctTSStZyVStWK7MEADvbBYI_&v=9',
      );
      expect(result).toEqual('dsp');
    });

    it('should handle invalid states', async () => {
      let result = await service.getModIdFromState('z=');
      expect(result).toBeUndefined();

      result = await service.getModIdFromState('s=');
      expect(result).toBeUndefined();
    });

    it('should handle bare states', async () => {
      const result = await service.getModIdFromState('s=dsp');
      expect(result).toEqual('dsp');
    });
  });

  describe('getGameFromModId', () => {
    it('should return default value', () => {
      expect(service.getGameFromModId(undefined)).toEqual(Game.Factorio);
      expect(service.getGameFromModId('fake')).toEqual(Game.Factorio);
    });
  });

  describe('updateUrl', () => {
    it('should update url with products', fakeAsync(() => {
      spyOn(service, 'zipState').and.returnValue(of(mockZipData()));
      spyOn(service, 'getHash').and.returnValue(Promise.resolve('test'));
      spyOn(service.router, 'navigateByUrl');
      service.updateUrl(
        Objectives.initialState,
        Items.initialState,
        Recipes.initialState,
        Machines.initialState,
        Settings.initialState,
      );
      tick();
      expect(service.router.navigateByUrl).toHaveBeenCalledWith('/?test');
    }));

    it('should preserve a hash', fakeAsync(() => {
      spyOn(service, 'zipState').and.returnValue(of(mockZipData()));
      spyOn(service, 'getHash').and.returnValue(Promise.resolve('test'));
      spyOn(service.router, 'navigateByUrl');
      spyOnProperty(service.router, 'url').and.returnValue('path#hash');
      service.updateUrl(
        Objectives.initialState,
        Items.initialState,
        Recipes.initialState,
        Machines.initialState,
        Settings.initialState,
      );
      tick();
      expect(service.router.navigateByUrl).toHaveBeenCalledWith(
        'path?test#hash',
      );
    }));
  });

  describe('zipState', () => {
    it('should zip state', () => {
      let zip: ZipData | undefined;
      service
        .zipState(
          Objectives.initialState,
          Items.initialState,
          Recipes.initialState,
          Machines.initialState,
          Settings.initialState,
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
    it('should return null if hash is undefined', async () => {
      const result = await service.stepHref(
        { id: '', itemId: ItemId.Wood },
        mockEmptyZip(),
        undefined,
      );
      expect(result).toBeNull();
    });

    it('should return null for no items or machines', async () => {
      const result = await service.stepHref(
        { id: '', itemId: ItemId.Wood },
        mockEmptyZip(),
        Mocks.Hash,
      );
      expect(result).toBeNull();
    });

    it('should return get the hash for items from specific step', async () => {
      spyOn(service, 'zipObjectives');
      spyOn(service, 'getHash').and.returnValue(Promise.resolve('test'));
      const result = await service.stepHref(
        { id: '', itemId: ItemId.Wood, items: rational.one },
        mockEmptyZip(),
        Mocks.Hash,
      );
      expect(result).toEqual('list?test');
    });

    it('should return get the hash for machines from specific step', async () => {
      spyOn(service, 'zipObjectives');
      spyOn(service, 'getHash').and.returnValue(Promise.resolve('test'));
      const result = await service.stepHref(
        {
          id: '',
          recipeId: RecipeId.AdvancedCircuit,
          machines: rational.one,
        },
        mockEmptyZip(),
        Mocks.Hash,
      );
      expect(result).toEqual('list?test');
    });
  });

  describe('getHash', () => {
    it('should preserve a small state', async () => {
      spyOn(service.compressionSvc, 'deflate').and.returnValue(
        Promise.resolve(''),
      );
      const result = await service.getHash(mockZipData(mockZip));
      expect(result).toEqual(`${mockZip.bare}&v=${service.version}`);
    });

    it('should zip a large state', async () => {
      spyOn(service.compressionSvc, 'deflate').and.returnValue(
        Promise.resolve('test'),
      );
      service.zipTail.bare = 'a'.repeat(MIN_ZIP);
      const result = await service.getHash(mockZipData());
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

    it('should skip unless event is NavigationEnd', async () => {
      await service.updateState(new NavigationStart(2, ''));
      expect(service.dispatch).not.toHaveBeenCalled();
    });

    it('should skip unless hash is found', async () => {
      await service.updateState(new NavigationEnd(2, '/', '/'));
      expect(service.dispatch).not.toHaveBeenCalled();
    });

    it('should skip unless new zip is found', async () => {
      service.zip = mockZip.bare;
      const url = `/#${mockZip.bare}`;
      await service.updateState(new NavigationEnd(2, url, url));
      expect(service.dispatch).not.toHaveBeenCalled();
    });

    it('should log warning on bad zipped url', async () => {
      spyOn(console, 'warn');
      spyOn(console, 'error');
      await expectAsync(
        service.updateState(new NavigationEnd(2, '/#z=test', '/#z=test')),
      ).toBeRejected();
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('should unzip empty v0', async () => {
      const url = '/#z=eJwrsAUAAR8Arg==';
      await service.updateState(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p=', {} as any);
    });

    it('should unzip v0', async () => {
      spyOn(service.contentSvc, 'confirm');
      const url =
        '/#z=eJxtUNsKwyAM.Zr5EHDUFsZeZC.7j6E2toJVp3ZjL.v2dbSD2pUQyOXk5CSBp4xo' +
        'qeoxZWDAyL2sEMkZMRtUjsKl4GOmEm0GJWLn6VN03pFYQEVKOEhrXEcHoXrjkNaAWqPK' +
        '5mHyiw6-HS2-.0vTlhQQ2x9inYBEobyDuqqATX4mmjMIcWpueIupknEhue1JvM036DE6' +
        'oZAkzo4VHJrrzuleWGBfIc1pUTPb6ieg7WjaJb58AJs7glk_';
      await service.updateState(new NavigationEnd(2, url, url));

      const mockStateV0: App.PartialState = {
        ...mockState,
        ...{
          objectivesState: mockMigratedObjectivesState,
          settingsState: { ...mockState.settingsState },
        },
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
      expect(service.contentSvc.confirm).toHaveBeenCalled(); // Log warning for expensive field
    });

    it('should unzip empty v1', async () => {
      const v1Empty = 'p=&v=1';
      const url = `/?${v1Empty}`;
      await service.updateState(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(v1Empty, {} as any);
    });

    it('should unzip v1', async () => {
      spyOn(service.contentSvc, 'confirm');
      const v1Full =
        'p=steel-chest*1*1&i=steel-chest*1*transport-belt*cargo-wagon&r=steel' +
        '-chest*assembling-machine-2*effectivity-module~effectivity-module*1*' +
        'speed-module~speed-module*beacon*200*100*8&f=1*productivity-module~s' +
        'peed-module*1*speed-module*beacon_assembling-machine-2_steel-furnace' +
        '&s=1.0*2*1*=*transport-belt*coal*1200*100*0*0*0*1*cargo-wagon*fluid-' +
        'wagon*?*2*10*0*100*1*productivity-module&v=1';
      const url = `/?${v1Full}`;
      await service.updateState(new NavigationEnd(2, url, url));

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
      expect(service.contentSvc.confirm).toHaveBeenCalled(); // Log warning for expensive field
    });

    it('should unzip empty v2', async () => {
      const url = '/?z=eJwrUCszAgADVAE.';
      spyOn(service.dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      await service.updateState(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v2', {} as any);
    });

    it('should unzip v2', async () => {
      spyOn(service.contentSvc, 'confirm');
      const url =
        '/?z=eJwdjLEKgDAMRP8mw01NB3ERSVpwFj-g4CCIiyjo1m.3KuGSXI6XM3VQqKwu-78m' +
        'mFzZ4bBq7FOdYIghQKleNkXmiQGseJnljqSGxmF54QdnYCkaPYLpb9sDZHniBxSMGkU_';

      spyOn(service.dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      await service.updateState(new NavigationEnd(2, url, url));
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
      expect(service.contentSvc.confirm).toHaveBeenCalled(); // Log warning for expensive field
    });

    it('should unzip empty v3', async () => {
      const url = '/?z=eJwrUCszBgADVQFA';
      spyOn(service.dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      await service.updateState(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v3', {} as any);
    });

    it('should unzip v3', async () => {
      spyOn(service.contentSvc, 'confirm');
      const url =
        '/?z=eJwdjL0KgEAMg9-mQ6brCeIi0t6Bs.gABw6CuPgDuvnsRilt-BLSLdVQqOzZeSeX' +
        '5TcSTA5aDnuM3D89DDEEKLeRWZFpMYAVL4OckdB-PYw3fKUGjlIdHZj--D1Alqt6AbeM' +
        'G5w_';

      spyOn(service.dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      await service.updateState(new NavigationEnd(2, url, url));

      const mockStateV3: App.PartialState = {
        ...mockState,
        ...{
          objectivesState: mockMigratedObjectivesState,
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
      expect(service.contentSvc.confirm).toHaveBeenCalled(); // Log warning for expensive field
    });

    it('should unzip empty v4', async () => {
      const v4Empty = 'p=&v=4';
      const url = `/?${v4Empty}`;
      await service.updateState(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(v4Empty, {} as any);
    });

    it('should unzip v4', async () => {
      const v4Full =
        'p=steel-chest*1*1&q=steel-chest*1&i=steel-chest*1*transport-belt*car' +
        'go-wagon&r=steel-chest*assembling-machine-2*effectivity-module~effec' +
        'tivity-module*1*speed-module~speed-module*beacon*200*100*8&f=1*produ' +
        'ctivity-module~speed-module*1*speed-module*beacon_assembling-machine' +
        '-2_steel-furnace&s=1.0*2*1*%3D*transport-belt*coal*1200*100*0*0*0*ca' +
        'rgo-wagon*fluid-wagon**2*10*0*100*1*productivity-module&v=4';
      const url = `/?${v4Full}`;
      await service.updateState(new NavigationEnd(2, url, url));

      const mockStateV4: App.PartialState = {
        ...mockState,
        ...{
          objectivesState: mockMigratedObjectivesState,
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

    it('should unzip empty v5', async () => {
      const url = '/?z=eJwrUCszBQADVwFC&v=5';
      spyOn(service.dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      await service.updateState(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v5', {} as any);
    });

    it('should unzip v5', async () => {
      const url =
        '/?z=eJwdjDsKgDAQRG-zxVRJQLGx2E0gtXiAgIUgNn5Au5zdiSz7mTfMHrGHh5czGedi' +
        'sv0gQuUiMmhV6lwzFME5ePYgq0ciogEtVia5A8XYcphf2M7tWMoPoNXulmRMnu4DZYwb' +
        'BA__&v=5';

      spyOn(service.dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      await service.updateState(new NavigationEnd(2, url, url));

      const mockStateV5: App.PartialState = {
        ...mockState,
        ...{
          objectivesState: mockMigratedObjectivesState,
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

    it('should unzip empty v6', async () => {
      const v6Empty = 'p=&v=6';
      const url = `/?${v6Empty}`;
      await service.updateState(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(v6Empty, {} as any);
    });

    it('should unzip v6', async () => {
      const v6Full =
        'p=steel-chest*1*1&q=steel-chest*1&e=1*speed-module~speed-module*beac' +
        'on*8&i=steel-chest*1*transport-belt*cargo-wagon&r=steel-chest*assemb' +
        'ling-machine-2*effectivity-module~effectivity-module*0*200*100&f=1*p' +
        'roductivity-module~speed-module*1*speed-module*beacon_assembling-mac' +
        'hine-2_steel-furnace&s=1.0*2*1*%3D*transport-belt*coal*1200*100*0*0*' +
        '0*cargo-wagon*fluid-wagon**2*10*0*100*1*productivity-module*1&v=6';
      const url = `/?${v6Full}`;
      await service.updateState(new NavigationEnd(2, url, url));

      const mockStateV6: App.PartialState = {
        ...mockState,
        ...{
          objectivesState: mockMigratedObjectivesState,
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

    it('should unzip empty v7', async () => {
      const url = '/?z=eJwrUCszBwADWQFE&v=7';
      spyOn(service.dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      await service.updateState(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v7', {} as any);
    });

    it('should unzip v7', async () => {
      const url =
        '/?z=eJwdjbEKg1AMRf8mw5kSB-3ikPjAWfwAoWChdGkr6Oa3m-dyueGcS75Di2HyK5G5' +
        'GuM54jzkGfK-2YDLP2ngp6M0qpiqvIySbi7wJZZJtiaPvvrMB.Gh2poZkKh2q1tKftq7' +
        'C.WaHBw_&v=7';

      spyOn(service.dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      await service.updateState(new NavigationEnd(2, url, url));

      const mockStateV7: App.PartialState = {
        ...mockState,
        ...{
          objectivesState: mockMigratedObjectivesState,
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

    it('should unzip empty v8', async () => {
      const url = '/?z=eJwrUCuzAAADWgFF&v=8';
      spyOn(service.dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      await service.updateState(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v8', {} as any);
    });

    it('should unzip v8', async () => {
      const url =
        '/?z=eJwli0EKwlAMRG-TxYNC0kXpTpIWuhYPUBAUxI0o2F3P3vkayAwM772mgSDsFiz7' +
        'QjLatezxWyfS3nNBkXvi9O6Eu92DWbAUcq31bJ8T.V.gslFPGu1KyWL12YC2yVd2Kp19' +
        'xwOrTh0O&v=8';

      spyOn(service.dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      await service.updateState(new NavigationEnd(2, url, url));

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

    it('should unzip empty v9', async () => {
      const url = '/?z=eJwrUCuzBAADWwFG&v=9';
      spyOn(service.dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      await service.updateState(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v9', {} as any);
    });

    it('should unzip v9', async () => {
      const url =
        '/?z=eJwljEEKwlAMRG-TxQMh6ULsSpIWuhYP8EGoIG5EQXc9u.N1IBMY5s1j2hOErcGyLSQHu5TdfulE2nMuKHJLnMGdcG9Jl12DWYxIslU72evI8Oc4f6g7HXK5NtTVZS.0TDPynZ5k7.ELdcIegQ__&v=9';

      spyOn(service.dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null]),
      );
      await service.updateState(new NavigationEnd(2, url, url));

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
        'pC6*1*1&e1*G~G*A*8&bB&iC6*1*C*A&rDB**B*A~A*0*200*100_A*****&f1*D~G*1*G*A_B_' +
          'Q&s?*2*1*C*A*Sw*Bk*A*0*0*A*B**1*D*1*A*2*10*0*100*0*-100000&v9',
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
        App.load({ partial: mockState }),
      );
    });
  });

  describe('beaconModuleMap', () => {
    it('should return undefined for beacons without modules', () => {
      const result = service.beaconModuleMap(
        [{}],
        service.emptyRecipeSettingsInfo,
        Mocks.Hash,
      );
      expect(result[0]).toBeUndefined();
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
            value: rational.one,
            unit: ObjectiveUnit.Items,
            type: ObjectiveType.Output,
          },
        ],
        Mocks.Hash,
      );
      expect(zip.objectives).toEqual({
        bare: 'p=steel-chest',
        hash: 'pC6',
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
            value: rational.one,
            unit: ObjectiveUnit.Belts,
            type: ObjectiveType.Output,
          },
        ],
        Mocks.Hash,
      );
      expect(zip.objectives).toEqual({
        bare: 'p=steel-chest**1',
        hash: 'pC6**1',
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
            value: rational.one,
            unit: ObjectiveUnit.Wagons,
            type: ObjectiveType.Output,
          },
        ],
        Mocks.Hash,
      );
      expect(zip.objectives).toEqual({
        bare: 'p=steel-chest**2',
        hash: 'pC6**2',
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
            value: rational.one,
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Output,
          },
        ],
        Mocks.Hash,
      );
      expect(zip.objectives).toEqual({
        bare: 'p=steel-chest**3',
        hash: 'pDB**3',
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
        [],
      );
      expect(result).toEqual({
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            targetId: ItemId.SteelChest,
            value: rational.one,
            unit: ObjectiveUnit.Belts,
            type: ObjectiveType.Output,
          },
        },
        index: 2,
      });
    });

    it('hash should map values to empty strings if null', () => {
      const result = service.unzipObjectives(
        { ['p']: '*1' },
        [],
        [],
        Mocks.Hash,
      );
      expect(result).toEqual({
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            targetId: '',
            value: rational.one,
            unit: ObjectiveUnit.Items,
            type: ObjectiveType.Output,
          },
        },
        index: 2,
      });
    });

    it('should map modules and beacons', () => {
      const result = service.unzipObjectives({ ['p']: '*1*3***0*0' }, [], []);
      expect(result).toEqual({
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            targetId: '',
            value: rational.one,
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Output,
            modules: [{}],
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
        [],
      );
      expect(result).toEqual({
        [RecipeId.SteelChest]: { machineId: ItemId.AssemblingMachine2 },
      });
    });

    it('hash should map values to empty strings if null', () => {
      const result = service.unzipRecipes(
        { ['r']: '**A*' },
        [],
        [],
        Mocks.Hash,
      );
      expect(result).toEqual({
        ['']: { machineId: ItemId.AssemblingMachine1 },
      });
    });

    it('should map modules and beacons', () => {
      const result = service.unzipRecipes(
        { ['r']: 'iron-plate***0*0' },
        [],
        [],
      );
      expect(result).toEqual({
        [ItemId.IronPlate]: {
          modules: [{}],
          beacons: [{}],
        },
      });
    });
  });

  describe('unzipMachines', () => {
    it('should unzip', () => {
      const result = service.unzipMachines(
        { ['f']: '=*speed-module*0*coal*100_assembling-machine-2*0*0' },
        [],
        [],
      );
      expect(result).toEqual({
        ids: ['assembling-machine-2'],
        moduleRankIds: ['speed-module'],
        beacons: [{}],
        fuelRankIds: ['coal'],
        overclock: rational(100n),
        entities: {
          ['assembling-machine-2']: {
            modules: [{}],
            beacons: [{}],
          },
        },
      });
    });
  });
});
