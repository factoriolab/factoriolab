import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';

import { Mocks, ItemId, RecipeId } from 'src/tests';
import { RateType, Product, DisplayRate, ResearchSpeed } from '~/models';
import { reducers, metaReducers, State } from '~/store';
import * as Products from '~/store/products';
import * as Items from '~/store/items';
import * as Recipes from '~/store/recipes';
import * as Settings from '~/store/settings';
import { RouterService } from './router.service';

const mockZipEmpty = 'eJwrsAUAAR8Arg==';
const mockZipProducts = 'eJwrsC0uSU3N0U3OSC0usTKwMlQrtrVCBQDMkQog';
const mockZipAll =
  'eJwrsC0uSU3N0U3OSC0usTKwMlTLRBGxKilKzCsuyC8q0U1KzSlRK0KVtbKyUCu2NTYzMLBCBQBhIhyh';
const mockZipExtra =
  'eJwrsM0sys/TTc5ILS6xMrAyVMtEFrAqKUrMKy7ILyrRTUrNKVErQpHMzU8pzUnVw0ZZWakV21qhA0O1EtsSoFYAroYoTw==';
const mockZipLink =
  'eJxtj+EKwjAMhN9m/yJtJyKBPUzXZq7QNaVpFd/eihMc+Ou4JNyXy9OD2VMCt5JUVKiHMEklivtEYy02SeZSYaZYh3JYWxHa5hjSDTbr1pAIRtzYt0hf0YNM40UpNHjugGMcCsfgYWkUcbYSHHCIkAs7Eump/wDmJJW7Lq0k6wj7tW+uhnuoT/hAT5KJ/G7w14DBay+l1bur6V/pF9njXM8=';
const mockProducts: Product[] = [
  {
    id: '0',
    itemId: ItemId.SteelChest,
    rate: 1,
    rateType: RateType.Items,
  },
];
const mockZipProduct = `${ItemId.SteelChest}:0:1`;
const mockItemSettings: Items.ItemsState = {
  [ItemId.SteelChest]: { belt: ItemId.TransportBelt },
};
const mockFullItemSettings: Items.ItemsState = {
  [ItemId.SteelChest]: { ignore: true, belt: ItemId.TransportBelt },
};
const mockZipFullItemSettings = `${ItemId.SteelChest}:1:${ItemId.TransportBelt}`;
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
const mockZipFullRecipeSettings = `${RecipeId.SteelChest}:${ItemId.AssemblingMachine3}:${ItemId.Module}:${ItemId.Module}:1`;
const mockSettings: Settings.SettingsState = {
  ...Settings.initialSettingsState,
  ...{ displayRate: DisplayRate.PerHour },
};
const mockFullSettings: Settings.SettingsState = {
  baseDatasetId: '0.17',
  modDatasetIds: [],
  displayRate: DisplayRate.PerHour,
  itemPrecision: 2,
  beltPrecision: 4,
  factoryPrecision: 0,
  belt: ItemId.TransportBelt,
  fuel: ItemId.SolidFuel,
  recipeDisabled: { [RecipeId.BasicOilProcessing]: true },
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
const mockZipFullSettings = `${DisplayRate.PerHour}:2:4:0:${mockFullSettings.belt}:${mockFullSettings.fuel}:${RecipeId.BasicOilProcessing}:${ItemId.AssemblingMachine2}.${ItemId.StoneFurnace}:${ItemId.ProductivityModule}.${ItemId.SpeedModule}:${mockFullSettings.beaconModule}:8:1:10:0:1200:1`;
const mockNullSettings = {
  ...mockFullSettings,
  ...{ itemPrecision: null, beltPrecision: null, factoryPrecision: null },
};
const mockZipNullSettings = `${DisplayRate.PerHour}:n:n:n:${mockFullSettings.belt}:${mockFullSettings.fuel}:${RecipeId.BasicOilProcessing}:${ItemId.AssemblingMachine2}.${ItemId.StoneFurnace}:${ItemId.ProductivityModule}.${ItemId.SpeedModule}:${mockFullSettings.beaconModule}:8:1:10:0:1200:1`;

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
    service.loaded = true;
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
    it('should set loaded to true on first run', () => {
      service.loaded = false;
      service.updateUrl(null, null, null, null, null);
      expect(service.loaded).toEqual(true);
    });

    it('should return while unzipping', () => {
      service.unzipping = true;
      spyOn(router, 'navigateByUrl');
      service.updateUrl(null, null, null, null, null);
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should update url with products', () => {
      spyOn(router, 'navigateByUrl');
      service.updateUrl(
        mockProducts,
        {},
        {},
        Settings.initialSettingsState,
        Mocks.Defaults
      );
      expect(router.navigateByUrl).toHaveBeenCalledWith(`/#${mockZipProducts}`);
    });

    it('should update url with all', () => {
      spyOn(router, 'navigateByUrl');
      service.updateUrl(
        mockProducts,
        mockItemSettings,
        mockRecipeSettings,
        mockSettings,
        Mocks.Defaults
      );
      expect(router.navigateByUrl).toHaveBeenCalledWith(`/#${mockZipAll}`);
    });
  });

  describe('stepHref', () => {
    it('should generate a url for a step', () => {
      spyOn(router, 'navigateByUrl');
      service.updateUrl(
        mockProducts,
        mockFullItemSettings,
        mockFullRecipeSettings,
        mockFullSettings,
        Mocks.Defaults
      );
      const href = service.stepHref(Mocks.Step1);
      expect(href).toEqual(`#${mockZipLink}`);
    });
  });

  describe('updateState', () => {
    it('should skip unless event is NavigationEnd', () => {
      spyOn(store, 'select');
      (router.events as any).next(new NavigationStart(2, null));
      expect(store.select).not.toHaveBeenCalled();
    });

    it('should skip unless hash is found', () => {
      spyOn(store, 'select');
      (router.events as any).next(new NavigationEnd(2, '/', '/'));
      expect(store.select).not.toHaveBeenCalled();
    });

    it('should skip unless new zip is found', () => {
      service.zip = mockZipProducts;
      const url = `/#${mockZipProducts}`;
      spyOn(store, 'select');
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(store.select).not.toHaveBeenCalled();
    });

    it('should log error on bad url', () => {
      spyOn(console, 'error');
      (router.events as any).next(new NavigationEnd(2, '/#test', '/#test'));
      expect(console.error).toHaveBeenCalledTimes(2);
    });

    it('should upzip the hash', () => {
      spyOn(service, 'unzipProducts');
      spyOn(service, 'unzipItems');
      spyOn(service, 'unzipRecipes');
      spyOn(service, 'unzipSettings');
      const url = `/#${mockZipExtra}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.unzipProducts).toHaveBeenCalled();
      expect(service.unzipItems).toHaveBeenCalled();
      expect(service.unzipRecipes).toHaveBeenCalled();
      expect(service.unzipSettings).toHaveBeenCalled();
    });

    it('should skip empty values', () => {
      spyOn(service, 'unzipProducts');
      spyOn(service, 'unzipItems');
      spyOn(service, 'unzipRecipes');
      spyOn(service, 'unzipSettings');
      const url = `/#${mockZipEmpty}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.unzipProducts).not.toHaveBeenCalled();
      expect(service.unzipItems).not.toHaveBeenCalled();
      expect(service.unzipRecipes).not.toHaveBeenCalled();
      expect(service.unzipSettings).not.toHaveBeenCalled();
    });
  });

  describe('zipProducts', () => {
    it('should zip the products', () => {
      const result = service.zipProducts(mockProducts);
      expect(result).toEqual([mockZipProduct]);
    });
  });

  describe('unzipProducts', () => {
    it('should unzip the products', () => {
      spyOn(store, 'dispatch');
      service.unzipProducts([mockZipProduct]);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Products.LoadAction(mockProducts)
      );
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
      spyOn(store, 'dispatch');
      service.unzipItems([`${ItemId.SteelChest}::`]);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Items.LoadAction({ [ItemId.SteelChest]: {} })
      );
    });

    it('should unzip the full item settings', () => {
      spyOn(store, 'dispatch');
      service.unzipItems([mockZipFullItemSettings]);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Items.LoadAction(mockFullItemSettings)
      );
    });

    it('should unzip false ignore value', () => {
      spyOn(store, 'dispatch');
      service.unzipItems([`${ItemId.SteelChest}:0:`]);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Items.LoadAction({ [ItemId.SteelChest]: { ignore: false } })
      );
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
      spyOn(store, 'dispatch');
      service.unzipRecipes([`${RecipeId.SteelChest}::::`]);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Recipes.LoadAction({ [RecipeId.SteelChest]: {} })
      );
    });

    it('should unzip the full recipe settings', () => {
      spyOn(store, 'dispatch');
      service.unzipRecipes([mockZipFullRecipeSettings]);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Recipes.LoadAction(mockFullRecipeSettings)
      );
    });
  });

  describe('zipSettings', () => {
    it('should zip full settings', () => {
      const result = service.zipSettings(mockFullSettings, Mocks.Defaults);
      expect(result).toEqual(mockZipFullSettings);
    });

    it('should zip settings with null values', () => {
      const result = service.zipSettings(mockNullSettings, Mocks.Defaults);
      expect(result).toEqual(mockZipNullSettings);
    });

    it('should zip default settings', () => {
      const test = { ...Settings.initialSettingsState, ...{ test: true } };
      const result = service.zipSettings(test, Mocks.Defaults);
      expect(result).toEqual(':::::::::::::::');
    });
  });

  describe('unzipSettings', () => {
    it('should unzip the empty settings', () => {
      spyOn(store, 'dispatch');
      service.unzipSettings(':::::::::::::::');
      expect(store.dispatch).toHaveBeenCalledWith(
        new Settings.LoadAction({} as any)
      );
    });

    it('should unzip the null settings', () => {
      spyOn(store, 'dispatch');
      service.unzipSettings(mockZipNullSettings);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Settings.LoadAction(mockNullSettings)
      );
    });

    it('should unzip the full settings', () => {
      spyOn(store, 'dispatch');
      service.unzipSettings(mockZipFullSettings);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Settings.LoadAction(mockFullSettings)
      );
    });
  });
});
