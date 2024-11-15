import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { of, Subject } from 'rxjs';

import { spread } from '~/helpers';
import { MIN_ZIP } from '~/models/constants';
import { DisplayRate } from '~/models/enum/display-rate';
import { InserterCapacity } from '~/models/enum/inserter-capacity';
import { InserterTarget } from '~/models/enum/inserter-target';
import { MaximizeType } from '~/models/enum/maximize-type';
import { ObjectiveType } from '~/models/enum/objective-type';
import { ObjectiveUnit } from '~/models/enum/objective-unit';
import { Preset } from '~/models/enum/preset';
import { LabParams } from '~/models/lab-params';
import { ObjectiveState } from '~/models/objective';
import { rational } from '~/models/rational';
import { Zip, ZipData, ZipMachineSettings } from '~/models/zip';
import { ItemsState } from '~/store/items.service';
import { ObjectivesState } from '~/store/objectives.service';
import { RecipesState } from '~/store/recipes.service';
import { initialSettingsState, SettingsState } from '~/store/settings.service';
import { ItemId, Mocks, RecipeId, TestModule } from '~/tests';

import { PartialState, RouterService } from './router.service';

const mockObjective: ObjectiveState = {
  id: '1',
  targetId: ItemId.SteelChest,
  value: rational.one,
  unit: ObjectiveUnit.Belts,
  type: ObjectiveType.Output,
};
const mockObjectivesState: ObjectivesState = {
  ['1']: mockObjective,
};
const mockMigratedObjectivesState: ObjectivesState = {
  ['1']: mockObjective,
  ['2']: {
    id: '2',
    targetId: ItemId.SteelChest,
    value: rational.one,
    unit: ObjectiveUnit.Machines,
    type: ObjectiveType.Output,
  },
};
const mockItemsState: ItemsState = {
  [ItemId.SteelChest]: {
    beltId: ItemId.TransportBelt,
    wagonId: ItemId.CargoWagon,
  },
};
const mockRecipesState: RecipesState = {
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
const mockSettingsState: SettingsState = {
  modId: '1.0',
  checkedObjectiveIds: new Set(['1']),
  maximizeType: MaximizeType.Weight,
  requireMachinesOutput: false,
  displayRate: DisplayRate.PerHour,
  excludedItemIds: new Set([ItemId.SteelChest]),
  checkedItemIds: new Set([ItemId.SteelChest]),
  beltId: ItemId.TransportBelt,
  cargoWagonId: ItemId.CargoWagon,
  fluidWagonId: ItemId.FluidWagon,
  flowRate: rational(1200n),
  excludedRecipeIds: new Set([RecipeId.SteelChest]),
  checkedRecipeIds: new Set([RecipeId.SteelChest]),
  netProductionOnly: true,
  preset: Preset.Modules,
  machineRankIds: [ItemId.AssemblingMachine2, ItemId.SteelFurnace],
  fuelRankIds: [ItemId.Coal],
  moduleRankIds: [ItemId.ProductivityModule, ItemId.SpeedModule],
  beacons: [
    {
      count: rational.one,
      id: ItemId.Beacon,
      modules: [{ id: ItemId.SpeedModule }],
    },
  ],
  beaconReceivers: rational.one,
  proliferatorSprayId: ItemId.ProductivityModule,
  inserterTarget: InserterTarget.Chest,
  miningBonus: rational(100n),
  researchBonus: rational.zero,
  inserterCapacity: InserterCapacity.Capacity0,
  researchedTechnologyIds: new Set([ItemId.Automation]),
  costs: {
    factor: rational(2n),
    machine: rational(10n),
    recycling: rational(1000n),
    footprint: rational.one,
    unproduceable: rational.zero,
    excluded: rational(100n),
    surplus: rational.zero,
    maximize: rational(-100000n),
  },
};
const mockZip: Zip<LabParams> = {
  bare: { o: ['steel-chest**1'] },
  hash: { o: ['C6**1'] },
};
const mockZipPartial: Zip<LabParams> = {
  bare: {
    e: ['2*effectivity-module', '2*speed-module', '*speed-module'],
    b: ['1*1*beacon*8', '1*2*beacon'],
    i: ['steel-chest*transport-belt*cargo-wagon'],
    r: ['steel-chest*assembling-machine-2*0*0*200*100'],
    mmr: 'assembling-machine-2~steel-furnace',
    mer: 'productivity-module~speed-module',
    mbe: '1',
    mfr: 'coal',
    odr: '2',
    mpr: '1',
    ibe: 'transport-belt',
    bmi: '100',
    bre: '0',
    bic: '0',
    mit: '0',
    icw: 'cargo-wagon',
    ifw: 'fluid-wagon',
    mbr: '1',
    mps: 'productivity-module',
    rnp: '1',
    cfa: '2',
    cma: '10',
    cun: '0',
    cex: '100',
    cmx: '-100000',
    iex: 'C6',
    och: 'A',
    ich: 'C6',
    rex: 'DB',
    rch: 'DB',
    tre: 'A',
    omt: '0',
  },
  hash: {
    e: ['2*A', '2*G', '*G'],
    b: ['1*1*A*8', '1*2*A'],
    i: ['C6*C*A'],
    r: ['DB*B*0*0*200*100'],
    mmr: 'B~Q',
    mer: 'D~G',
    mbe: '1',
    mfr: 'A',
    odr: '2',
    mpr: '1',
    ibe: 'C',
    bmi: '100',
    bre: '0',
    bic: '0',
    mit: '0',
    icw: 'A',
    ifw: 'B',
    mbr: '1',
    mps: 'D',
    rnp: '1',
    cfa: '2',
    cma: '10',
    cun: '0',
    cex: '100',
    cmx: '-100000',
    iex: 'C6',
    och: 'A',
    ich: 'C6',
    rex: 'DB',
    rch: 'DB',
    tre: 'A',
    omt: '0',
  },
};

const mockEmpty: PartialState = {
  objectivesState: undefined,
  itemsState: undefined,
  recipesState: undefined,
  machinesState: undefined,
  settingsState: undefined,
};

const mockState: PartialState = {
  objectivesState: mockObjectivesState,
  itemsState: mockItemsState,
  recipesState: mockRecipesState,
  machinesState: undefined,
  settingsState: mockSettingsState,
};

describe('RouterService', () => {
  let service: RouterService;
  const mockRoute = {
    params: new Subject<Params>(),
    queryParams: new Subject<Params>(),
    next: (params: Params, queryParams: Params): void => {
      mockRoute.params.next(params);
      mockRoute.queryParams.next(queryParams);
    },
  };
  function mockEmptyZip(): Zip<LabParams> {
    return service.empty;
  }
  function mockEmptyMachineSettings(): ZipMachineSettings {
    return { moduleMap: {}, beaconMap: {} };
  }
  function mockZipData(
    objectives?: Zip<LabParams>,
    config?: Zip<LabParams>,
  ): ZipData {
    return {
      objectives: objectives ?? mockEmptyZip(),
      config: config ?? mockEmptyZip(),
      objectiveSettings: mockEmptyMachineSettings(),
      recipeSettings: mockEmptyMachineSettings(),
      machineSettings: mockEmptyMachineSettings(),
      beacons: undefined,
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
    });
    service = TestBed.inject(RouterService);
    service.route$.next(mockRoute as unknown as ActivatedRoute);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update state from route', fakeAsync(() => {
    spyOn(service, 'updateState').and.callThrough();
    mockRoute.next({}, {});
    tick();
    expect(service.updateState).toHaveBeenCalled();
  }));

  describe('zipState', () => {
    it('should be triggered via effect', fakeAsync(() => {
      spyOn(service.objectivesSvc, 'state').and.returnValue(
        Mocks.objectivesState,
      );
      spyOn(service, 'updateUrl').and.returnValue(Promise.resolve(undefined));
      service.ready.set(true);
      TestBed.flushEffects();
      tick();
      expect(service.updateUrl).toHaveBeenCalled();
    }));

    it('should zip state', () => {
      const result = service.zipState({
        objectives: {},
        items: {},
        recipes: {},
        machines: {},
        settings: initialSettingsState,
        data: Mocks.dataset,
        hash: Mocks.modHash,
      });
      expect(result).toEqual(mockZipData());
    });

    it('should zip full state', () => {
      const result = service.zipState({
        objectives: mockObjectivesState,
        items: mockItemsState,
        recipes: mockRecipesState,
        machines: {},
        settings: mockSettingsState,
        data: Mocks.dataset,
        hash: Mocks.modHash,
      });
      expect(result?.objectives).toEqual(mockZip);
      expect(result?.config).toEqual(mockZipPartial);
    });
  });

  describe('updateUrl', () => {
    it('should update url with products', async () => {
      spyOn(service, 'zipState').and.returnValue(mockZipData());
      spyOn(service, 'getHash').and.returnValue(Promise.resolve({ z: 'z' }));
      spyOn(service.router, 'navigate');
      spyOnProperty(service.router, 'url').and.returnValue('flow');
      await service.updateUrl(mockZipData());
      expect(service.router.navigate).toHaveBeenCalledWith([], {
        queryParams: { z: 'z' },
      });
      expect(service.stored()).toEqual('flow');
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
        Mocks.modHash,
      );
      expect(result).toBeNull();
    });

    it('should return get the hash for items from specific step', async () => {
      const result = await service.stepHref(
        { id: '', itemId: ItemId.Wood, items: rational.one },
        mockEmptyZip(),
        Mocks.modHash,
      );
      expect(result).toEqual({ o: [ItemId.Wood], v: service.version });
    });

    it('should return get the hash for machines from specific step', async () => {
      const result = await service.stepHref(
        {
          id: '',
          recipeId: RecipeId.AdvancedCircuit,
          machines: rational.one,
        },
        mockEmptyZip(),
        Mocks.modHash,
      );
      expect(result).toEqual({
        o: ['advanced-circuit**3'],
        v: service.version,
      });
    });
  });

  describe('getHash', () => {
    it('should preserve a small state', async () => {
      spyOn(service.compressionSvc, 'deflate').and.returnValue(
        Promise.resolve(''),
      );
      const result = await service.getHash(mockZipData(mockZip));
      expect(result).toEqual({ o: ['steel-chest**1'], v: service.version });
    });

    it('should zip a large state', async () => {
      spyOn(service.compressionSvc, 'deflate').and.returnValue(
        Promise.resolve('test'),
      );
      service.zipTail.v = 'a'.repeat(MIN_ZIP);
      const result = await service.getHash(mockZipData());
      expect(result).toEqual({ z: 'test', v: service.version });
    });
  });

  describe('toParams', () => {
    it('should handle params with & and =', () => {
      expect(service.toParams('p=prod&s=sett')).toEqual({
        p: 'prod',
        s: 'sett',
      });
    });

    it('should handle params with no =', () => {
      expect(service.toParams('abc')).toEqual({ a: 'bc' });
    });

    it('should convert and append to an array', () => {
      expect(service.toParams('o=a&o=b&o=c')).toEqual({ o: ['a', 'b', 'c'] });
    });
  });

  describe('unzipQueryParams', () => {
    it('should unzip the z parameter, if present', async () => {
      const result = await service.unzipQueryParams({
        z: 'eJwrSS0usS1JLS4BABKsA74_',
      });
      expect(result).toEqual({ test: 'test', z: 'eJwrSS0usS1JLS4BABKsA74_' });
    });

    it('should log warning on bad zipped url', async () => {
      spyOn(console, 'warn');
      spyOn(console, 'error');
      await expectAsync(service.unzipQueryParams({ z: 'test' })).toBeRejected();
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateState', () => {
    let dispatch: jasmine.Spy;

    const mockStateV10 = spread(mockState, {
      settingsState: spread(mockState.settingsState, {
        costs: spread(mockState.settingsState!.costs),
      }),
    });
    delete mockStateV10.settingsState?.requireMachinesOutput;
    delete mockStateV10.settingsState?.costs?.footprint;
    delete mockStateV10.settingsState?.costs?.recycling;

    const mockStateV8: PartialState = spread(mockStateV10, {
      settingsState: spread(mockStateV10.settingsState),
    });
    delete mockStateV8.settingsState?.checkedObjectiveIds;
    delete mockStateV8.settingsState?.checkedItemIds;
    delete mockStateV8.settingsState?.excludedRecipeIds;
    delete mockStateV8.settingsState?.checkedRecipeIds;
    delete mockStateV8.settingsState?.researchedTechnologyIds;

    const mockStateV6: PartialState = spread(mockStateV8, {
      objectivesState: mockMigratedObjectivesState,
      settingsState: spread(mockStateV8.settingsState, {
        costs: spread(mockStateV8.settingsState?.costs),
      }),
    });
    delete mockStateV6.settingsState?.maximizeType;
    delete mockStateV6.settingsState?.researchedTechnologyIds;
    delete mockStateV6.settingsState?.costs?.surplus;
    delete mockStateV6.settingsState?.costs?.maximize;

    const mockStateV3: PartialState = spread(mockStateV6, {
      settingsState: spread(mockStateV6.settingsState),
    });
    delete mockStateV3.settingsState?.netProductionOnly;

    const mockStateV1: PartialState = spread(mockStateV3, {
      objectivesState: mockState.objectivesState,
      settingsState: spread(mockStateV3.settingsState),
    });

    const mockStateV0: PartialState = spread(mockStateV3, {
      objectivesState: mockMigratedObjectivesState,
      settingsState: spread(mockStateV1.settingsState),
    });
    delete mockStateV0.settingsState?.beaconReceivers;
    delete mockStateV0.settingsState?.proliferatorSprayId;
    delete mockStateV0.settingsState?.costs;

    beforeEach(() => {
      dispatch = spyOn(service, 'dispatch');
      spyOn(service.dataSvc, 'requestData').and.returnValue(
        of([Mocks.modData, Mocks.modHash]),
      );
    });

    it('should skip if loading empty, current state', async () => {
      spyOn(service.ready, 'set');
      await service.updateState(undefined, {}, true);
      expect(service.ready.set).toHaveBeenCalled();
    });

    it('should unzip empty v0', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockEmpty);
        done();
      });
      mockRoute.next({}, { z: 'eJwrsAUAAR8Arg==' });
    });

    it('should unzip v0', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockStateV0);
        done();
      });
      mockRoute.next(
        {},
        {
          z:
            'eJxtUNsKwyAM.Zr5EHDUFsZeZC.7j6E2toJVp3ZjL.v2dbSD2pUQyOXk5CSBp4xo' +
            'qeoxZWDAyL2sEMkZMRtUjsKl4GOmEm0GJWLn6VN03pFYQEVKOEhrXEcHoXrjkNaA' +
            'WqPK5mHyiw6-HS2-.0vTlhQQ2x9inYBEobyDuqqATX4mmjMIcWpueIupknEhue1J' +
            'vM036DE6oZAkzo4VHJrrzuleWGBfIc1pUTPb6ieg7WjaJb58AJs7glk_',
        },
      );
    });

    it('should unzip empty v1', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockEmpty);
        done();
      });
      mockRoute.next({}, { p: '', v: '1' });
    });

    it('should unzip v1', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockStateV1);
        done();
      });
      mockRoute.next(
        {},
        {
          p: 'steel-chest*1*1',
          i: 'steel-chest*1*transport-belt*cargo-wagon',
          r:
            'steel-chest*assembling-machine-2*effectivity-module~effectivity-' +
            'module*1*speed-module~speed-module*beacon*200*100*8',
          f:
            '1*productivity-module~speed-module*1*speed-module*beacon_assembl' +
            'ing-machine-2_steel-furnace',
          s:
            '1.0*2*1*=*transport-belt*coal*1200*100*0*0*0*1*cargo-wagon*fluid' +
            '-wagon*?*2*10*0*100*1*productivity-module',
          v: '1',
        },
      );
    });

    it('should unzip empty v2', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockEmpty);
        done();
      });
      mockRoute.next({}, { z: 'eJwrUCszAgADVAE.' });
    });

    it('should unzip v2', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockStateV1);
        done();
      });
      mockRoute.next(
        {},
        {
          z:
            'eJwdjLEKgDAMRP8mw01NB3ERSVpwFj-g4CCIiyjo1m.3KuGSXI6XM3VQqKwu-78m' +
            'mFzZ4bBq7FOdYIghQKleNkXmiQGseJnljqSGxmF54QdnYCkaPYLpb9sDZHniBxSM' +
            'GkU_',
        },
      );
    });

    it('should unzip empty v3', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockEmpty);
        done();
      });
      mockRoute.next({}, { z: 'eJwrUCszBgADVQFA' });
    });

    it('should unzip v3', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockStateV3);
        done();
      });
      mockRoute.next(
        {},
        {
          z:
            'eJwdjL0KgEAMg9-mQ6brCeIi0t6Bs.gABw6CuPgDuvnsRilt-BLSLdVQqOzZeSeX' +
            '5TcSTA5aDnuM3D89DDEEKLeRWZFpMYAVL4OckdB-PYw3fKUGjlIdHZj--D1Alqt6' +
            'AbeMG5w_',
        },
      );
    });

    it('should unzip empty v4', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockEmpty);
        done();
      });
      mockRoute.next({}, { p: '', v: '4' });
    });

    it('should unzip v4', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockStateV3);
        done();
      });
      mockRoute.next(
        {},
        {
          p: 'steel-chest*1*1',
          q: 'steel-chest*1',
          i: 'steel-chest*1*transport-belt*cargo-wagon',
          r: 'steel-chest*assembling-machine-2*effectivity-module~effectivity-module*1*speed-module~speed-module*beacon*200*100*8',
          f:
            '1*productivity-module~speed-module*1*speed-module*beacon_assembling-machine' +
            '-2_steel-furnace',
          s:
            '1.0*2*1*%3D*transport-belt*coal*1200*100*0*0*0*ca' +
            'rgo-wagon*fluid-wagon**2*10*0*100*1*productivity-module',
          v: '4',
        },
      );
    });

    it('should unzip empty v5', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockEmpty);
        done();
      });
      mockRoute.next({}, { z: 'eJwrUCszBQADVwFC', v: '5' });
    });

    it('should unzip v5', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockStateV3);
        done();
      });
      mockRoute.next(
        {},
        {
          z:
            'eJwdjDsKgDAQRG-zxVRJQLGx2E0gtXiAgIUgNn5Au5zdiSz7mTfMHrGHh5czGedi' +
            'sv0gQuUiMmhV6lwzFME5ePYgq0ciogEtVia5A8XYcphf2M7tWMoPoNXulmRMnu4D' +
            'ZYwbBA__',
          v: '5',
        },
      );
    });

    it('should unzip empty v6', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockEmpty);
        done();
      });
      mockRoute.next({}, { p: '', v: '6' });
    });

    it('should unzip v6', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockStateV6);
        done();
      });
      mockRoute.next(
        {},
        {
          p: 'steel-chest*1*1',
          q: 'steel-chest*1',
          e: '1*speed-module~speed-module*beacon*8',
          i: 'steel-chest*1*transport-belt*cargo-wagon',
          r:
            'steel-chest*assembling-machine-2*effectivity-module~effectivity-' +
            'module*0*200*100',
          f:
            '1*productivity-module~speed-module*1*speed-module*beacon_assembl' +
            'ing-machine-2_steel-furnace',
          s:
            '1.0*2*1*%3D*transport-belt*coal*1200*100*0*0*0*cargo-wagon*fluid' +
            '-wagon**2*10*0*100*1*productivity-module*1',
          v: '6',
        },
      );
    });

    it('should unzip empty v7', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockEmpty);
        done();
      });
      mockRoute.next({}, { z: 'eJwrUCszBwADWQFE', v: '7' });
    });

    it('should unzip v7', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockStateV6);
        done();
      });
      mockRoute.next(
        {},
        {
          z:
            'eJwdjbEKg1AMRf8mw5kSB-3ikPjAWfwAoWChdGkr6Oa3m-dyueGcS75Di2HyK5G5' +
            'GuM54jzkGfK-2YDLP2ngp6M0qpiqvIySbi7wJZZJtiaPvvrMB.Gh2poZkKh2q1tK' +
            'ftq7C.WaHBw_',
          v: '7',
        },
      );
    });

    it('should unzip empty v8', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockEmpty);
        done();
      });
      mockRoute.next({}, { z: 'eJwrUCuzAAADWgFF', v: '8' });
    });

    it('should unzip v8', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockStateV8);
        done();
      });
      mockRoute.next(
        {},
        {
          z:
            'eJwli0EKwlAMRG-TxYNC0kXpTpIWuhYPUBAUxI0o2F3P3vkayAwM772mgSDsFiz7' +
            'QjLatezxWyfS3nNBkXvi9O6Eu92DWbAUcq31bJ8T.V.gslFPGu1KyWL12YC2yVd2' +
            'Kp19xwOrTh0O',
          v: '8',
        },
      );
    });

    it('should unzip empty v9', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockEmpty);
        done();
      });
      mockRoute.next({}, { z: 'eJwrUCuzBAADWwFG', v: '9' });
    });

    it('should unzip v9', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockStateV8);
        done();
      });
      mockRoute.next(
        {},
        {
          z:
            'eJwljEEKwlAMRG-TxQMh6ULsSpIWuhYP8EGoIG5EQXc9u.N1IBMY5s1j2hOErcGy' +
            'LSQHu5TdfulE2nMuKHJLnMGdcG9Jl12DWYxIslU72evI8Oc4f6g7HXK5NtTVZS.0' +
            'TDPynZ5k7.ELdcIegQ__',
          v: '9',
        },
      );
    });

    it('should unzip empty v10', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockEmpty);
        done();
      });
      mockRoute.next({}, { z: 'eJyrsjU0AAADNQEZ', v: '10' });
    });

    it('should unzip v10', (done) => {
      dispatch.and.callFake((v) => {
        expect(v).toEqual(mockStateV10);
        done();
      });
      mockRoute.next(
        {},
        {
          z: 'eJwdjDsKAkEQRG.TwQOhawIx2aBnByaWPcCAsIKIIAqaeXbpKXhJ.Z7rESGmZLtwgtMQhbBLtdssrASyV6uIxCnuKLHrQvt1RIw6zvYOylxsX-qdwOdlBdGylXF6uXYO8pR95PYo9FGIQf8D4wMhKw__',
          v: '9',
        },
      );
    });
  });

  describe('dispatch', () => {
    it('should dispatch a state', () => {
      const load: jasmine.Spy[] = [];
      load.push(spyOn(service.objectivesSvc, 'load'));
      load.push(spyOn(service.itemsSvc, 'load'));
      load.push(spyOn(service.recipesSvc, 'load'));
      load.push(spyOn(service.machinesSvc, 'load'));
      load.push(spyOn(service.settingsSvc, 'load'));
      spyOn(service.ready, 'set');
      service.dispatch(mockEmpty);
      load.forEach((s) => {
        expect(s).toHaveBeenCalledWith(undefined);
      });
      expect(service.ready.set).toHaveBeenCalledWith(true);
    });
  });

  describe('beaconModuleMap', () => {
    it('should return undefined for beacons without modules', () => {
      const result = service.beaconModuleMap(
        [{}],
        service.emptyRecipeSettingsInfo,
        Mocks.modHash,
      );
      expect(result[0]).toBeUndefined();
    });
  });

  describe('zipObjectives', () => {
    it('should handle RateUnit Items', () => {
      const zip = mockZipData();
      service.zipObjectives(
        zip,
        {
          ['1']: {
            id: '1',
            targetId: ItemId.SteelChest,
            value: rational.one,
            unit: ObjectiveUnit.Items,
            type: ObjectiveType.Output,
          },
        },
        Mocks.modHash,
      );
      expect(zip.objectives).toEqual({
        bare: { o: ['steel-chest'] },
        hash: { o: ['C6'] },
      });
    });

    it('should handle RateUnit Belts', () => {
      const zip = mockZipData();
      service.zipObjectives(
        zip,
        {
          ['1']: {
            id: '1',
            targetId: ItemId.SteelChest,
            value: rational.one,
            unit: ObjectiveUnit.Belts,
            type: ObjectiveType.Output,
          },
        },
        Mocks.modHash,
      );
      expect(zip.objectives).toEqual({
        bare: { o: ['steel-chest**1'] },
        hash: { o: ['C6**1'] },
      });
    });

    it('should handle RateUnit Wagons', () => {
      const zip = mockZipData();
      service.zipObjectives(
        zip,
        {
          ['1']: {
            id: '1',
            targetId: ItemId.SteelChest,
            value: rational.one,
            unit: ObjectiveUnit.Wagons,
            type: ObjectiveType.Output,
          },
        },
        Mocks.modHash,
      );
      expect(zip.objectives).toEqual({
        bare: { o: ['steel-chest**2'] },
        hash: { o: ['C6**2'] },
      });
    });

    it('should handle RateUnit Machines', () => {
      const zip = mockZipData();
      service.zipObjectives(
        zip,
        {
          ['1']: {
            id: '1',
            targetId: RecipeId.SteelChest,
            value: rational.one,
            unit: ObjectiveUnit.Machines,
            type: ObjectiveType.Output,
          },
        },
        Mocks.modHash,
      );
      expect(zip.objectives).toEqual({
        bare: { o: ['steel-chest**3'] },
        hash: { o: ['DB**3'] },
      });
    });
  });

  describe('unzipObjectives', () => {
    it('bare should unzip', () => {
      const result = service.unzipObjectives(
        {
          o: ['steel-chest*1*1'],
        },
        [],
        [],
      );
      expect(result).toEqual({
        ['1']: {
          id: '1',
          targetId: ItemId.SteelChest,
          value: rational.one,
          unit: ObjectiveUnit.Belts,
          type: ObjectiveType.Output,
        },
      });
    });

    it('hash should map values to empty strings if null', () => {
      const result = service.unzipObjectives(
        { o: ['*1'] },
        [],
        [],
        Mocks.modHash,
      );
      expect(result).toEqual({
        ['1']: {
          id: '1',
          targetId: '',
          value: rational.one,
          unit: ObjectiveUnit.Items,
          type: ObjectiveType.Output,
        },
      });
    });

    it('should map modules and beacons', () => {
      const result = service.unzipObjectives({ o: ['*1*3***0*0'] }, [], []);
      expect(result).toEqual({
        ['1']: {
          id: '1',
          targetId: '',
          value: rational.one,
          unit: ObjectiveUnit.Machines,
          type: ObjectiveType.Output,
          modules: [{}],
          beacons: [{}],
        },
      });
    });
  });

  describe('unzipItems', () => {
    it('should remove unspecified fields', () => {
      const result = service.unzipItems({
        i: ['steel-chest*transport-belt*'],
      });
      expect(result).toEqual({
        [ItemId.SteelChest]: { beltId: ItemId.TransportBelt },
      });
    });

    it('hash should map id to empty string if null', () => {
      const result = service.unzipItems({ i: ['*C*'] }, Mocks.modHash);
      expect(result).toEqual({
        ['']: { beltId: ItemId.TransportBelt },
      });
    });
  });

  describe('unzipRecipes', () => {
    it('should remove unspecified fields', () => {
      const result = service.unzipRecipes(
        {
          r: ['steel-chest*assembling-machine-2*'],
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
        { r: ['*A*'] },
        [],
        [],
        Mocks.modHash,
      );
      expect(result).toEqual({
        ['']: { machineId: ItemId.AssemblingMachine1 },
      });
    });

    it('should map modules and beacons', () => {
      const result = service.unzipRecipes({ r: ['iron-plate**0*0'] }, [], []);
      expect(result).toEqual({
        [ItemId.IronPlate]: {
          modules: [{}],
          beacons: [{}],
        },
      });
    });
  });

  describe('zipMachines', () => {
    it('should ignore empty state', () => {
      const zip = mockZipData();
      service.zipMachines(zip, {}, Mocks.modHash);
      expect(zip.config.bare.m).toBeUndefined();
    });

    it('should zip', () => {
      const zip = mockZipData();
      service.zipMachines(
        zip,
        { [ItemId.AssemblingMachine1]: {} },
        Mocks.modHash,
      );
      expect(zip.config.bare.m).toEqual(['assembling-machine-1']);
    });
  });

  describe('unzipMachines', () => {
    it('should unzip', () => {
      const result = service.unzipMachines(
        { m: ['assembling-machine-2*0*0'] },
        [],
        [],
      );
      expect(result).toEqual({
        ['assembling-machine-2']: {
          modules: [{}],
          beacons: [{}],
        },
      });
    });
  });
});
