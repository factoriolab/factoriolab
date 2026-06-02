import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { of, Subject } from 'rxjs';

import { Confirm } from '~/components/confirm/confirm';
import { rational } from '~/rational/rational';
import { ItemId } from '~/tests/item-id';
import { mockModData, mockModHash } from '~/tests/mocks/data';
import { RecipeId } from '~/tests/recipe-id';
import { TestModule } from '~/tests/test-module';
import { spread } from '~/utils/object';

import { ItemState } from '../items/item-state';
import { ObjectiveState } from '../objectives/objective';
import { ObjectiveType } from '../objectives/objective-type';
import { ObjectiveUnit } from '../objectives/objective-unit';
import { RecipeState } from '../recipes/recipe-state';
import { DisplayRate } from '../settings/display-rate';
import { MaximizeType } from '../settings/maximize-type';
import { Preset } from '../settings/preset';
import {
  initialSettingsState,
  SettingsState,
} from '../settings/settings-state';
import { initialTableState, TableState } from '../table/table-state';
import { ZTRUE } from './constants';
import { LabParams } from './lab-params';
import {
  MIN_ZIP,
  PartialState,
  RouterSync,
  ZipMachineSettings,
  ZipState,
} from './router-sync';
import { ZipData } from './zip-data';

const mockObjective: ObjectiveState = {
  id: '1',
  targetId: ItemId.SteelChest,
  value: rational.one,
  unit: ObjectiveUnit.Belts,
  type: ObjectiveType.Output,
};
const mockObjectivesState: Record<string, ObjectiveState> = {
  ['1']: mockObjective,
};
const mockMigratedObjectivesState: Record<string, ObjectiveState> = {
  ['1']: mockObjective,
  ['2']: {
    id: '2',
    targetId: ItemId.SteelChest,
    value: rational.one,
    unit: ObjectiveUnit.Machines,
    type: ObjectiveType.Output,
  },
};
const mockItemsState: Record<string, ItemState> = {
  [ItemId.SteelChest]: {
    beltId: ItemId.TransportBelt,
    wagonId: ItemId.CargoWagon,
  },
};
const mockRecipesState: Record<string, RecipeState> = {
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
  miningBonus: rational(100n),
  researchBonus: rational.zero,
  researchedTechnologyIds: new Set([ItemId.Electronics]),
  costs: {
    factor: rational(2n),
    machine: rational(10n),
    recycling: rational(1n),
    footprint: rational.one,
    unproduceable: rational.zero,
    excluded: rational(100n),
    surplus: rational.zero,
    maximize: rational(-1000000n),
  },
};
const mockZip: ZipData<LabParams> = {
  bare: { o: ['steel-chest**1'] },
  hash: { o: ['C**1'] },
};
const mockZipPartial: ZipData<LabParams> = {
  bare: {
    e: ['2*efficiency-module', '2*speed-module', '*speed-module'],
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
    icw: 'cargo-wagon',
    ifw: 'fluid-wagon',
    mbr: '1',
    mps: 'productivity-module',
    rnp: '1',
    cfa: '2',
    cma: '10',
    cun: '0',
    cex: '100',
    cmx: '-1000000',
    iex: 'C',
    och: 'A',
    ich: 'C',
    rex: 'C',
    rch: 'C',
    tre: 'C-',
    omt: '0',
  },
  hash: {
    e: ['2*D', '2*A', '*A'],
    b: ['1*1*A*8', '1*2*A'],
    i: ['C*A*A'],
    r: ['C*L*0*0*200*100'],
    mmr: 'L~I',
    mer: 'G~A',
    mbe: '1',
    mfr: 'B',
    odr: '2',
    mpr: '1',
    ibe: 'A',
    bmi: '100',
    bre: '0',
    icw: 'A',
    ifw: 'B',
    mbr: '1',
    mps: 'G',
    rnp: '1',
    cfa: '2',
    cma: '10',
    cun: '0',
    cex: '100',
    cmx: '-1000000',
    iex: 'C',
    och: 'A',
    ich: 'C',
    rex: 'C',
    rch: 'C',
    tre: 'C-',
    omt: '0',
  },
};

const mockEmpty: PartialState = {
  objectivesState: undefined,
  itemsState: undefined,
  recipesState: undefined,
  machinesState: undefined,
  settingsState: undefined,
  tableState: undefined,
};

const mockState: PartialState = {
  objectivesState: mockObjectivesState,
  itemsState: mockItemsState,
  recipesState: mockRecipesState,
  machinesState: undefined,
  settingsState: mockSettingsState,
  tableState: undefined,
};

const mockTableState: TableState = {
  filter: 'filter',
  sort: 'sort',
  asc: true,
  page: 1,
  rows: 10,
};

describe('RouterSync', () => {
  let service: RouterSync;

  const mockRoute = {
    params: new Subject<Params>(),
    queryParams: new Subject<Params>(),
    next: (params: Params, queryParams: Params): void => {
      mockRoute.params.next(params);
      mockRoute.queryParams.next(queryParams);
    },
  };
  function mockEmptyZip(): ZipData<LabParams> {
    return service.empty;
  }
  function mockEmptyMachineSettings(): ZipMachineSettings {
    return { moduleMap: {}, beaconMap: {} };
  }
  function mockZipData(
    objectives?: ZipData<LabParams>,
    config?: ZipData<LabParams>,
  ): ZipState {
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
      providers: [
        {
          provide: Confirm,
          useValue: { open: (): void => {} },
        },
      ],
    });
    service = TestBed.inject(RouterSync);
    service.route$.next(mockRoute as unknown as ActivatedRoute);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update state from route', async () => {
    spyOn(service, 'updateState');
    (service as any).modData = of(mockModData);
    (service as any).modHash = of(mockModHash);
    mockRoute.next({}, {});
    await TestBed.inject(ApplicationRef).whenStable();
    expect(service.updateState).toHaveBeenCalled();
  });

  describe('zipState', () => {
    it('should be triggered via effect', () => {
      spyOn(service['objectivesStore'], 'state').and.returnValue(
        mockObjectivesState,
      );
      spyOn(service, 'updateUrl').and.returnValue(Promise.resolve(undefined));
      service['ready'].set(true);
      TestBed.tick();
      expect(service.updateUrl).toHaveBeenCalled();
    });

    it('should zip state', () => {
      const result = service.zipState({
        objectives: {},
        items: {},
        recipes: {},
        machines: {},
        settings: initialSettingsState,
        data: service['settingsStore'].dataset(),
        hash: mockModHash,
        table: initialTableState,
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
        data: service['settingsStore'].dataset(),
        hash: mockModHash,
        table: initialTableState,
      });
      expect(result?.objectives).toEqual(mockZip);
      expect(result?.config).toEqual(mockZipPartial);
    });
  });

  describe('setGame', () => {
    it('should call setMod with the modId', async () => {
      spyOn(service, 'setMod').and.returnValue(Promise.resolve(true));
      await service.setGame('factorio');
      expect(service.setMod).toHaveBeenCalledWith('spa', undefined);
    });
  });

  describe('setMod', () => {
    it('should call the router to navigate', async () => {
      spyOn(service['router'], 'navigate').and.returnValue(
        Promise.resolve(true),
      );
      await service.setMod('spa');
      expect(service['router'].navigate).toHaveBeenCalled();
    });
  });

  describe('updateUrl', () => {
    it('should update url with products', async () => {
      spyOn(service, 'zipState').and.returnValue(mockZipData());
      spyOn(service, 'getHash').and.returnValue(Promise.resolve({ z: 'z' }));
      spyOn(service['router'], 'navigate');
      spyOnProperty(service['router'], 'url').and.returnValue('flow');
      await service.updateUrl(mockZipData());
      expect(service['router'].navigate).toHaveBeenCalledWith([], {
        queryParams: { z: 'z' },
        preserveFragment: true,
        info: { sync: true },
      });
      expect(service.stored()).toEqual('flow');
    });
  });

  describe('stepHref', () => {
    it('should return null if hash is undefined', async () => {
      spyOn(service['settingsStore'], 'modHash').and.returnValue(undefined);
      const result = await service.stepHref(
        { id: '', itemId: ItemId.Wood },
        mockEmptyZip(),
      );
      expect(result).toBeNull();
    });

    it('should return null for no items or machines', async () => {
      spyOn(service['settingsStore'], 'modHash').and.returnValue(mockModHash);
      const result = await service.stepHref(
        { id: '', itemId: ItemId.Wood },
        mockEmptyZip(),
      );
      expect(result).toBeNull();
    });

    it('should return get the hash for items from specific step', async () => {
      spyOn(service['settingsStore'], 'modHash').and.returnValue(mockModHash);
      const result = await service.stepHref(
        { id: '', itemId: ItemId.Wood, items: rational.one },
        mockEmptyZip(),
      );
      expect(result).toEqual({ o: [ItemId.Wood], v: service['version'] });
    });

    it('should return get the hash for machines from specific step', async () => {
      spyOn(service['settingsStore'], 'modHash').and.returnValue(mockModHash);
      const result = await service.stepHref(
        {
          id: '',
          recipeId: RecipeId.AdvancedCircuit,
          machines: rational.one,
        },
        mockEmptyZip(),
      );
      expect(result).toEqual({
        o: ['advanced-circuit**3'],
        v: service['version'],
      });
    });
  });

  describe('getHash', () => {
    it('should preserve a small state', async () => {
      spyOn(service['compression'], 'deflate').and.returnValue(
        Promise.resolve(''),
      );
      const result = await service.getHash(mockZipData(mockZip));
      expect(result).toEqual({ o: ['steel-chest**1'], v: service['version'] });
    });

    it('should zip a large state', async () => {
      spyOn(service['compression'], 'deflate').and.returnValue(
        Promise.resolve('test'),
      );
      service['zipTail'].v = 'a'.repeat(MIN_ZIP);
      const result = await service.getHash(mockZipData());
      expect(result).toEqual({ z: 'test', v: service['version'] });
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
    });

    it('should skip if loading empty, current state', () => {
      spyOn(service['ready'], 'set');
      service.updateState(undefined, {}, true, mockModData, mockModHash);
      expect(service['ready'].set).toHaveBeenCalled();
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
          z: 'eJxtUMsKwjAQ.BpzWIgkLYiX4MX.KHlsaiBNah5KL367SCu0WvayO8wOMzOKXBA91TfMBThwct8iRAlO3A-rJBnyGFOhCn0BLVMf6VP2MZC0ocqccVDehZ4OUt9cQNoAWuu0w6AnOkRTPb7-EOCQR0TzJawPUCh1DNAwBpwxOBMrOIwpmqqLe7gy7X5tFReRbs9gNyewNQWpkWTBjwwO7XUneJQe-MdIe1rczLNqBKyvziz75Q02PYE.',
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
            'steel-chest*assembling-machine-2*efficiency-module~efficiency-' +
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
          z: 'eJwdjDEKgDAQBH9zxVR3qWxELgmIYOcDAhaC2IiCdnm7xG52FuZMGCZrlL2R43IlZnLNRLw6TlDFVOlkM8bq7cDLXCa5A0ZPU8tLPHAU.UORgYD9swUY5QkfxkgZkw__',
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
          z: 'eJwlzD0KAjEQQOHbTPGqmdjYyDKTQBDSeYAFiwWx8QfcLmdfEssPHu-VMUzeGZN7yGPQcflkGqWXwe44SRVT5SybUbv.u7WtV.kmjAtOcNuJJ46iMwgWEjY5BlT5nQ5Gmhqn',
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
          r: 'steel-chest*assembling-machine-2*efficiency-module~efficiency-module*1*speed-module~speed-module*beacon*200*100*8',
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
          z: 'eJwlyzsKgDAQRdHdTHGrmYBgYzGJIIKdCxAsBLHxA9pl7RLt3oF394RhciRM5ihroeNyJgba3BZmxwmqmCq1LEaX.f9Nw9TLFTAanMj4EDccRT8TsLJLaXRyVy.3cxoP',
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
            'steel-chest*assembling-machine-2*efficiency-module~efficiency-' +
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
          z: 'eJwli70Kg0AQBt9mi6n2u0abFHsnSMDOBxACCiFNfsB09-xy2s0wzLsgZJ-CbBVRg6C3R7ZnK0HYtzAx1AEnuSN328RY4-rLtNztlxA3gsz8J78IHD-dhBqrvYzI9u4AgQEbJw__',
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
          z: 'eJwlijEKwkAURG.ziwfCzFbp5G8CQUjnAQKCgtiIgnZ7dtl1ioH3Zp4zxnE12ZJkikuNe5dJxmuGjaUtiCJhKW5mbfk.7Nt-iveRMrBy.lIfJEKDMeuYCu7O6n2wRuIz.QBtTByM',
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
          z: 'eJwlijEKwzAQBH9zxYDhVpVTmZMNJuAuDxAEHAhuTAJJp7cHKVsszOyeM0K2i6hBMNo927PJIOw1w8ZSF5zkjtxL0GIPsdb4.8pWrvaeSB0zty.5IHC8M2LtU0LNyVsP8h77XH40dx3.',
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
          z: 'eJwdjL0KwkAQhN9miw8CO1vZWOxFCEI6H-BAMBBEEAXtfHbZGxgY5u85I8SA7Cac5NBFkHZttleeJLJXyZWqhDsq2nZk-SWi9bWf7T1PxFhcvrQ7iY.HBmIZQaDyau5M8gH7yO0RZA9OnfwDvtcg2w__',
          v: '9',
        },
      );
    });
  });

  describe('dispatch', () => {
    it('should dispatch a state', () => {
      const load: jasmine.Spy[] = [];
      load.push(spyOn(service['objectivesStore'], 'load'));
      load.push(spyOn(service['itemsStore'], 'load'));
      load.push(spyOn(service['recipesStore'], 'load'));
      load.push(spyOn(service['machinesStore'], 'load'));
      load.push(spyOn(service['settingsStore'], 'load'));
      spyOn(service['ready'], 'set');
      service.dispatch(mockEmpty);
      load.forEach((s) => {
        expect(s).toHaveBeenCalledWith(undefined);
      });
      expect(service['ready'].set).toHaveBeenCalledWith(true);
    });
  });

  describe('beaconModuleMap', () => {
    it('should return undefined for beacons without modules', () => {
      const result = service.beaconModuleMap(
        [{}],
        service.emptyRecipeSettingsInfo,
        mockModHash,
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
        mockModHash,
      );
      expect(zip.objectives).toEqual({
        bare: { o: ['steel-chest'] },
        hash: { o: ['C'] },
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
        mockModHash,
      );
      expect(zip.objectives).toEqual({
        bare: { o: ['steel-chest**1'] },
        hash: { o: ['C**1'] },
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
        mockModHash,
      );
      expect(zip.objectives).toEqual({
        bare: { o: ['steel-chest**2'] },
        hash: { o: ['C**2'] },
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
        mockModHash,
      );
      expect(zip.objectives).toEqual({
        bare: { o: ['steel-chest**3'] },
        hash: { o: ['C**3'] },
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
        mockModHash,
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
      const result = service.unzipItems({ i: ['*A*'] }, mockModHash);
      expect(result).toEqual({
        ['']: { beltId: ItemId.TransportBelt },
      });
    });
  });

  describe('unzipRecipes', () => {
    it('should remove unspecified fields', () => {
      const result = service.unzipRecipes(
        { r: ['steel-chest*assembling-machine-2*'] },
        [],
        [],
      );
      expect(result).toEqual({
        [RecipeId.SteelChest]: { machineId: ItemId.AssemblingMachine2 },
      });
    });

    it('hash should map values to empty strings if null', () => {
      const result = service.unzipRecipes({ r: ['*K*'] }, [], [], mockModHash);
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
      service.zipMachines(zip, {}, mockModHash);
      expect(zip.config.bare.m).toBeUndefined();
    });

    it('should zip', () => {
      const zip = mockZipData();
      service.zipMachines(
        zip,
        { [ItemId.AssemblingMachine1]: {} },
        mockModHash,
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

  describe('zipTable', () => {
    it('should ignore empty state', () => {
      const zip = mockZipData();
      service.zipTable(zip, initialTableState);
      expect(zip.config.bare).toEqual({});
    });

    it('should zip', () => {
      const zip = mockZipData();
      service.zipTable(zip, mockTableState);
      expect(zip.config.bare).toHaveSize(5);
    });
  });

  describe('unzipTable', () => {
    it('should unzip empty', () => {
      const result = service.unzipTable({});
      expect(result).toBeUndefined();
    });

    it('should unzip', () => {
      const result = service.unzipTable({
        tfi: 'filter',
        tso: 'sort',
        tas: ZTRUE,
        tpg: '1',
        tro: '10',
      });
      expect(result).toEqual(mockTableState);
    });
  });
});
