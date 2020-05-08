import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';

import * as mocks from 'src/mocks';
import {
  ItemId,
  RateType,
  Product,
  DisplayRate,
  RecipeId,
  ResearchSpeed,
} from '~/models';
import { reducers, metaReducers, State } from '~/store';
import * as Products from '~/store/products';
import * as Recipe from '~/store/recipe';
import * as Settings from '~/store/settings';
import { RouterService } from './router.service';

const mockZipProducts = 'eJwrsDWyMrAyBAAHnAG1';
const mockZipAll = 'eJwrsDWyMrAyVCsC0mBgoVZsa2xmYGCFCgDD0AlV';
const mockZipExtra = 'eJwrsDWyMrAyVCsC0mBgoVZsa2xmYGCFAtRKbLNK87IBA4gLqg==';
const mockProducts: Product[] = [
  {
    id: 0,
    itemId: ItemId.SteelChest,
    rate: 1,
    rateType: RateType.Items,
  },
];
const mockZipProduct = `${mocks.Data.itemN[ItemId.SteelChest]}:0:1`;
const mockRecipeSettings: Recipe.RecipeState = {
  [RecipeId.SteelChest]: { beaconCount: 8 },
};
const mockFullRecipeSettings: Recipe.RecipeState = {
  [RecipeId.SteelChest]: {
    ignore: true,
    belt: ItemId.TransportBelt,
    factory: ItemId.AssemblingMachine3,
    modules: [ItemId.Module],
    beaconType: ItemId.Module,
    beaconCount: 1,
  },
};
const mockZipFullRecipeSettings = `${
  mocks.Data.recipeN[RecipeId.SteelChest]
}:1:${mocks.Data.itemN[ItemId.TransportBelt]}:${
  mocks.Data.itemN[ItemId.AssemblingMachine3]
}:0:0:1`;
const mockSettings: Settings.SettingsState = {
  ...Settings.initialSettingsState,
  ...{ displayRate: DisplayRate.PerHour },
};
const mockFullSettings: Settings.SettingsState = {
  displayRate: DisplayRate.PerHour,
  itemPrecision: 2,
  beltPrecision: 4,
  factoryPrecision: 0,
  belt: ItemId.TransportBelt,
  assembler: ItemId.AssemblingMachine2,
  furnace: ItemId.StoneFurnace,
  prodModule: ItemId.ProductivityModule,
  otherModule: ItemId.EfficiencyModule,
  beaconType: ItemId.SpeedModule,
  beaconCount: 8,
  oilRecipe: RecipeId.BasicOilProcessing,
  fuel: ItemId.SolidFuel,
  miningBonus: 10,
  researchSpeed: ResearchSpeed.Speed0,
  flowRate: 1200,
};
const mockZipFullSettings = `${DisplayRate.PerHour}:2:4:0:${
  mocks.Data.itemN[mockFullSettings.belt]
}:${mocks.Data.itemN[mockFullSettings.assembler]}:${
  mocks.Data.itemN[mockFullSettings.furnace]
}:4:7:1:8:${mocks.Data.recipeN[mockFullSettings.oilRecipe]}:${
  mocks.Data.itemN[mockFullSettings.fuel]
}:10:0:1200`;
const mockNullSettings = {
  ...mockFullSettings,
  ...{ itemPrecision: null, beltPrecision: null, factoryPrecision: null },
};
const mockZipNullSettings = `${DisplayRate.PerHour}:n:n:n:${
  mocks.Data.itemN[mockFullSettings.belt]
}:${mocks.Data.itemN[mockFullSettings.assembler]}:${
  mocks.Data.itemN[mockFullSettings.furnace]
}:4:7:1:8:${mocks.Data.recipeN[mockFullSettings.oilRecipe]}:${
  mocks.Data.itemN[mockFullSettings.fuel]
}:10:0:1200`;

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
      service.updateUrl(null, null, null, null);
      expect(service.loaded).toEqual(true);
    });

    it('should return while unzipping', () => {
      service.unzipping = true;
      spyOn(router, 'navigateByUrl');
      service.updateUrl(null, null, null, null);
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should update url with products', () => {
      spyOn(router, 'navigateByUrl');
      service.updateUrl(
        mockProducts,
        {},
        Settings.initialSettingsState,
        mocks.Data
      );
      expect(router.navigateByUrl).toHaveBeenCalledWith(`#${mockZipProducts}`);
    });

    it('should update url with all', () => {
      spyOn(router, 'navigateByUrl');
      service.updateUrl(
        mockProducts,
        mockRecipeSettings,
        mockSettings,
        mocks.Data
      );
      expect(router.navigateByUrl).toHaveBeenCalledWith(`#${mockZipAll}`);
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
      spyOn(service, 'unzipRecipes');
      spyOn(service, 'unzipSettings');
      const url = `/#${mockZipExtra}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.unzipProducts).toHaveBeenCalled();
      expect(service.unzipRecipes).toHaveBeenCalled();
      expect(service.unzipSettings).toHaveBeenCalled();
    });
  });

  describe('zipProducts', () => {
    it('should zip the products', () => {
      const result = service.zipProducts(mockProducts, mocks.Data);
      expect(result).toEqual([mockZipProduct]);
    });
  });

  describe('unzipProducts', () => {
    it('should unzip the products', () => {
      spyOn(store, 'dispatch');
      service.unzipProducts([mockZipProduct], mocks.Data);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Products.LoadAction(mockProducts)
      );
    });
  });

  describe('zipRecipes', () => {
    it('should zip empty recipe settings', () => {
      const result = service.zipRecipes(
        { [RecipeId.SteelChest]: {} },
        mocks.Data
      );
      expect(result).toEqual([
        `${mocks.Data.recipeN[RecipeId.SteelChest]}::::::`,
      ]);
    });

    it('should zip full recipe settings', () => {
      const result = service.zipRecipes(mockFullRecipeSettings, mocks.Data);
      expect(result).toEqual([mockZipFullRecipeSettings]);
    });

    it('should zip false ignore value', () => {
      const result = service.zipRecipes(
        { [RecipeId.SteelChest]: { ignore: false } },
        mocks.Data
      );
      expect(result).toEqual([
        `${mocks.Data.recipeN[RecipeId.SteelChest]}:0:::::`,
      ]);
    });
  });

  describe('unzipRecipes', () => {
    it('should unzip the empty recipe settings', () => {
      spyOn(store, 'dispatch');
      service.unzipRecipes(
        [`${mocks.Data.recipeN[RecipeId.SteelChest]}::::::`],
        mocks.Data
      );
      expect(store.dispatch).toHaveBeenCalledWith(
        new Recipe.LoadAction({ [RecipeId.SteelChest]: {} })
      );
    });

    it('should unzip the full recipe settings', () => {
      spyOn(store, 'dispatch');
      service.unzipRecipes([mockZipFullRecipeSettings], mocks.Data);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Recipe.LoadAction(mockFullRecipeSettings)
      );
    });

    it('should unzip false ignore value', () => {
      spyOn(store, 'dispatch');
      service.unzipRecipes(
        [`${mocks.Data.recipeN[RecipeId.SteelChest]}:0:::::`],
        mocks.Data
      );
      expect(store.dispatch).toHaveBeenCalledWith(
        new Recipe.LoadAction({ [RecipeId.SteelChest]: { ignore: false } })
      );
    });
  });

  describe('zipSettings', () => {
    it('should skip zipping initial settings', () => {
      const result = service.zipSettings(
        Settings.initialSettingsState,
        mocks.Data
      );
      expect(result).toEqual(null);
    });

    it('should zip full settings', () => {
      const result = service.zipSettings(mockFullSettings, mocks.Data);
      expect(result).toEqual(mockZipFullSettings);
    });

    it('should zip settings with null values', () => {
      const result = service.zipSettings(mockNullSettings, mocks.Data);
      expect(result).toEqual(mockZipNullSettings);
    });

    it('should zip default settings', () => {
      const test = { ...Settings.initialSettingsState, ...{ test: true } };
      const result = service.zipSettings(test, mocks.Data);
      expect(result).toEqual(':::::::::::::::');
    });
  });

  describe('unzipSettings', () => {
    it('should unzip the empty settings', () => {
      spyOn(store, 'dispatch');
      service.unzipSettings(':::::::::::::::', mocks.Data);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Settings.LoadAction({} as any)
      );
    });

    it('should unzip the null settings', () => {
      spyOn(store, 'dispatch');
      service.unzipSettings(mockZipNullSettings, mocks.Data);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Settings.LoadAction(mockNullSettings)
      );
    });

    it('should unzip the full settings', () => {
      spyOn(store, 'dispatch');
      service.unzipSettings(mockZipFullSettings, mocks.Data);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Settings.LoadAction(mockFullSettings)
      );
    });
  });
});
