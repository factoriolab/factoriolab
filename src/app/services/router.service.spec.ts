import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';
import { deflate, inflate } from 'pako';
import { of } from 'rxjs';

import { Mocks, ItemId, RecipeId } from 'src/tests';
import {
  RateType,
  Product,
  DisplayRate,
  ResearchSpeed,
  Preset,
  InserterTarget,
  InserterCapacity,
  Rational,
  ModHash,
} from '~/models';
import { reducers, metaReducers, State } from '~/store';
import { LoadAction } from '~/store/app.actions';
import { FactoriesState, initialFactoriesState } from '~/store/factories';
import { IgnoreItemAction, initialItemsState, ItemsState } from '~/store/items';
import { initialProductsState, ProductsState } from '~/store/products';
import { initialRecipesState, RecipesState } from '~/store/recipes';
import { initialSettingsState, SettingsState } from '~/store/settings';
import {
  RouterService,
  EMPTY,
  NULL,
  TRUE,
  FALSE,
  Zip,
  MIN_ZIP,
  ZipVersion,
} from './router.service';

const mockProduct: Product = {
  id: '0',
  itemId: ItemId.SteelChest,
  rate: '1',
  rateType: RateType.Belts,
};
const mockProductsState: ProductsState = {
  ids: ['0'],
  entities: {
    ['0']: mockProduct,
  },
  index: 1,
};
const mockItemsState: ItemsState = {
  [ItemId.SteelChest]: {
    ignore: true,
    belt: ItemId.TransportBelt,
    wagon: ItemId.CargoWagon,
  },
};
const mockRecipesState: RecipesState = {
  [RecipeId.SteelChest]: {
    factory: ItemId.AssemblingMachine2,
    factoryModules: [ItemId.EfficiencyModule, ItemId.EfficiencyModule],
    beaconCount: '1',
    beacon: ItemId.Beacon,
    beaconModules: [ItemId.SpeedModule, ItemId.SpeedModule],
    overclock: 200,
    cost: '100',
    beaconTotal: '8',
  },
};
const mockFactoriesState: FactoriesState = {
  ids: [ItemId.AssemblingMachine2, ItemId.SteelFurnace],
  entities: {
    ['']: {
      moduleRank: [ItemId.ProductivityModule, ItemId.SpeedModule],
      beaconCount: '1',
      beacon: ItemId.Beacon,
      beaconModule: ItemId.SpeedModule,
    },
  },
};
const mockSettingsState: SettingsState = {
  baseId: '1.0',
  disabledRecipes: [],
  expensive: true,
  displayRate: DisplayRate.PerHour,
  preset: Preset.Modules,
  beaconReceivers: '1',
  belt: ItemId.TransportBelt,
  pipe: null,
  fuel: ItemId.Coal,
  cargoWagon: ItemId.CargoWagon,
  fluidWagon: ItemId.FluidWagon,
  flowRate: 1200,
  miningBonus: 100,
  researchSpeed: ResearchSpeed.Speed0,
  inserterTarget: InserterTarget.Chest,
  inserterCapacity: InserterCapacity.Capacity0,
  costFactor: '2',
  costFactory: '10',
  costInput: '0',
  costIgnored: '100',
};
const mockZip: Zip = {
  bare: 'p=steel-chest*1*1',
  hash: 'pC6*1*1',
};
const mockZipPartial: Zip = {
  bare:
    '&i=steel-chest*1*transport-belt*cargo-wagon&r=steel-chest*assembling-machine-2*effectivity-module~effectivity-module*1*speed-module' +
    '~speed-module*beacon*200*100*8&f=1*productivity-module~speed-module*1*speed-module*beacon_assembling-machine-2_steel-furnace&s=1.0*2*1*=*tran' +
    'sport-belt*coal*1200*100*0*0*0*1*cargo-wagon*fluid-wagon**2*10*0*100*1',
  hash: '&bB&iC6*1*C*A&rDB*B*A~A*1*G~G*A*200*100*8&f1*D~G*1*G*A_B_Q&s2*1*=*C*A*Sw*Bk*A*0*0*1*A*B**2*10*0*100*1',
};
const mockState: State = {
  productsState: mockProductsState,
  itemsState: mockItemsState,
  recipesState: mockRecipesState,
  factoriesState: mockFactoriesState,
  settingsState: mockSettingsState,
} as any;

describe('RouterService', () => {
  let service: RouterService;
  let store: Store<State>;
  let router: Router;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers, { metaReducers }),
      ],
    });
    service = TestBed.inject(RouterService);
    store = TestBed.inject(Store);
    router = TestBed.inject(Router);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update state from router', () => {
    spyOn(service, 'updateState');
    (router.events as any).next(new NavigationEnd(2, '/', '/'));
    expect(service.updateState).toHaveBeenCalled();
  });

  it('should run first update of url if settings modified', () => {
    spyOn(service, 'updateUrl');
    service.first = true;
    store.dispatch(new IgnoreItemAction(ItemId.Wood));
    expect(service.updateUrl).toHaveBeenCalled();
  });

  describe('updateUrl', () => {
    it('should update url with products', () => {
      spyOn(service, 'zipState').and.returnValue(of(null));
      spyOn(service, 'getHash').and.returnValue('test');
      spyOn(router, 'navigateByUrl');
      service.updateUrl(null, null, null, null, null);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/?test');
    });

    it('should preserve a hash', () => {
      spyOn(service, 'zipState').and.returnValue(of(null));
      spyOn(service, 'getHash').and.returnValue('test');
      spyOn(router, 'navigateByUrl');
      spyOnProperty(router, 'url').and.returnValue('path#hash');
      service.updateUrl(null, null, null, null, null);
      expect(router.navigateByUrl).toHaveBeenCalledWith('path?test#hash');
    });
  });

  describe('zipState', () => {
    it('should zip state', () => {
      spyOn(service, 'requestHash').and.returnValue(of(Mocks.Hash));
      let zip: Zip;
      service
        .zipState(
          initialProductsState,
          initialItemsState,
          initialRecipesState,
          initialFactoriesState,
          initialSettingsState
        )
        .subscribe((z) => (zip = z));
      expect(zip).toEqual({ bare: 'p=', hash: 'p' });
      expect(service.zipPartial).toEqual({ bare: '', hash: '' });
    });

    it('should zip full state', () => {
      spyOn(service, 'requestHash').and.returnValue(of(Mocks.Hash));
      let zip: Zip;
      service
        .zipState(
          mockProductsState,
          mockItemsState,
          mockRecipesState,
          mockFactoriesState,
          mockSettingsState
        )
        .subscribe((z) => (zip = z));
      expect(zip).toEqual(mockZip);
      expect(service.zipPartial).toEqual(mockZipPartial);
    });
  });

  describe('stepHref', () => {
    it('should return null for no items', () => {
      expect(
        service.stepHref({ itemId: ItemId.Wood, items: null }, null)
      ).toBeNull();
    });

    it('should return get the hash for a specific step', () => {
      spyOn(service, 'zipProducts').and.returnValue(null);
      spyOn(service, 'getHash').and.returnValue('test');
      expect(
        service.stepHref({ itemId: ItemId.Wood, items: Rational.one }, null)
      ).toEqual('?test');
    });
  });

  describe('getHash', () => {
    it('should preseve a small state', () => {
      spyOn(service, 'bytesToBase64').and.returnValue('');
      const result = service.getHash(mockZip);
      expect(result).toEqual(mockZip.bare + '&v=1');
    });

    it('should zip a large state', () => {
      spyOn(service, 'bytesToBase64').and.returnValue('test');
      service.zipTail.bare = 'a'.repeat(MIN_ZIP);
      const result = service.getHash(mockZip);
      expect(result).toEqual('z=test');
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
      (router.events as any).next(new NavigationStart(2, null));
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
      (router.events as any).next(new NavigationEnd(2, '/#z=test', '/#z=test'));
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('should unzip empty v0', () => {
      const url = '/#z=eJwrsAUAAR8Arg==';
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p=', {} as any);
    });

    it('should unzip v0', () => {
      const url =
        '/#z=eJxtUNsKwyAM.RsfAo7awdiL7FNGtLEVrIrajb3s2-doB21XQiCXk5OTRJkLkeN6oFxAgGBKCmZ31ZLQ5xhS4YpcAY2pD.yJffAsbaCYM43KWd.zEfVgPfEWyBjSxT5sefExdJOj93-pbsmRqPsh1gkoQh08tE0DovqVGSkgptrc8W6mtowLyf1I4n2-wUzJoyaWpTg1IA8OD-hAfGWcL4uW2VYfAeMm2y3xDdqKghkqPjXffsE_';
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(
        mockZip.bare +
          '&b=1&i=steel-chest*1*transport-belt*cargo-wagon&r=steel-chest*assembling-machine-2*effectivity-module~effectiv' +
          'ity-module*1*speed-module~speed-module*beacon*200*100*8&f=1*productivity-module~speed-module*1*speed-module*beacon_assembling-machine-2' +
          '_steel-furnace&s=1.0*=*1*transport-belt*coal*1200*3600*100*0*0*0*cargo-wagon*fluid-wagon*?*2*10*0*100*1',
        mockState
      );
    });

    it('should unzip empty v1', () => {
      const v1Empty = 'p=&v=1';
      const url = `/?${v1Empty}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(v1Empty, {} as any);
    });

    it('should unzip v1', () => {
      const v1Full =
        mockZip.bare +
        // Replace empty with explicit null
        mockZipPartial.bare.replace('fluid-wagon**', 'fluid-wagon*?*') +
        '&v=1';
      const url = `/?${v1Full}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(v1Full, mockState);
    });

    it('should unzip empty v2', () => {
      const url = '/?z=eJwrUCszAgADVAE.';
      spyOn(service, 'requestHash').and.returnValue(of(Mocks.Hash));
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v2', {} as any);
    });

    it('should unzip v2', () => {
      const url =
        '/?z=eJwrcDbTMtQyVEtyUssEM521HNWKXJy0nLQc6xyBpHudu5ajlpGBgZYhEFuopRlquQCFgBJajvFO8YFqxUZAXbYgfVrB5VpO2UDaAAgNtUC67bWAsmAuyAC1MiMA4IkZ1w__';
      spyOn(service, 'requestHash').and.returnValue(of(Mocks.Hash));
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(
        'pC6*1*1&bB&iC6*1*C*A&rDB*B*A~A*B*G~G*A*200*100*8&f1*D~G*B*G*A_B_Q&s2*1*=*C*A*Sw*Bk*A*0*0*1*A*B*?*2*10*0*100*1&v2',
        mockState
      );
    });

    it('should unzip empty v3', () => {
      const url = '/?z=eJwrUCszBgADVQFA';
      spyOn(service, 'requestHash').and.returnValue(of(Mocks.Hash));
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p&v3', {} as any);
    });

    it('should unzip v3', () => {
      const url =
        '/?z=eJwdjLEKgDAMRP8mw02NgriIJC04ix9QcBDERRR089u9lhAu747LGTsoVFaXvZ4RJldyOOwz8vRNMDQhQLm9bIpEiwEse57lbghD6WF54Qc1cJTqGMG0YnkgT.sD13EZtg__';
      spyOn(service, 'requestHash').and.returnValue(of(Mocks.Hash));
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(
        'pC6*1*1&bB&iC6*1*C*A&rDB*B*A~A*1*G~G*A*200*100*8&f1*D~G*1*G*A_B_Q&s2*1*=*C*A*Sw*Bk*A*0*0*1*A*B*?*2*10*0*100*1&v3',
        mockState
      );
    });
  });

  describe('dispatch', () => {
    it('should dispatch a state', () => {
      spyOn(store, 'dispatch');
      service.dispatch('test', mockState);
      expect(service.zip).toEqual('test');
      expect(store.dispatch).toHaveBeenCalledWith(new LoadAction(mockState));
    });
  });

  describe('zipProducts', () => {
    it('should handle RateType Items', () => {
      const result = service.zipProducts(
        [
          {
            id: '0',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Items,
            viaId: ItemId.IronOre,
            viaSetting: ItemId.IronOre,
          },
        ],
        Mocks.Hash
      );
      expect(result).toEqual({
        bare: 'p=steel-chest*1**iron-ore*iron-ore',
        hash: 'pC6*1**Bd*Bd',
      });
    });

    it('should handle RateType Belts', () => {
      const result = service.zipProducts(
        [
          {
            id: '0',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Belts,
            viaId: ItemId.IronOre,
            viaSetting: ItemId.TransportBelt,
          },
        ],
        Mocks.Hash
      );
      expect(result).toEqual({
        bare: 'p=steel-chest*1*1*iron-ore*transport-belt',
        hash: 'pC6*1*1*Bd*C',
      });
    });

    it('should handle RateType Wagons', () => {
      const result = service.zipProducts(
        [
          {
            id: '0',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Wagons,
            viaId: ItemId.IronOre,
            viaSetting: ItemId.CargoWagon,
          },
        ],
        Mocks.Hash
      );
      expect(result).toEqual({
        bare: 'p=steel-chest*1*2*iron-ore*cargo-wagon',
        hash: 'pC6*1*2*Bd*A',
      });
    });

    it('should handle RateType Factories', () => {
      const result = service.zipProducts(
        [
          {
            id: '0',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Factories,
            viaId: ItemId.IronOre,
            viaSetting: ItemId.AssemblingMachine2,
            viaFactoryModules: [],
            viaBeaconCount: '1',
            viaBeaconModules: [],
            viaBeacon: ItemId.Beacon,
          },
        ],
        Mocks.Hash
      );
      expect(result).toEqual({
        bare: 'p=steel-chest*1*3*iron-ore*assembling-machine-2*%3D*1*%3D*beacon',
        hash: 'pC6*1*3*Bl*B*=*1*=*A',
      });
    });
  });

  describe('unzipProducts', () => {
    it('v1 should unzip', () => {
      const result = service.unzipProducts(
        {
          ['p']: 'steel-chest*1*3*iron-ore',
        },
        ZipVersion.Version0,
        Mocks.Hash
      );
      expect(result).toEqual({
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Factories,
            viaId: ItemId.IronOre,
          },
        },
        index: 1,
      });
    });

    it('v2 should handle RateType Items', () => {
      const result = service.unzipProducts(
        { ['p']: 'C6*1**Bd' },
        ZipVersion.Version2,
        Mocks.Hash
      );
      expect(result).toEqual({
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Items,
            viaId: ItemId.IronOre,
          },
        },
        index: 1,
      });
    });

    it('v2 should handle RateType Belts', () => {
      const result = service.unzipProducts(
        { ['p']: 'C6*1*1*Bd*C' },
        ZipVersion.Version2,
        Mocks.Hash
      );
      expect(result).toEqual({
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Belts,
            viaId: ItemId.IronOre,
            viaSetting: ItemId.TransportBelt,
          },
        },
        index: 1,
      });
    });

    it('v2 should handle RateType Wagons', () => {
      const result = service.unzipProducts(
        { ['p']: 'C6*1*2*Bd*A' },
        ZipVersion.Version2,
        Mocks.Hash
      );
      expect(result).toEqual({
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Wagons,
            viaId: ItemId.IronOre,
            viaSetting: ItemId.CargoWagon,
          },
        },
        index: 1,
      });
    });

    it('v2 should handle RateType Factories', () => {
      const result = service.unzipProducts(
        { ['p']: 'C6*1*3*Bl' },
        ZipVersion.Version2,
        Mocks.Hash
      );
      expect(result).toEqual({
        ids: ['0'],
        entities: {
          ['0']: {
            id: '0',
            itemId: ItemId.SteelChest,
            rate: '1',
            rateType: RateType.Factories,
            viaId: ItemId.IronOre,
          },
        },
        index: 1,
      });
    });
  });

  describe('unzipItems', () => {
    it('should remove unspecified fields', () => {
      const result = service.unzipItems(
        { ['i']: 'steel-chest*1*transport-belt*' },
        ZipVersion.Version0
      );
      expect(result).toEqual({
        [ItemId.SteelChest]: { ignore: true, belt: ItemId.TransportBelt },
      });
    });
  });

  describe('unzipRecipes', () => {
    it('should remove unspecified fields', () => {
      const result = service.unzipRecipes(
        { ['r']: 'steel-chest*assembling-machine-2*' },
        ZipVersion.Version0
      );
      expect(result).toEqual({
        [RecipeId.SteelChest]: { factory: ItemId.AssemblingMachine2 },
      });
    });
  });

  describe('zipFactories', () => {
    it('should handle null ids', () => {
      const zip: Zip = { bare: '', hash: '' };
      service.zipFactories(
        zip,
        {
          ids: null,
          entities: { ['']: {} },
        },
        Mocks.Hash
      );
      expect(zip).toEqual({ bare: '', hash: '' });
    });
  });

  describe('unzipFactories', () => {
    it('v1 should unzip empty ids', () => {
      const result = service.unzipFactories(
        { ['f']: '_' },
        ZipVersion.Version1
      );
      expect(result).toEqual({
        ids: null,
        entities: {},
      });
    });

    it('v2 should unzip empty ids', () => {
      const result = service.unzipFactories(
        { ['f']: '_' },
        ZipVersion.Version2,
        Mocks.Hash
      );
      expect(result).toEqual({
        ids: null,
        entities: {},
      });
    });
  });

  describe('zipList', () => {
    it('should zip a list of strings', () => {
      expect(service.zipList([mockZip, mockZip])).toEqual({
        bare: 'p%3Dsteel-chest*1*1_p%3Dsteel-chest*1*1',
        hash: 'pC6*1*1_pC6*1*1',
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
      expect(service.zipTruthyString(null)).toEqual('');
    });

    it('should handle truthy', () => {
      expect(service.zipTruthyString('a')).toEqual('a');
    });
  });

  describe('zipTruthyNum', () => {
    it('should handle falsy', () => {
      expect(service.zipTruthyNumber(null)).toEqual('');
    });

    it('should handle truthy', () => {
      expect(service.zipTruthyNumber(1)).toEqual('1');
    });
  });

  describe('zipTruthyBool', () => {
    it('should handle falsy', () => {
      expect(service.zipTruthyBool(null)).toEqual('');
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
      expect(service.zipTruthyArray(null)).toEqual('');
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
      expect(service.zipTruthyNArray(null, [])).toEqual('');
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
      expect(service.zipDiffString(null, 'a')).toEqual(NULL);
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
      expect(service.zipDiffNumber(null, 0)).toEqual(NULL);
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
      expect(service.zipDiffDisplayRate(null, DisplayRate.PerMinute)).toEqual(
        NULL
      );
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
      expect(service.zipDiffBool(null, false)).toEqual(NULL);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffBool(false, true)).toEqual(FALSE);
    });
  });

  describe('zipDiffArray', () => {
    it('should handle default', () => {
      expect(service.zipDiffArray(['a', 'b'], ['b', 'a'])).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffArray(null, [])).toEqual(NULL);
      expect(service.zipDiffArray([], null)).toEqual(EMPTY);
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
      expect(service.zipDiffRank(null, [])).toEqual(NULL);
      expect(service.zipDiffRank([], null)).toEqual(EMPTY);
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
      expect(service.zipDiffNString(null, 'a', [])).toEqual(NULL);
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
      expect(service.zipDiffNNumber(null, 0)).toEqual(NULL);
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
      expect(service.zipDiffNArray(null, [], [])).toEqual(NULL);
      expect(service.zipDiffNArray([], null, [])).toEqual(EMPTY);
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
      expect(service.zipDiffNRank(null, [], [])).toEqual(NULL);
      expect(service.zipDiffNRank([], null, [])).toEqual(EMPTY);
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
      expect(service.parseString(null)).toBeUndefined();
      expect(service.parseString('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseString(NULL)).toBeNull();
    });

    it('should parse value', () => {
      expect(service.parseString('a')).toEqual('a');
    });
  });

  describe('parseBool', () => {
    it('should handle undefined', () => {
      expect(service.parseBool(undefined)).toBeUndefined();
      expect(service.parseBool(null)).toBeUndefined();
      expect(service.parseBool('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseBool(NULL)).toBeNull();
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
      expect(service.parseNumber(null)).toBeUndefined();
      expect(service.parseNumber('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseNumber(NULL)).toBeNull();
    });

    it('should parse value', () => {
      expect(service.parseNumber('1')).toEqual(1);
    });
  });

  describe('parseDisplayRate', () => {
    it('should handle undefined', () => {
      expect(service.parseDisplayRate(undefined)).toBeUndefined();
      expect(service.parseDisplayRate(null)).toBeUndefined();
      expect(service.parseDisplayRate('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseDisplayRate(NULL)).toBeNull();
    });

    it('should parse value', () => {
      expect(service.parseDisplayRate('0')).toEqual(DisplayRate.PerSecond);
      expect(service.parseDisplayRate('1')).toEqual(DisplayRate.PerMinute);
      expect(service.parseDisplayRate('2')).toEqual(DisplayRate.PerHour);
    });
  });

  describe('parseArray', () => {
    it('should handle undefined', () => {
      expect(service.parseArray(undefined)).toBeUndefined();
      expect(service.parseArray(null)).toBeUndefined();
      expect(service.parseArray('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseArray(NULL)).toBeNull();
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
      expect(service.parseNString(null, [])).toBeUndefined();
      expect(service.parseNString('', [])).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseNString(NULL, [])).toBeNull();
    });

    it('should parse value', () => {
      expect(service.parseNString('A', ['a'])).toEqual('a');
    });
  });

  describe('parseNNumber', () => {
    it('should handle undefined', () => {
      expect(service.parseNNumber(undefined)).toBeUndefined();
      expect(service.parseNNumber(null)).toBeUndefined();
      expect(service.parseNNumber('')).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseNNumber(NULL)).toBeNull();
    });

    it('should parse value', () => {
      expect(service.parseNNumber('A')).toEqual(0);
    });
  });

  describe('parseNArray', () => {
    it('should handle undefined', () => {
      expect(service.parseNArray(undefined, [])).toBeUndefined();
      expect(service.parseNArray(null, [])).toBeUndefined();
      expect(service.parseNArray('', [])).toBeUndefined();
    });

    it('should parse null', () => {
      expect(service.parseNArray(NULL, [])).toBeNull();
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

  describe('requestHash', () => {
    it('should return from the cache', () => {
      service.cache['test'] = true as any;
      let result: any;
      service.requestHash('test').subscribe((r) => (result = r));
      expect(result).toBeTrue();
    });

    it('should request the hash', () => {
      let result: ModHash;
      service
        .requestHash(initialSettingsState.baseId)
        .subscribe((r) => (result = r));
      http.expectOne('data/1.1/hash.json').flush(Mocks.Hash);
      expect(result).toEqual(Mocks.Hash);
    });
  });
});
