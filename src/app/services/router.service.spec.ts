import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';
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
} from '~/models';
import { reducers, metaReducers, State } from '~/store';
import { LoadAction } from '~/store/app.actions';
import { FactoriesState, initialFactoriesState } from '~/store/factories';
import { initialItemsState, ItemsState } from '~/store/items';
import { ProductsState } from '~/store/products';
import { initialRecipesState, RecipesState } from '~/store/recipes';
import { initialSettingsState, SettingsState } from '~/store/settings';
import {
  RouterService,
  FIELDSEP,
  EMPTY,
  NULL,
  TRUE,
  FALSE,
  LISTSEP,
  Zip,
  MIN_ZIP,
} from './router.service';

const mockZipProducts = 'p=steel-chest*1&v=1';
const mockZipAll =
  'p=steel-chest*1&b=1&i=steel-chest**transport-belt&r=steel-chest***8&f=1_assembling-machine-1_electric-mining-drill&s=******3600';
const mockZipLink =
  'eJxtj90KgzAMhd.Gi0CGVdiuyh5l9Ce6Qm1KU.H11w2FyUYgnITvHJKsN2ZPCd2TpILqrL53QUsliscOajFJMpeKlmIFZ8rMuJmZU1dOqBGhxcaQZlyMe4ZEOMLCfo3UYnZhy' +
  'bjmnLR6.OUlE3nc4eE04nC4RfcXdQNrJDjkEDEXdiTSon4PFo7B47RSBDX0PYzX1lQP71Lf78AU10Z-9AuxNmKT';
const mockProducts: Product[] = [
  {
    id: '0',
    itemId: ItemId.SteelChest,
    rate: '1',
    rateType: RateType.Items,
  },
];
const mockProductsState: ProductsState = {
  ids: ['0'],
  entities: { ['0']: mockProducts[0] },
  index: 1,
};
const mockProductsFull: Product[] = [
  {
    id: '0',
    itemId: ItemId.SteelChest,
    rate: '1',
    rateType: RateType.Belts,
    viaId: RecipeId.Coal,
  },
];
const mockFullProductsState: ProductsState = {
  ids: ['0'],
  entities: { ['0']: mockProductsFull[0] },
  index: 1,
};
const mockZipProduct = [ItemId.SteelChest, '1'].join(FIELDSEP);
const mockZipProductFull = [ItemId.SteelChest, '1', '1', RecipeId.Coal].join(
  FIELDSEP
);
const mockItemsState: ItemsState = {
  [ItemId.SteelChest]: { belt: ItemId.TransportBelt },
};
const mockFullItemsState: ItemsState = {
  [ItemId.SteelChest]: {
    ignore: true,
    belt: ItemId.TransportBelt,
    wagon: ItemId.CargoWagon,
  },
};
const mockZipFullItemsState = [
  ItemId.SteelChest,
  '1',
  ItemId.TransportBelt,
  ItemId.CargoWagon,
].join(FIELDSEP);
const mockRecipesState: RecipesState = {
  [RecipeId.SteelChest]: { beaconCount: 8 },
};
const mockFullRecipesState: RecipesState = {
  [RecipeId.SteelChest]: {
    factory: ItemId.AssemblingMachine3,
    factoryModules: [ItemId.Module],
    beaconCount: 1,
    beacon: ItemId.Beacon,
    beaconModules: [ItemId.Module],
  },
};
const mockZipFullRecipesState = [
  RecipeId.SteelChest,
  ItemId.AssemblingMachine3,
  ItemId.Module,
  '1',
  ItemId.Module,
  ItemId.Beacon,
].join(FIELDSEP);
const mockFactoriesState: FactoriesState = {
  ids: [ItemId.AssemblingMachine1, ItemId.ElectricMiningDrill],
  entities: {},
};
const mockFullFactoriesState: FactoriesState = {
  ids: [ItemId.AssemblingMachine3],
  entities: {
    ['']: {},
    [ItemId.AssemblingMachine3]: {
      moduleRank: [ItemId.SpeedModule],
      beaconCount: 2,
      beacon: ItemId.Beacon,
      beaconModule: ItemId.SpeedModule2,
    },
  },
};
const mockZipFullFactoriesState = [
  '1',
  [
    ItemId.AssemblingMachine3,
    ItemId.SpeedModule,
    2,
    ItemId.SpeedModule2,
    ItemId.Beacon,
  ].join(FIELDSEP),
];

const mockSettingsState: SettingsState = {
  ...initialSettingsState,
  ...{ preset: Preset.Modules, displayRate: DisplayRate.PerHour },
};
export const mockFullSettingsState: SettingsState = {
  baseId: '.17',
  disabledRecipes: [RecipeId.BasicOilProcessing],
  expensive: true,
  belt: ItemId.TransportBelt,
  fuel: ItemId.SolidFuel,
  flowRate: 1200,
  cargoWagon: ItemId.CargoWagon,
  fluidWagon: ItemId.FluidWagon,
  displayRate: DisplayRate.PerHour,
  miningBonus: 10,
  researchSpeed: ResearchSpeed.Speed0,
  inserterTarget: InserterTarget.Chest,
  inserterCapacity: InserterCapacity.Capacity2,
  preset: Preset.Modules,
} as any;
const mockZipFullSettingsState = [
  '0.17',
  RecipeId.BasicOilProcessing,
  '1',
  mockFullSettingsState.belt,
  mockFullSettingsState.fuel,
  '1200',
  DisplayRate.PerHour,
  '10',
  '0',
  '0',
  '1',
  ItemId.CargoWagon,
  ItemId.FluidWagon,
].join(FIELDSEP);
const mockZipNullSettingsState = [
  '0.17',
  RecipeId.BasicOilProcessing,
  '1',
  mockFullSettingsState.belt,
  mockFullSettingsState.fuel,
  '1200',
  DisplayRate.PerHour,
  '10',
  '0',
  '0',
  '1',
  ItemId.CargoWagon,
  ItemId.FluidWagon,
].join(FIELDSEP);
const mockZip: Zip = {
  bare: 'p=steel-chest*1',
  hash: 'pC6*1',
};
const mockZipPartial: Zip = {
  bare: '',
  hash: '',
};
const mockFullZipPartial: Zip = {
  bare:
    '&s=.17*2*1*basic-oil-processing*transport-belt*solid-fuel*1200*10*0*1*0*1*cargo-wagon*fluid-wagon',
  hash: '&bC&s2*1*P*C*D*Sw*K*A*1*0*1*A*B',
};

describe('RouterService', () => {
  let service: RouterService;
  let store: Store<State>;
  let router: Router;

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
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update state from router', () => {
    spyOn(service, 'updateState');
    (router.events as any).next(new NavigationEnd(2, '/', '/'));
    expect(service.updateState).toHaveBeenCalled();
  });

  describe('updateUrl', () => {
    it('should return while unzipping', () => {
      service.unzipping = true;
      spyOn(service, 'zipState');
      service.updateUrl(null, null, null, null, null);
      expect(service.zipState).not.toHaveBeenCalled();
    });

    it('should update url with products', () => {
      spyOn(service, 'zipState').and.returnValue(of(mockZip));
      spyOn(service, 'getHash').and.returnValue('test');
      spyOn(router, 'navigateByUrl');
      service.updateUrl(null, null, null, null, null);
      expect(router.navigateByUrl).toHaveBeenCalledWith('/?test');
    });
  });

  describe('zipState', () => {
    it('should zip state', () => {
      spyOn(service, 'requestHash').and.returnValue(of(Mocks.Hash));
      let zip: Zip;
      service
        .zipState(
          mockProductsState,
          initialItemsState,
          initialRecipesState,
          initialFactoriesState,
          initialSettingsState
        )
        .subscribe((z) => (zip = z));
      expect(zip).toEqual(mockZip);
      expect(service.zipPartial).toEqual(mockZipPartial);
    });

    it('should zip full state', () => {
      spyOn(service, 'requestHash').and.returnValue(of(Mocks.Hash));
      let zip: Zip;
      service
        .zipState(
          mockProductsState,
          initialItemsState,
          initialRecipesState,
          initialFactoriesState,
          mockFullSettingsState
        )
        .subscribe((z) => (zip = z));
      expect(zip).toEqual(mockZip);
      expect(service.zipPartial).toEqual(mockFullZipPartial);
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
      expect(result).toEqual(mockZipProducts);
    });

    it('should zip a large state', () => {
      spyOn(service, 'bytesToBase64').and.returnValue('test');
      service.zipTail.bare = 'a'.repeat(MIN_ZIP);
      const result = service.getHash(mockZip);
      expect(result).toEqual('z=test');
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
      service.zip = mockZipProducts;
      const url = `/#${mockZipProducts}`;
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

    it('should unzip v0', () => {
      const v0Full =
        'eJwrsC0uSU3N0U3OSC0u0TJUS7I1VMtEEdMqKUrMKy7ILyrRTUrNKVErQpXVslBLs9UC6iwGkiBgbGZgoFZiWwKUBQDYwh4O';
      const url = `/#z=${v0Full}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(
        'p=steel-chest*1&b=1&i=steel-chest**transport-belt&r=steel-chest***8&f=**1&s=******3600&t=test',
        {
          productsState: mockProductsState,
          itemsState: mockItemsState,
          recipesState: mockRecipesState,
          factoriesState: { ids: null, entities: { ['']: { beaconCount: 1 } } },
          settingsState: { preset: Preset.Modules, displayRate: 3600 },
        } as any
      );
    });

    it('should unzip empty v0', () => {
      const v0Empty = 'eJwrsAUAAR8Arg==';
      const url = `/#z=${v0Empty}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith('p=', {} as any);
    });

    it('should unzip v1', () => {
      const v1Full =
        'p=steel-chest*1&i=steel-chest**transport-belt&r=steel-chest***8&f=**1&s=*2*1&v=1';
      const url = `/?${v1Full}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(v1Full, {
        productsState: mockProductsState,
        itemsState: mockItemsState,
        recipesState: mockRecipesState,
        factoriesState: { ids: null, entities: { ['']: { beaconCount: 1 } } },
        settingsState: { preset: Preset.Modules, displayRate: 3600 },
      } as any);
    });

    it('should unzip empty v1', () => {
      const v1Empty = 'p=&v=1';
      const url = `/?${v1Empty}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.dispatch).toHaveBeenCalledWith(v1Empty, {} as any);
    });
  });

  // describe('zipProducts', () => {
  //   it('should zip products by items', () => {
  //     const result = service.zipProducts(mockProducts);
  //     expect(result).toEqual(mockZipProduct);
  //   });

  //   it('should zip products by other rates', () => {
  //     const result = service.zipProducts(mockProductsFull);
  //     expect(result).toEqual(mockZipProductFull);
  //   });
  // });

  // describe('unzipProducts', () => {
  //   it('should unzip the products by items', () => {
  //     const result = service.unzipProducts([mockZipProduct]);
  //     expect(result).toEqual(mockProductsState);
  //   });

  //   it('should unzip fully defined products', () => {
  //     const result = service.unzipProducts([mockZipProductFull]);
  //     expect(result).toEqual(mockFullProductsState);
  //   });
  // });

  // describe('zipItems', () => {
  //   it('should zip empty item settings', () => {
  //     const result = service.zipItems({ [ItemId.SteelChest]: {} });
  //     expect(result).toEqual(`${ItemId.SteelChest}`);
  //   });

  //   it('should zip full item settings', () => {
  //     const result = service.zipItems(mockFullItemsState);
  //     expect(result).toEqual(mockZipFullItemsState);
  //   });

  //   it('should zip false ignore value', () => {
  //     const result = service.zipItems({
  //       [ItemId.SteelChest]: { ignore: false },
  //     });
  //     expect(result).toEqual(`${ItemId.SteelChest}*0`);
  //   });
  // });

  // describe('unzipItems', () => {
  //   it('should unzip the empty item settings', () => {
  //     const result = service.unzipItems([`${ItemId.SteelChest}`]);
  //     expect(result).toEqual({ [ItemId.SteelChest]: {} });
  //   });

  //   it('should unzip the full item settings', () => {
  //     const result = service.unzipItems([mockZipFullItemsState]);
  //     expect(result).toEqual(mockFullItemsState);
  //   });

  //   it('should unzip false ignore value', () => {
  //     const result = service.unzipItems([`${ItemId.SteelChest}*0`]);
  //     expect(result).toEqual({ [ItemId.SteelChest]: { ignore: false } });
  //   });

  //   it('should handle empty state', () => {
  //     const id = 'id';
  //     const result = service.unzipItems([id]);
  //     expect(result).toEqual({ [id]: {} });
  //   });
  // });

  // describe('zipRecipes', () => {
  //   it('should zip empty recipe settings', () => {
  //     const result = service.zipRecipes({ [RecipeId.SteelChest]: {} });
  //     expect(result).toEqual(`${RecipeId.SteelChest}`);
  //   });

  //   it('should zip full recipe settings', () => {
  //     const result = service.zipRecipes(mockFullRecipesState);
  //     expect(result).toEqual(mockZipFullRecipesState);
  //   });
  // });

  // describe('unzipRecipes', () => {
  //   it('should unzip empty recipe settings', () => {
  //     const result = service.unzipRecipes([`${RecipeId.SteelChest}`]);
  //     expect(result).toEqual({ [RecipeId.SteelChest]: {} });
  //   });

  //   it('should unzip full recipe settings', () => {
  //     const result = service.unzipRecipes([mockZipFullRecipesState]);
  //     expect(result).toEqual(mockFullRecipesState);
  //   });

  //   it('should handle empty state', () => {
  //     const id = 'id';
  //     const result = service.unzipRecipes([id]);
  //     expect(result).toEqual({ [id]: {} });
  //   });
  // });

  // describe('zipFactories', () => {
  //   it('should zip empty factory settings', () => {
  //     const result = service.zipFactories(initialFactoriesState);
  //     expect(result).toEqual('');
  //   });

  //   it('should zip full factory settings', () => {
  //     const result = service.zipFactories(mockFullFactoriesState);
  //     expect(result).toEqual(mockZipFullFactoriesState.join(LISTSEP));
  //   });

  //   it('should handle null ids', () => {
  //     const result = service.zipFactories({
  //       ids: null,
  //       entities: { ['']: {} },
  //     });
  //     expect(result).toEqual('');
  //   });
  // });

  // describe('unzipFactories', () => {
  //   it('should unzip the full factory settings', () => {
  //     const result = service.unzipFactories(mockZipFullFactoriesState);
  //     expect(result).toEqual(mockFullFactoriesState);
  //   });

  //   it('should handle empty state', () => {
  //     const result = service.unzipFactories(['', 'id']);
  //     expect(result).toEqual({
  //       ids: null,
  //       entities: { ['']: {}, ['id']: {} },
  //     } as any);
  //   });
  // });

  // describe('zipSettings', () => {
  //   it('should zip full settings', () => {
  //     const result = service.zipSettings(mockFullSettingsState);
  //     expect(result).toEqual(mockZipFullSettingsState);
  //   });

  //   it('should zip settings with null values', () => {
  //     const result = service.zipSettings(mockFullSettingsState);
  //     expect(result).toEqual(mockZipNullSettingsState);
  //   });

  //   it('should zip default settings', () => {
  //     const test = { ...initialSettingsState, ...{ test: true } };
  //     const result = service.zipSettings(test);
  //     expect(result).toEqual('');
  //   });
  // });

  // describe('unzipSettings', () => {
  //   it('should unzip the full settings', () => {
  //     const result = service.unzipSettings(mockZipFullSettingsState);
  //     expect(result).toEqual(mockFullSettingsState);
  //   });

  //   it('should handle empty state', () => {
  //     const result = service.unzipSettings('');
  //     expect(result).toEqual({} as any);
  //   });
  // });

  // describe('zipTruthy', () => {
  //   it('should handle falsy', () => {
  //     expect(service.zipTruthyString(null)).toEqual('');
  //   });

  //   it('should handle truthy', () => {
  //     expect(service.zipTruthyString('a')).toEqual('a');
  //   });
  // });

  // describe('zipTruthyNum', () => {
  //   it('should handle falsy', () => {
  //     expect(service.zipTruthyNumber(null)).toEqual('');
  //   });

  //   it('should handle truthy', () => {
  //     expect(service.zipTruthyNumber(1)).toEqual('1');
  //   });
  // });

  // describe('zipTruthyBool', () => {
  //   it('should handle falsy', () => {
  //     expect(service.zipTruthyBool(null)).toEqual('');
  //   });

  //   it('should handle false', () => {
  //     expect(service.zipTruthyBool(false)).toEqual(FALSE);
  //   });

  //   it('should handle true', () => {
  //     expect(service.zipTruthyBool(true)).toEqual(TRUE);
  //   });
  // });

  // describe('zipTruthyArray', () => {
  //   it('should handle falsy', () => {
  //     expect(service.zipTruthyArray(null)).toEqual('');
  //   });

  //   it('should handle empty', () => {
  //     expect(service.zipTruthyArray([])).toEqual(EMPTY);
  //   });

  //   it('should handle truthy', () => {
  //     expect(service.zipTruthyArray(['a'])).toEqual('a');
  //   });
  // });

  // describe('zipDiff', () => {
  //   it('should handle default', () => {
  //     expect(service.zipDiffString('a', 'a')).toEqual('');
  //   });

  //   it('should handle falsy', () => {
  //     expect(service.zipDiffString(null, 'a')).toEqual(NULL);
  //   });

  //   it('should handle truthy', () => {
  //     expect(service.zipDiffString('a', 'b')).toEqual('a');
  //   });
  // });

  // describe('zipDiffNum', () => {
  //   it('should handle default', () => {
  //     expect(service.zipDiffNumber(0, 0)).toEqual('');
  //   });

  //   it('should handle falsy', () => {
  //     expect(service.zipDiffNumber(null, 0)).toEqual(NULL);
  //   });

  //   it('should handle truthy', () => {
  //     expect(service.zipDiffNumber(0, 1)).toEqual('0');
  //   });
  // });

  // describe('zipDiffBool', () => {
  //   it('should handle default', () => {
  //     expect(service.zipDiffBool(false, false)).toEqual('');
  //   });

  //   it('should handle falsy', () => {
  //     expect(service.zipDiffBool(null, false)).toEqual(NULL);
  //   });

  //   it('should handle truthy', () => {
  //     expect(service.zipDiffBool(false, true)).toEqual(FALSE);
  //   });
  // });

  // describe('zipDiffArray', () => {
  //   it('should handle default', () => {
  //     expect(service.zipDiffArray(['a', 'b'], ['b', 'a'])).toEqual('');
  //   });

  //   it('should handle both empty', () => {
  //     expect(service.zipDiffArray([], [])).toEqual('');
  //   });

  //   it('should handle empty', () => {
  //     expect(service.zipDiffArray([], ['a'])).toEqual(EMPTY);
  //   });

  //   it('should handle truthy', () => {
  //     expect(service.zipDiffArray(['b', 'a'], ['a', 'c'])).toEqual('a~b');
  //   });
  // });

  // describe('zipDiffRank', () => {
  //   it('should handle default', () => {
  //     expect(service.zipDiffRank(['a', 'b'], ['a', 'b'])).toEqual('');
  //   });

  //   it('should honor order', () => {
  //     expect(service.zipDiffRank(['a', 'b'], ['b', 'a'])).toEqual('a~b');
  //   });

  //   it('should handle both empty', () => {
  //     expect(service.zipDiffRank([], [])).toEqual('');
  //   });

  //   it('should handle empty', () => {
  //     expect(service.zipDiffRank([], ['a'])).toEqual(EMPTY);
  //   });

  //   it('should handle truthy', () => {
  //     expect(service.zipDiffRank(['a', 'b'], ['a', 'c'])).toEqual('a~b');
  //   });

  //   it('should handle nulls', () => {
  //     expect(service.zipDiffRank(null, null)).toEqual('');
  //   });
  // });

  // describe('parseString', () => {
  //   it('should parse null', () => {
  //     expect(service.parseString(NULL)).toBeNull();
  //   });

  //   it('should parse value', () => {
  //     expect(service.parseString('a')).toEqual('a');
  //   });
  // });

  // describe('parseBool', () => {
  //   it('should parse null', () => {
  //     expect(service.parseBool(NULL)).toBeNull();
  //   });

  //   it('should parse false', () => {
  //     expect(service.parseBool(FALSE)).toBeFalse();
  //   });

  //   it('should parse true', () => {
  //     expect(service.parseBool(TRUE)).toBeTrue();
  //   });
  // });

  // describe('parseNumber', () => {
  //   it('should parse null', () => {
  //     expect(service.parseNumber(NULL)).toBeNull();
  //   });

  //   it('should parse value', () => {
  //     expect(service.parseNumber('1')).toEqual(1);
  //   });
  // });

  // describe('parseArray', () => {
  //   it('should parse null', () => {
  //     expect(service.parseArray(NULL)).toBeNull();
  //   });

  //   it('should parse empty', () => {
  //     expect(service.parseArray(EMPTY)).toEqual([]);
  //   });

  //   it('should parse value', () => {
  //     expect(service.parseArray('a~b')).toEqual(['a', 'b']);
  //   });
  // });
});
