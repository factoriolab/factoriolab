import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';

import * as Mocks from 'src/mocks';
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

const mockZipEmpty = 'eJwrsAUAAR8Arg==';
const mockZipProducts = 'eJwrsDWyMrAyBAAHnAG1';
const mockZipAll = 'eJwrsDWyMrAyVCsC0mBgoVZsa2xmYGCFDgDXKAnJ';
const mockZipExtra = 'eJwrsDWyMrAyVCsC0mBgoVZsa2xmYGCFAtRKbLNK87IBA4gLqg==';
const mockZipLink =
  'eJwlikEKgEAMA3/jOekuthvonxb9Pxj1EsjM7IYgHleHqKks/eDucQIKM7w8lUOsJWL506a8/OpwyQeACRBX';
const mockProducts: Product[] = [
  {
    id: 0,
    itemId: ItemId.SteelChest,
    rate: 1,
    rateType: RateType.Items,
  },
];
const mockZipProduct = `${Mocks.Data.itemN[ItemId.SteelChest]}:0:1`;
const mockRecipeSettings: Recipe.RecipeState = {
  [RecipeId.SteelChest]: { beaconCount: 8 },
};
const mockFullRecipeSettings: Recipe.RecipeState = {
  [RecipeId.SteelChest]: {
    ignore: true,
    belt: ItemId.TransportBelt,
    factory: ItemId.AssemblingMachine3,
    modules: [ItemId.Module],
    beaconModule: ItemId.Module,
    beaconCount: 1,
  },
};
const mockZipFullRecipeSettings = `${
  Mocks.Data.recipeN[RecipeId.SteelChest]
}:1:${Mocks.Data.itemN[ItemId.TransportBelt]}:${
  Mocks.Data.itemN[ItemId.AssemblingMachine3]
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
  speedModule: ItemId.SpeedModule,
  beaconModule: ItemId.SpeedModule2,
  beaconCount: 8,
  oilRecipe: RecipeId.BasicOilProcessing,
  fuel: ItemId.SolidFuel,
  drillModule: true,
  miningBonus: 10,
  researchSpeed: ResearchSpeed.Speed0,
  flowRate: 1200,
  expensive: true,
};
const mockZipFullSettings = `${DisplayRate.PerHour}:2:4:0:${
  Mocks.Data.itemN[mockFullSettings.belt]
}:${Mocks.Data.itemN[mockFullSettings.assembler]}:${
  Mocks.Data.itemN[mockFullSettings.furnace]
}:${Mocks.Data.recipeN[mockFullSettings.oilRecipe]}:${
  Mocks.Data.itemN[mockFullSettings.fuel]
}:4:1:2:8:1:10:0:1200:1`;
const mockNullSettings = {
  ...mockFullSettings,
  ...{ itemPrecision: null, beltPrecision: null, factoryPrecision: null },
};
const mockZipNullSettings = `${DisplayRate.PerHour}:n:n:n:${
  Mocks.Data.itemN[mockFullSettings.belt]
}:${Mocks.Data.itemN[mockFullSettings.assembler]}:${
  Mocks.Data.itemN[mockFullSettings.furnace]
}:${Mocks.Data.recipeN[mockFullSettings.oilRecipe]}:${
  Mocks.Data.itemN[mockFullSettings.fuel]
}:4:1:2:8:1:10:0:1200:1`;

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
        Mocks.Data
      );
      expect(router.navigateByUrl).toHaveBeenCalledWith(`#${mockZipProducts}`);
    });

    it('should update url with all', () => {
      spyOn(router, 'navigateByUrl');
      service.updateUrl(
        mockProducts,
        mockRecipeSettings,
        mockSettings,
        Mocks.Data
      );
      expect(router.navigateByUrl).toHaveBeenCalledWith(`#${mockZipAll}`);
    });
  });

  describe('stepHref', () => {
    it('should generate a url for a step', () => {
      spyOn(router, 'navigateByUrl');
      service.updateUrl(
        mockProducts,
        mockFullRecipeSettings,
        mockFullSettings,
        Mocks.Data
      );
      const href = service.stepHref(Mocks.Step1, Mocks.Data);
      expect(href).toEqual(`/#${mockZipLink}`);
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

    it('should skip empty values', () => {
      spyOn(service, 'unzipProducts');
      spyOn(service, 'unzipRecipes');
      spyOn(service, 'unzipSettings');
      const url = `/#${mockZipEmpty}`;
      (router.events as any).next(new NavigationEnd(2, url, url));
      expect(service.unzipProducts).not.toHaveBeenCalled();
      expect(service.unzipRecipes).not.toHaveBeenCalled();
      expect(service.unzipSettings).not.toHaveBeenCalled();
    });
  });

  describe('zipProducts', () => {
    it('should zip the products', () => {
      const result = service.zipProducts(mockProducts, Mocks.Data);
      expect(result).toEqual([mockZipProduct]);
    });
  });

  describe('unzipProducts', () => {
    it('should unzip the products', () => {
      spyOn(store, 'dispatch');
      service.unzipProducts([mockZipProduct], Mocks.Data);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Products.LoadAction(mockProducts)
      );
    });
  });

  describe('zipRecipes', () => {
    it('should zip empty recipe settings', () => {
      const result = service.zipRecipes(
        { [RecipeId.SteelChest]: {} },
        Mocks.Data
      );
      expect(result).toEqual([
        `${Mocks.Data.recipeN[RecipeId.SteelChest]}::::::`,
      ]);
    });

    it('should zip full recipe settings', () => {
      const result = service.zipRecipes(mockFullRecipeSettings, Mocks.Data);
      expect(result).toEqual([mockZipFullRecipeSettings]);
    });

    it('should zip false ignore value', () => {
      const result = service.zipRecipes(
        { [RecipeId.SteelChest]: { ignore: false } },
        Mocks.Data
      );
      expect(result).toEqual([
        `${Mocks.Data.recipeN[RecipeId.SteelChest]}:0:::::`,
      ]);
    });
  });

  describe('unzipRecipes', () => {
    it('should unzip the empty recipe settings', () => {
      spyOn(store, 'dispatch');
      service.unzipRecipes(
        [`${Mocks.Data.recipeN[RecipeId.SteelChest]}::::::`],
        Mocks.Data
      );
      expect(store.dispatch).toHaveBeenCalledWith(
        new Recipe.LoadAction({ [RecipeId.SteelChest]: {} })
      );
    });

    it('should unzip the full recipe settings', () => {
      spyOn(store, 'dispatch');
      service.unzipRecipes([mockZipFullRecipeSettings], Mocks.Data);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Recipe.LoadAction(mockFullRecipeSettings)
      );
    });

    it('should unzip false ignore value', () => {
      spyOn(store, 'dispatch');
      service.unzipRecipes(
        [`${Mocks.Data.recipeN[RecipeId.SteelChest]}:0:::::`],
        Mocks.Data
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
        Mocks.Data
      );
      expect(result).toEqual(null);
    });

    it('should zip full settings', () => {
      const result = service.zipSettings(mockFullSettings, Mocks.Data);
      expect(result).toEqual(mockZipFullSettings);
    });

    it('should zip settings with null values', () => {
      const result = service.zipSettings(mockNullSettings, Mocks.Data);
      expect(result).toEqual(mockZipNullSettings);
    });

    it('should zip default settings', () => {
      const test = { ...Settings.initialSettingsState, ...{ test: true } };
      const result = service.zipSettings(test, Mocks.Data);
      expect(result).toEqual(':::::::::::::::::');
    });
  });

  describe('unzipSettings', () => {
    it('should unzip the empty settings', () => {
      spyOn(store, 'dispatch');
      service.unzipSettings(':::::::::::::::::', Mocks.Data);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Settings.LoadAction({} as any)
      );
    });

    it('should unzip the null settings', () => {
      spyOn(store, 'dispatch');
      service.unzipSettings(mockZipNullSettings, Mocks.Data);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Settings.LoadAction(mockNullSettings)
      );
    });

    it('should unzip the full settings', () => {
      spyOn(store, 'dispatch');
      service.unzipSettings(mockZipFullSettings, Mocks.Data);
      expect(store.dispatch).toHaveBeenCalledWith(
        new Settings.LoadAction(mockFullSettings)
      );
    });
  });
});
