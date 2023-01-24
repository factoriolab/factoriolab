import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { MemoizedSelector } from '@ngrx/store';
import { MockStore } from '@ngrx/store/testing';
import { deflate, inflate } from 'pako';
import { of } from 'rxjs';

import { ItemId, Mocks, RecipeId, TestModule } from 'src/tests';
import {
  DisplayRate,
  InserterCapacity,
  InserterTarget,
  Preset,
  Producer,
  Product,
  RateType,
  Rational,
  ResearchSpeed,
} from '~/models';
import {
  App,
  Datasets,
  Factories,
  Items,
  LabState,
  Producers,
  Products,
  Recipes,
  Settings,
} from '~/store';
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

const mockProduct: Product = {
  id: '1',
  itemId: ItemId.SteelChest,
  rate: '1',
  rateType: RateType.Belts,
};
const mockProductsState: Products.ProductsState = {
  ids: ['1'],
  entities: {
    ['1']: mockProduct,
  },
  index: 2,
};
const mockProducer: Producer = {
  id: '1',
  recipeId: ItemId.SteelChest,
  count: '1',
};
const mockProducersState: Producers.ProducersState = {
  ids: ['1'],
  entities: {
    ['1']: mockProducer,
  },
  index: 2,
};
const mockItemsState: Items.ItemsState = {
  [ItemId.SteelChest]: {
    ignore: true,
    beltId: ItemId.TransportBelt,
    wagonId: ItemId.CargoWagon,
  },
};
const mockRecipesState: Recipes.RecipesState = {
  [RecipeId.SteelChest]: {
    factoryId: ItemId.AssemblingMachine2,
    factoryModuleIds: [ItemId.EfficiencyModule, ItemId.EfficiencyModule],
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
const mockFactoriesState: Factories.FactoriesState = {
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
  disabledRecipeIds: [],
  displayRate: DisplayRate.PerHour,
  preset: Preset.Modules,
  beaconReceivers: '1',
  beltId: ItemId.TransportBelt,
  fuelId: ItemId.Coal,
  cargoWagonId: ItemId.CargoWagon,
  fluidWagonId: ItemId.FluidWagon,
  flowRate: 1200,
  miningBonus: 100,
  researchSpeed: ResearchSpeed.Speed0,
  inserterTarget: InserterTarget.Chest,
  inserterCapacity: InserterCapacity.Capacity0,
  costFactor: '2',
  costFactory: '10',
  costInput: '0',
  costIgnored: '100',
  proliferatorSprayId: ItemId.ProductivityModule,
};
const mockZip: Zip = {
  bare: 'p=steel-chest*1*1&q=steel-chest*1',
  hash: 'pC6*1*1&qDB*1',
};
const mockZipPartial: Zip = {
  bare:
    '&i=steel-chest*1*transport-belt*cargo-wagon&r=steel-chest*assembling-machine-2*effectivity-module~effectivity-module*1*speed-module' +
    '~speed-module*beacon*200*100*8&f=1*productivity-module~speed-module*1*speed-module*beacon_assembling-machine-2_steel-furnace&s=1.0*2*1*%3D*tran' +
    'sport-belt*coal*1200*100*0*0*0*cargo-wagon*fluid-wagon**2*10*0*100*1*productivity-module',
  hash: '&bB&iC6*1*C*A&rDB*B*A~A*1*G~G*A*200*100*8&f1*D~G*1*G*A_B_Q&s2*1*=*C*A*Sw*Bk*A*0*0*A*B**2*10*0*100*1*D',
};
const mockState: LabState = {
  productsState: mockProductsState,
  producersState: mockProducersState,
  itemsState: mockItemsState,
  recipesState: mockRecipesState,
  factoriesState: mockFactoriesState,
  settingsState: mockSettingsState,
} as any;
function mockEmptyZip(): Zip {
  return { bare: '', hash: '' };
}
function mockEmptyZipData(): ZipData {
  return {
    objectives: mockEmptyZip(),
    config: mockEmptyZip(),
    producerBeaconMap: {},
    recipeBeaconMap: {},
  };
}

describe('RouterService', () => {
  let service: RouterService;
  let mockStore: MockStore<LabState>;
  let mockGetZipState: MemoizedSelector<
    LabState,
    {
      products: Products.ProductsState;
      producers: Producers.ProducersState;
      items: Items.ItemsState;
      recipes: Recipes.RecipesState;
      factories: Factories.FactoriesState;
      settings: Settings.SettingsState;
    }
  >;
  let router: Router;
  let dataSvc: DataService;

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
    mockGetZipState = mockStore.overrideSelector(Products.getZipState, {
      products: Products.initialProductsState,
      producers: Producers.initialProducersState,
      items: Items.initialItemsState,
      recipes: Recipes.initialRecipesState,
      factories: Factories.initialFactoriesState,
      settings: Settings.initialSettingsState,
    });
    router = TestBed.inject(Router);
    dataSvc = TestBed.inject(DataService);
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
      products: Products.initialProductsState,
      producers: Producers.initialProducersState,
      items: { [ItemId.Wood]: { ignore: true } },
      recipes: Recipes.initialRecipesState,
      factories: Factories.initialFactoriesState,
      settings: Settings.initialSettingsState,
    });
    mockStore.refreshState();
    service.first = true;
  });

  describe('updateUrl', () => {
    it('should update url with products', () => {
      spyOn(service, 'zipState').and.returnValue(of(mockEmptyZipData()));
      spyOn(service, 'getHash').and.returnValue('test');
      spyOn(router, 'navigateByUrl');
      service.updateUrl(
        Products.initialProductsState,
        Producers.initialProducersState,
        Items.initialItemsState,
        Recipes.initialRecipesState,
        Factories.initialFactoriesState,
        Settings.initialSettingsState
      );
      expect(router.navigateByUrl).toHaveBeenCalledWith('/?test');
    });

    it('should preserve a hash', () => {
      spyOn(service, 'zipState').and.returnValue(of(mockEmptyZipData()));
      spyOn(service, 'getHash').and.returnValue('test');
      spyOn(router, 'navigateByUrl');
      spyOnProperty(router, 'url').and.returnValue('path#hash');
      service.updateUrl(
        Products.initialProductsState,
        Producers.initialProducersState,
        Items.initialItemsState,
        Recipes.initialRecipesState,
        Factories.initialFactoriesState,
        Settings.initialSettingsState
      );
      expect(router.navigateByUrl).toHaveBeenCalledWith('path?test#hash');
    });
  });

  describe('zipState', () => {
    it('should zip state', () => {
      let zip: ZipData | undefined;
      service
        .zipState(
          Products.initialProductsState,
          Producers.initialProducersState,
          Items.initialItemsState,
          Recipes.initialRecipesState,
          Factories.initialFactoriesState,
          Settings.initialSettingsState
        )
        .subscribe((z) => (zip = z));
      expect(zip).toEqual(mockEmptyZipData());
    });

    it('should zip full state', () => {
      let zip: ZipData | undefined;
      service
        .zipState(
          mockProductsState,
          mockProducersState,
          mockItemsState,
          mockRecipesState,
          mockFactoriesState,
          mockSettingsState
        )
        .subscribe((z) => (zip = z));
      expect(zip?.objectives).toEqual(mockZip);
      expect(zip?.config).toEqual(mockZipPartial);
    });
  });

  describe('stepHref', () => {
    it('should return null for no items', () => {
      expect(
        service.stepHref(
          { id: '', itemId: ItemId.Wood },
          mockEmptyZip(),
          Mocks.Hash
        )
      ).toBeNull();
    });

    it('should return get the hash for a specific step', () => {
      spyOn(service, 'zipProducts');
      spyOn(service, 'getHash').and.returnValue('test');
      expect(
        service.stepHref(
          { id: '', itemId: ItemId.Wood, items: Rational.one },
          mockEmptyZip(),
          Mocks.Hash
        )
      ).toEqual('?test');
    });
  });

  describe('getHash', () => {
    it('should preserve a small state', () => {
      spyOn(service, 'bytesToBase64').and.returnValue('');
      const result = service.getHash(mockEmptyZipData());
      expect(result).toEqual(`${mockZip.bare}&v=${service.bareVersion}`);
    });

    it('should zip a large state', () => {
      spyOn(service, 'bytesToBase64').and.returnValue('test');
      service.zipTail.bare = 'a'.repeat(MIN_ZIP);
      const result = service.getHash(mockEmptyZipData());
      expect(result).toEqual('z=test&v=5');
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
      spyOn(window, 'alert');
      const url =
        '/#z=eJxtUNsKwyAM.Zr5EHDUFsZeZC.7j6E2toJVp3ZjL.v2dbSD2pUQyOXk5CSBp4xoqeoxZWDAyL2sEMkZMRtUjsKl4GOmEm0GJWLn6VN03pFYQEVKOEhrXEcHoXrjkNaAWqPK5mHyiw6-HS2-.0vTlhQQ2x9inYBEobyDuqqATX4mmjMIcWpueIupknEhue1JvM036DE6oZAkzo4VHJrrzuleWGBfIc1pUTPb6ieg7WjaJb58AJs7glk_';
      (router.events as any).next(new NavigationEnd(2, url, url));

      // const newZip = service.bytesToBase64(
      //   deflate(
      //     mockZip.bare +
      //       '&b=1&i=steel-chest*1*transport-belt*cargo-wagon&r=steel-chest*assembling-machine-2*effectivity-module~effectiv' +
      //       'ity-module*1*speed-module~speed-module*beacon*200*100*8&f=1*productivity-module~speed-module*1*speed-module*beacon_assembling-machine-2' +
      //       '_steel-furnace&s=1.0*%3D*1*transport-belt*coal*1200*3600*100*0*0*0*cargo-wagon*fluid-wagon*?'
      //   )
      // );
      // console.log(newZip);

      const mockStateV0: App.PartialState = {
        ...mockState,
        ...{ settingsState: { ...mockState.settingsState } },
      };
      delete mockStateV0.settingsState?.beaconReceivers;
      delete mockStateV0.settingsState?.costFactor;
      delete mockStateV0.settingsState?.costFactory;
      delete mockStateV0.settingsState?.costInput;
      delete mockStateV0.settingsState?.costIgnored;
      delete mockStateV0.settingsState?.proliferatorSprayId;
      expect(service.dispatch).toHaveBeenCalledWith(
        mockZip.bare +
          '&b=1&i=steel-chest*1*transport-belt*cargo-wagon&r=steel-chest*assembling-machine-2*effectivity-module~effectiv' +
          'ity-module*1*speed-module~speed-module*beacon*200*100*8&f=1*productivity-module~speed-module*1*speed-module*beacon_assembling-machine-2' +
          '_steel-furnace&s=1.0*%3D*1*transport-belt*coal*1200*3600*100*0*0*0*cargo-wagon*fluid-wagon*?',
        mockStateV0
      );
      expect(window.alert).toHaveBeenCalled(); // Log warning for expensive field
    });

    it('should unzip empty v1', () => {
      const v1Empty = 'p=&v=1';
      const url = `/?${v1Empty}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(v1Empty, {} as any);
    });

    it('should unzip v1', () => {
      spyOn(window, 'alert');
      const v1Full =
        'p=steel-chest*1*1&i=steel-chest*1*transport-belt*cargo-wagon&r=steel-chest*assembling-machine-2*effectivity-module~effectivity-module*1*speed-module' +
        '~speed-module*beacon*200*100*8&f=1*productivity-module~speed-module*1*speed-module*beacon_assembling-machine-2_steel-furnace&s=1.0*2*1*=*tran' +
        'sport-belt*coal*1200*100*0*0*0*1*cargo-wagon*fluid-wagon*?*2*10*0*100*1*productivity-module&v=1';
      const url = `/?${v1Full}`;
      (router.events as any).next(new NavigationEnd(2, url, url));

      const mockStateV1 = { ...mockState } as Partial<LabState>;
      delete mockStateV1.producersState;
      expect(service.dispatch).toHaveBeenCalledWith(v1Full, mockStateV1);
      expect(window.alert).toHaveBeenCalled(); // Log warning for expensive field
    });

    it('should unzip empty v2', () => {
      const url = '/?z=eJwrUCszAgADVAE.';
      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null])
      );
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v2', {} as any);
    });

    it('should unzip v2', () => {
      spyOn(window, 'alert');
      const url =
        '/?z=eJwdjLEKgDAMRP8mw01NB3ERSVpwFj-g4CCIiyjo1m.3KuGSXI6XM3VQqKwu-78mmFzZ4bBq7FOdYIghQKleNkXmiQGseJnljqSGxmF54QdnYCkaPYLpb9sDZHniBxSMGkU_';

      // const newZip = service.bytesToBase64(
      //   deflate(
      //     'pC6*1*1&bB&iC6*1*C*A&rDB*B*A~A*B*G~G*A*200*100*8&f1*D~G*B*G*A_B_Q&s2*1*=*C*A*Sw*Bk*A*0*0*1*A*B*?*2*10*0*100*1*D&v2'
      //   )
      // );
      // console.log(newZip);

      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null])
      );
      (router.events as any).next(new NavigationEnd(2, url, url));
      const mockStateV2 = { ...mockState } as Partial<LabState>;
      delete mockStateV2.producersState;
      expect(service.dispatch).toHaveBeenCalledWith(
        'pC6*1*1&bB&iC6*1*C*A&rDB*B*A~A*B*G~G*A*200*100*8&f1*D~G*B*G*A_B_Q&s2*1*=*C*A*Sw*Bk*A*0*0*1*A*B*?*2*10*0*100*1*D&v2',
        mockStateV2
      );
      expect(window.alert).toHaveBeenCalled(); // Log warning for expensive field
    });

    it('should unzip empty v3', () => {
      const url = '/?z=eJwrUCszBgADVQFA';
      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null])
      );
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v3', {} as any);
    });

    it('should unzip v3', () => {
      spyOn(window, 'alert');
      const url =
        '/?z=eJwdjL0KgEAMg9-mQ6brCeIi0t6Bs.gABw6CuPgDuvnsRilt-BLSLdVQqOzZeSeX5TcSTA5aDnuM3D89DDEEKLeRWZFpMYAVL4OckdB-PYw3fKUGjlIdHZj--D1Alqt6AbeMG5w_';

      // const newZip = service.bytesToBase64(
      //   deflate(
      //     'pC6*1*1&qDB*1&bB&iC6*1*C*A&rDB*B*A~A*1*G~G*A*200*100*8&f1*D~G*1*G*A_B_Q&s2*1*=*C*A*Sw*Bk*A*0*0*1*A*B*?*2*10*0*100*1*D&v3'
      //   )
      // );
      // console.log(newZip);

      spyOn(dataSvc, 'requestData').and.returnValue(
        of([Mocks.Data, Mocks.Hash, null])
      );
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(
        'pC6*1*1&qDB*1&bB&iC6*1*C*A&rDB*B*A~A*1*G~G*A*200*100*8&f1*D~G*1*G*A_B_Q&s2*1*=*C*A*Sw*Bk*A*0*0*1*A*B*?*2*10*0*100*1*D&v3',
        mockState
      );
      expect(window.alert).toHaveBeenCalled(); // Log warning for expensive field
    });
  });

  describe('dispatch', () => {
    it('should dispatch a state', () => {
      spyOn(mockStore, 'dispatch');
      service.dispatch('test', mockState);
      expect(service.zip).toEqual('test');
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        new App.LoadAction(mockState)
      );
    });
  });

  describe('migrate', () => {
    it('should return latest version without alteration', () => {
      const originalParams = { [Section.Version]: ZipVersion.Version4 };
      const [params, _] = service.migrate({ ...originalParams });
      expect(params).toEqual(originalParams);
    });
  });

  describe('migrateV0', () => {
    it('should handle unrecognized/null baseid', () => {
      const [params, _] = service.migrateV0({ [Section.Settings]: '---' }, []);
      expect(params[Section.Settings]).toEqual(NULL);
    });

    it('should handle preset without other settings', () => {
      const [params, _] = service.migrateV0({ [Section.Mod]: '0' }, []);
      expect(params[Section.Settings]).toEqual('?*?*0');
    });
  });

  describe('migrateV2', () => {
    it('should handle undefined beaconCount', () => {
      const [params, _] = service.migrateV2(
        {
          [Section.Recipes]: '***?',
          [Section.Factories]: '**?',
        },
        []
      );
      expect(params[Section.Recipes]).toEqual('');
      expect(params[Section.Factories]).toEqual('');
    });
  });

  describe('zipProducts', () => {
    it('should handle RateType Items', () => {
      const zip = mockEmptyZipData();
      service.zipProducts(
        zip,
        [
          {
            id: '0',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Items,
            viaId: ItemId.IronOre,
          },
        ],
        Mocks.Hash
      );
      expect(zip.objectives).toEqual({
        bare: 'p=steel-chest*1**iron-ore',
        hash: 'pC6*1**Bd',
      });
    });

    it('should handle RateType Belts', () => {
      const zip = mockEmptyZipData();
      service.zipProducts(
        zip,
        [
          {
            id: '0',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Belts,
            viaId: ItemId.IronOre,
          },
        ],
        Mocks.Hash
      );
      expect(zip.objectives).toEqual({
        bare: 'p=steel-chest*1*1*iron-ore',
        hash: 'pC6*1*1*Bd',
      });
    });

    it('should handle RateType Wagons', () => {
      const zip = mockEmptyZipData();
      service.zipProducts(
        zip,
        [
          {
            id: '0',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Wagons,
            viaId: ItemId.IronOre,
          },
        ],
        Mocks.Hash
      );
      expect(zip.objectives).toEqual({
        bare: 'p=steel-chest*1*2*iron-ore',
        hash: 'pC6*1*2*Bd',
      });
    });

    it('should handle RateType Factories', () => {
      const zip = mockEmptyZipData();
      service.zipProducts(
        zip,
        [
          {
            id: '0',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Factories,
            viaId: ItemId.IronOre,
          },
        ],
        Mocks.Hash
      );
      expect(zip.objectives).toEqual({
        bare: 'p=steel-chest*1*3*iron-ore',
        hash: 'pC6*1*3*Bl',
      });
    });
  });

  describe('unzipProducts', () => {
    it('bare should unzip', () => {
      const result = service.unzipProducts({
        ['p']: 'steel-chest*1*3*iron-ore',
      });
      expect(result).toEqual({
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Factories,
            viaId: ItemId.IronOre,
          },
        },
        index: 2,
      });
    });

    it('hash should handle RateType Items', () => {
      const result = service.unzipProducts({ ['p']: 'C6*1**Bd' }, Mocks.Hash);
      expect(result).toEqual({
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Items,
            viaId: ItemId.IronOre,
          },
        },
        index: 2,
      });
    });

    it('hash should handle RateType Belts', () => {
      const result = service.unzipProducts({ ['p']: 'C6*1*1*Bd' }, Mocks.Hash);
      expect(result).toEqual({
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Belts,
            viaId: ItemId.IronOre,
          },
        },
        index: 2,
      });
    });

    it('hash should handle RateType Wagons', () => {
      const result = service.unzipProducts({ ['p']: 'C6*1*2*Bd' }, Mocks.Hash);
      expect(result).toEqual({
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Wagons,
            viaId: ItemId.IronOre,
          },
        },
        index: 2,
      });
    });

    it('hash should handle RateType Factories', () => {
      const result = service.unzipProducts({ ['p']: 'C6*1*3*Bl' }, Mocks.Hash);
      expect(result).toEqual({
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Factories,
            viaId: ItemId.IronOre,
          },
        },
        index: 2,
      });
    });

    it('hash should map values to empty strings if null', () => {
      const result = service.unzipProducts({ ['p']: '*1**Bd' }, Mocks.Hash);
      expect(result).toEqual({
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            itemId: '',
            rate: '1',
            rateType: RateType.Items,
            viaId: ItemId.IronOre,
          },
        },
        index: 2,
      });
    });
  });

  describe('unzipProducers', () => {
    it('hash should map values to empty strings if null', () => {
      const result = service.unzipProducers({ ['q']: '*1' }, [], Mocks.Hash);
      expect(result).toEqual({
        ids: ['1'],
        entities: {
          ['1']: {
            id: '1',
            recipeId: '',
            count: '1',
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
        [ItemId.SteelChest]: { ignore: true, beltId: ItemId.TransportBelt },
      });
    });

    it('hash should map id to empty string if null', () => {
      const result = service.unzipItems({ ['i']: '*1*C*' }, Mocks.Hash);
      expect(result).toEqual({
        ['']: { ignore: true, beltId: ItemId.TransportBelt },
      });
    });
  });

  describe('unzipRecipes', () => {
    it('should remove unspecified fields', () => {
      const result = service.unzipRecipes(
        {
          ['r']: 'steel-chest*assembling-machine-2*',
        },
        []
      );
      expect(result).toEqual({
        [RecipeId.SteelChest]: { factoryId: ItemId.AssemblingMachine2 },
      });
    });

    it('hash should map values to empty strings if null', () => {
      const result = service.unzipRecipes({ ['r']: '*A*' }, [], Mocks.Hash);
      expect(result).toEqual({
        ['']: { factoryId: ItemId.AssemblingMachine1 },
      });
    });
  });

  describe('zipFactories', () => {
    it('should handle null ids', () => {
      service.zipFactories(
        mockEmptyZipData(),
        {
          ids: undefined,
          entities: { ['']: {} },
        },
        Mocks.Hash
      );
      expect(mockEmptyZipData).toEqual({ bare: '', hash: '' });
    });
  });

  describe('unzipFactories', () => {
    it('bare should unzip empty ids', () => {
      const result = service.unzipFactories({ ['f']: '_' });
      expect(result).toEqual({
        ids: undefined,
        entities: {},
      });
    });

    it('hash should unzip empty ids', () => {
      const result = service.unzipFactories({ ['f']: '_' }, Mocks.Hash);
      expect(result).toEqual({
        ids: undefined,
        entities: {},
      });
    });

    it('hash should map values to empty strings if null', () => {
      const result = service.unzipFactories({ ['f']: '1_?**1' }, Mocks.Hash);
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
        service.zipDiffDisplayRate(DisplayRate.PerMinute, DisplayRate.PerMinute)
      ).toEqual('');
    });

    it('should handle falsy', () => {
      expect(
        service.zipDiffDisplayRate(undefined, DisplayRate.PerMinute)
      ).toEqual(NULL);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffDisplayRate(DisplayRate.PerSecond, -1)).toEqual(
        '0'
      );
      expect(service.zipDiffDisplayRate(DisplayRate.PerMinute, -1)).toEqual(
        '1'
      );
      expect(service.zipDiffDisplayRate(DisplayRate.PerHour, -1)).toEqual('2');
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

  describe('zipDiffArray', () => {
    it('should handle default', () => {
      expect(service.zipDiffArray(['a', 'b'], ['b', 'a'])).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffArray(undefined, [])).toEqual(NULL);
      expect(service.zipDiffArray([], undefined)).toEqual(EMPTY);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffArray(['b', 'a'], ['a', 'c'])).toEqual('a~b');
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

  describe('zipDiffNArray', () => {
    it('should handle default', () => {
      expect(service.zipDiffNArray(['a', 'b'], ['b', 'a'], [])).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffNArray(undefined, [], [])).toEqual(NULL);
      expect(service.zipDiffNArray([], undefined, [])).toEqual(EMPTY);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffNArray(['b', 'a'], ['a', 'c'], ['a', 'b'])).toEqual(
        'A~B'
      );
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
        'B~A'
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
        'Unable to parse base64 string.'
      );
    });

    it('should check code validity', () => {
      expect(() => service.getBase64Code(0)).toThrowError(
        'Unable to parse base64 string.'
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
        'Unable to parse base64 string.'
      );
    });

    it('should check for invalid missing octets', () => {
      expect(() => service.base64ToBytes('_aaa')).toThrowError(
        'Unable to parse base64 string.'
      );
    });

    it('should handle trailing octets', () => {
      expect(
        inflate(service.base64ToBytes('eJxLTAQAASUAww__'), { to: 'string' })
      ).toEqual('aa');
      expect(
        inflate(service.base64ToBytes('eJxLTEwEAAJJASQ_'), { to: 'string' })
      ).toEqual('aaa');
    });

    it('should convert string to bytes', () => {
      const result = inflate(
        service.base64ToBytes('eJxLTEpOSU1Lz8jMAgAVhgP4'),
        { to: 'string' }
      );
      expect(result).toEqual('abcdefghij');
    });
  });
});
