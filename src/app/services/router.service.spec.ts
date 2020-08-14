import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';

import { Mocks, ItemId, RecipeId } from 'src/tests';
import { RateType, Product, DisplayRate, ResearchSpeed } from '~/models';
import { reducers, metaReducers, State } from '~/store';
import { AppLoadAction } from '~/store/app.actions';
import * as Products from '~/store/products';
import * as Items from '~/store/items';
import * as Recipes from '~/store/recipes';
import * as Settings from '~/store/settings';
import {
  RouterService,
  FIELDSEP,
  ARRAYSEP,
  EMPTY,
  NULL,
  TRUE,
  FALSE,
} from './router.service';

const mockZipEmpty = 'eJwrsAUAAR8Arg==';
const mockZipProducts = 'p=steel-chest:1';
const mockZipAll =
  'eJwrsC0uSU3N0U3OSC0usTJUy0ThW5UUJeYVF+QXlegmpeaUqBWhylpZWagV21pZGZsZGFihAgBxgByr';
const mockZipExtra =
  'eJwrsC0uSU3N0U3OSC0usTJUy0ThW5UUJeYVF+QXlegmpeaUqBWhylpZWagV21pZGZsZGFihArVU2xKgGgBDLh8z';
const mockZipLink =
  'eJxtj90KwjAMhd9mdxltFZXAHqZrM1fo2tKkim9vQQcqXh0+Es5Pme45e0rgVmJBPYSJhSjujFJt4pKrwExRhvp1tsy0zTGkK2zWrSERHHDLvkXaRQ88qVGfkfBwUgoNHlH9uCLnGDwsjSLOloODHCKUmh0xd/N/OWZkyV2XVpN1hP3bNyfhFuQBr+yRC5F/A34CGLz0bVr1Ktr0VvoJcPpeBA==';
const mockProducts: Product[] = [
  {
    id: '0',
    itemId: ItemId.SteelChest,
    rate: 1,
    rateType: RateType.Items,
  },
];
const mockProductsState: Products.ProductsState = {
  ids: ['0'],
  entities: { ['0']: mockProducts[0] },
  index: 1,
};
const mockProductsBelts: Product[] = [
  {
    id: '0',
    itemId: ItemId.SteelChest,
    rate: 1,
    rateType: RateType.Belts,
  },
];
const mockProductsBeltsState: Products.ProductsState = {
  ids: ['0'],
  entities: { ['0']: mockProductsBelts[0] },
  index: 1,
};
const mockZipProduct = [ItemId.SteelChest, '1'].join(FIELDSEP);
const mockZipProductBelts = [ItemId.SteelChest, '1', '1'].join(FIELDSEP);
const mockItemSettings: Items.ItemsState = {
  [ItemId.SteelChest]: { belt: ItemId.TransportBelt },
};
const mockFullItemSettings: Items.ItemsState = {
  [ItemId.SteelChest]: { ignore: true, belt: ItemId.TransportBelt },
};
const mockZipFullItemSettings = [
  ItemId.SteelChest,
  '1',
  ItemId.TransportBelt,
].join(FIELDSEP);
const mockRecipeSettings: Recipes.RecipesState = {
  [RecipeId.SteelChest]: { beaconCount: 8 },
};
const mockFullRecipeSettings: Recipes.RecipesState = {
  [RecipeId.SteelChest]: {
    factory: ItemId.AssemblingMachine3,
    modules: [ItemId.Module],
    beaconModule: ItemId.Module,
    beaconCount: 1,
  },
};
const mockZipFullRecipeSettings = [
  RecipeId.SteelChest,
  ItemId.AssemblingMachine3,
  ItemId.Module,
  ItemId.Module,
  '1',
].join(FIELDSEP);
const mockSettings: Settings.SettingsState = {
  ...Mocks.InitialSettingsState,
  ...{ displayRate: DisplayRate.PerHour },
};
const mockFullSettings: Settings.SettingsState = {
  baseId: '0.17',
  modIds: [],
  displayRate: DisplayRate.PerHour,
  itemPrecision: 2,
  beltPrecision: 4,
  factoryPrecision: 0,
  belt: ItemId.TransportBelt,
  fuel: ItemId.SolidFuel,
  disabledRecipes: [RecipeId.BasicOilProcessing],
  factoryRank: [ItemId.AssemblingMachine2, ItemId.StoneFurnace],
  moduleRank: [ItemId.ProductivityModule, ItemId.SpeedModule],
  beaconModule: ItemId.SpeedModule2,
  beaconCount: 8,
  drillModule: true,
  miningBonus: 10,
  researchSpeed: ResearchSpeed.Speed0,
  flowRate: 1200,
  expensive: true,
};
const mockZipFullSettings = [
  '0.17',
  EMPTY,
  DisplayRate.PerHour,
  '2',
  '4',
  '0',
  mockFullSettings.belt,
  mockFullSettings.fuel,
  RecipeId.BasicOilProcessing,
  [ItemId.AssemblingMachine2, ItemId.StoneFurnace].join(ARRAYSEP),
  [ItemId.ProductivityModule, ItemId.SpeedModule].join(ARRAYSEP),
  mockFullSettings.beaconModule,
  '8',
  '1',
  '10',
  '0',
  '1200',
  '1',
].join(FIELDSEP);
const mockNullSettings = {
  ...mockFullSettings,
  ...{ itemPrecision: null, beltPrecision: null, factoryPrecision: null },
};
const mockZipNullSettings = [
  '0.17',
  EMPTY,
  DisplayRate.PerHour,
  NULL,
  NULL,
  NULL,
  mockFullSettings.belt,
  mockFullSettings.fuel,
  RecipeId.BasicOilProcessing,
  [ItemId.AssemblingMachine2, ItemId.StoneFurnace].join(ARRAYSEP),
  [ItemId.ProductivityModule, ItemId.SpeedModule].join(ARRAYSEP),
  mockFullSettings.beaconModule,
  '8',
  '1',
  '10',
  '0',
  '1200',
  '1',
].join(FIELDSEP);

describe('RouterService', () => {
  let service: RouterService;
  let store: Store<State>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
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
      spyOn(router, 'navigateByUrl');
      service.updateUrl(null, null, null, null);
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should update url with products', () => {
      spyOn(router, 'navigateByUrl');
      service.updateUrl(mockProductsState, {}, {}, Mocks.InitialSettingsState);
      expect(router.navigateByUrl).toHaveBeenCalledWith(`/#${mockZipProducts}`);
    });

    it('should update url with all', () => {
      spyOn(router, 'navigateByUrl');
      service.updateUrl(
        mockProductsState,
        mockItemSettings,
        mockRecipeSettings,
        mockSettings
      );
      expect(router.navigateByUrl).toHaveBeenCalledWith(`/#z=${mockZipAll}`);
    });
  });

  describe('stepHref', () => {
    it('should generate a url for a step', () => {
      spyOn(router, 'navigateByUrl');
      service.updateUrl(
        mockProductsState,
        mockFullItemSettings,
        mockFullRecipeSettings,
        mockFullSettings
      );
      const href = service.stepHref(Mocks.Step1);
      expect(href).toEqual(`#z=${mockZipLink}`);
    });
  });

  describe('getHash', () => {
    it('should preseve a small state', () => {
      const result = service.getHash(mockZipProducts);
      expect(result).toEqual(mockZipProducts);
    });

    it('should zip a large state', () => {
      const result = service.getHash(
        `p=${mockZipProduct}&i=${mockZipFullItemSettings}&r=${mockZipFullRecipeSettings}&s=${mockZipFullSettings}`
      );
      expect(result.startsWith('z=')).toBeTrue();
    });
  });

  describe('updateState', () => {
    it('should skip unless event is NavigationEnd', () => {
      spyOn(store, 'dispatch');
      (router.events as any).next(new NavigationStart(2, null));
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should skip unless hash is found', () => {
      spyOn(store, 'dispatch');
      (router.events as any).next(new NavigationEnd(2, '/', '/'));
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should skip unless new zip is found', () => {
      service.zip = mockZipProducts;
      const url = `/#${mockZipProducts}`;
      spyOn(store, 'dispatch');
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should log error on bad zipped url', () => {
      spyOn(console, 'error');
      (router.events as any).next(new NavigationEnd(2, '/#z=test', '/#z=test'));
      expect(console.error).toHaveBeenCalledTimes(2);
    });

    it('should unzip the hash', () => {
      spyOn(store, 'dispatch');
      const url = `/#z=${mockZipExtra}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(store.dispatch).toHaveBeenCalledWith(
        new AppLoadAction({
          productsState: mockProductsState,
          itemsState: mockItemSettings,
          recipesState: mockRecipeSettings,
          settingsState: { displayRate: 3600 },
        } as any)
      );
    });

    it('should skip empty values', () => {
      spyOn(store, 'dispatch');
      const url = `/#${mockZipEmpty}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(store.dispatch).toHaveBeenCalledWith(new AppLoadAction({} as any));
    });
  });

  describe('zipProducts', () => {
    it('should zip products by items', () => {
      const result = service.zipProducts(mockProducts);
      expect(result).toEqual([mockZipProduct]);
    });

    it('should zip products by other rates', () => {
      const result = service.zipProducts(mockProductsBelts);
      expect(result).toEqual([mockZipProductBelts]);
    });
  });

  describe('unzipProducts', () => {
    it('should unzip the products by items', () => {
      const result = service.unzipProducts([mockZipProduct]);
      expect(result).toEqual(mockProductsState);
    });

    it('should unzip the products by other rates', () => {
      spyOn(store, 'dispatch');
      const result = service.unzipProducts([mockZipProductBelts]);
      expect(result).toEqual(mockProductsBeltsState);
    });
  });

  describe('zipItems', () => {
    it('should zip empty item settings', () => {
      const result = service.zipItems({ [ItemId.SteelChest]: {} });
      expect(result).toEqual([`${ItemId.SteelChest}::`]);
    });

    it('should zip full item settings', () => {
      const result = service.zipItems(mockFullItemSettings);
      expect(result).toEqual([mockZipFullItemSettings]);
    });

    it('should zip false ignore value', () => {
      const result = service.zipItems({
        [ItemId.SteelChest]: { ignore: false },
      });
      expect(result).toEqual([`${ItemId.SteelChest}:0:`]);
    });
  });

  describe('unzipItems', () => {
    it('should unzip the empty item settings', () => {
      const result = service.unzipItems([`${ItemId.SteelChest}::`]);
      expect(result).toEqual({ [ItemId.SteelChest]: {} });
    });

    it('should unzip the full item settings', () => {
      const result = service.unzipItems([mockZipFullItemSettings]);
      expect(result).toEqual(mockFullItemSettings);
    });

    it('should unzip false ignore value', () => {
      const result = service.unzipItems([`${ItemId.SteelChest}:0:`]);
      expect(result).toEqual({ [ItemId.SteelChest]: { ignore: false } });
    });
  });

  describe('zipRecipes', () => {
    it('should zip empty recipe settings', () => {
      const result = service.zipRecipes({ [RecipeId.SteelChest]: {} });
      expect(result).toEqual([`${RecipeId.SteelChest}::::`]);
    });

    it('should zip full recipe settings', () => {
      const result = service.zipRecipes(mockFullRecipeSettings);
      expect(result).toEqual([mockZipFullRecipeSettings]);
    });
  });

  describe('unzipRecipes', () => {
    it('should unzip the empty recipe settings', () => {
      const result = service.unzipRecipes([`${RecipeId.SteelChest}::::`]);
      expect(result).toEqual({ [RecipeId.SteelChest]: {} });
    });

    it('should unzip the full recipe settings', () => {
      const result = service.unzipRecipes([mockZipFullRecipeSettings]);
      expect(result).toEqual(mockFullRecipeSettings);
    });
  });

  describe('zipSettings', () => {
    it('should zip full settings', () => {
      const result = service.zipSettings(mockFullSettings);
      expect(result).toEqual(mockZipFullSettings);
    });

    it('should zip settings with null values', () => {
      const result = service.zipSettings(mockNullSettings);
      expect(result).toEqual(mockZipNullSettings);
    });

    it('should zip default settings', () => {
      const test = { ...Mocks.InitialSettingsState, ...{ test: true } };
      const result = service.zipSettings(test);
      expect(result).toEqual('');
    });
  });

  describe('unzipSettings', () => {
    it('should unzip the empty settings', () => {
      const result = service.unzipSettings(':::::::::::::::::');
      expect(result).toEqual({} as any);
    });

    it('should unzip the null settings', () => {
      const result = service.unzipSettings(mockZipNullSettings);
      expect(result).toEqual(mockNullSettings);
    });

    it('should unzip the full settings', () => {
      const result = service.unzipSettings(mockZipFullSettings);
      expect(result).toEqual(mockFullSettings);
    });
  });

  describe('zipTruthy', () => {
    it('should handle falsy', () => {
      expect(service.zipTruthy(null)).toEqual('');
    });

    it('should handle truthy', () => {
      expect(service.zipTruthy('a')).toEqual('a');
    });
  });

  describe('zipTruthyNum', () => {
    it('should handle falsy', () => {
      expect(service.zipTruthyNum(null)).toEqual('');
    });

    it('should handle truthy', () => {
      expect(service.zipTruthyNum(1)).toEqual('1');
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

  describe('zipDiff', () => {
    it('should handle default', () => {
      expect(service.zipDiff('a', 'a')).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiff(null, 'a')).toEqual(NULL);
    });

    it('should handle truthy', () => {
      expect(service.zipDiff('a', 'b')).toEqual('a');
    });
  });

  describe('zipDiffNum', () => {
    it('should handle default', () => {
      expect(service.zipDiffNum(0, 0)).toEqual('');
    });

    it('should handle falsy', () => {
      expect(service.zipDiffNum(null, 0)).toEqual(NULL);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffNum(0, 1)).toEqual('0');
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

    it('should handle both empty', () => {
      expect(service.zipDiffArray([], [])).toEqual('');
    });

    it('should handle empty', () => {
      expect(service.zipDiffArray([], ['a'])).toEqual(EMPTY);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffArray(['b', 'a'], ['a', 'c'])).toEqual('a.b');
    });
  });

  describe('zipDiffRank', () => {
    it('should handle default', () => {
      expect(service.zipDiffRank(['a', 'b'], ['a', 'b'])).toEqual('');
    });

    it('should honor order', () => {
      expect(service.zipDiffRank(['a', 'b'], ['b', 'a'])).toEqual('a.b');
    });

    it('should handle both empty', () => {
      expect(service.zipDiffRank([], [])).toEqual('');
    });

    it('should handle empty', () => {
      expect(service.zipDiffRank([], ['a'])).toEqual(EMPTY);
    });

    it('should handle truthy', () => {
      expect(service.zipDiffRank(['a', 'b'], ['a', 'c'])).toEqual('a.b');
    });
  });

  describe('parseString', () => {
    it('should parse null', () => {
      expect(service.parseString(NULL)).toBeNull();
    });

    it('should parse value', () => {
      expect(service.parseString('a')).toEqual('a');
    });
  });

  describe('parseBool', () => {
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
    it('should parse null', () => {
      expect(service.parseNumber(NULL)).toBeNull();
    });

    it('should parse value', () => {
      expect(service.parseNumber('1')).toEqual(1);
    });
  });

  describe('parseArray', () => {
    it('should parse null', () => {
      expect(service.parseArray(NULL)).toBeNull();
    });

    it('should parse empty', () => {
      expect(service.parseArray(EMPTY)).toEqual([]);
    });

    it('should parse value', () => {
      expect(service.parseArray('a.b')).toEqual(['a', 'b']);
    });
  });
});
