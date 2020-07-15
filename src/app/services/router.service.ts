import { Injectable } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { Store } from '@ngrx/store';
import { deflate, inflate } from 'pako';

import {
  Product,
  RecipeSettings,
  Step,
  RateType,
  ItemSettings,
  Entities,
  Defaults,
} from '~/models';
import { State } from '~/store';
import * as Products from '~/store/products';
import * as Items from '~/store/items';
import * as Recipes from '~/store/recipes';
import * as Settings from '~/store/settings';

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  loaded: boolean;
  unzipping: boolean;
  zip: string;
  zipPartial = '';

  constructor(private router: Router, private store: Store<State>) {
    this.router.events.subscribe((e) => this.updateState(e));
  }

  updateUrl(
    products: Product[],
    items: Items.ItemsState,
    recipes: Recipes.RecipesState,
    settings: Settings.SettingsState,
    defaults: Defaults
  ) {
    if (this.loaded && !this.unzipping) {
      const zProducts = this.zipProducts(products);
      const zState = `p=${zProducts.join(',')}`;
      this.zipPartial = '';
      const zItems = this.zipItems(items);
      if (zItems.length) {
        this.zipPartial += `&i=${zItems.join(',')}`;
      }
      const zRecipes = this.zipRecipes(recipes);
      if (zRecipes.length) {
        this.zipPartial += `&r=${zRecipes.join(',')}`;
      }
      const zSettings = this.zipSettings(settings, defaults);
      if (zSettings.length) {
        this.zipPartial += `&s=${zSettings}`;
      }
      this.zip = btoa(deflate(zState + this.zipPartial, { to: 'string' }));
      this.router.navigateByUrl(`${this.router.url.split('#')[0]}#${this.zip}`);
    } else {
      this.loaded = true;
    }
  }

  stepHref(step: Step) {
    const products: Product[] = [
      {
        id: '0',
        itemId: step.itemId,
        rate: step.items.toNumber(),
        rateType: RateType.Items,
      },
    ];
    const zProducts = this.zipProducts(products);
    const zState = `p=${zProducts.join(',')}`;
    return `#${btoa(deflate(zState + this.zipPartial, { to: 'string' }))}`;
  }

  updateState(e: Event) {
    try {
      if (e instanceof NavigationEnd) {
        const fragments = e.url.split('#');
        if (fragments.length > 1) {
          const urlZip = fragments[fragments.length - 1];
          if (this.zip !== urlZip) {
            const state: string = inflate(atob(urlZip), { to: 'string' });
            const params = state.split('&');
            this.unzipping = true;
            for (const p of params) {
              const s = p.split('=');
              if (s[1]) {
                if (s[0] === 'p') {
                  this.unzipProducts(s[1].split(','));
                } else if (s[0] === 'i') {
                  this.zipPartial = `&i=${s[1]}`;
                  this.unzipItems(s[1].split(','));
                } else if (s[0] === 'r') {
                  this.zipPartial = `&r=${s[1]}`;
                  this.unzipRecipes(s[1].split(','));
                } else if (s[0] === 's') {
                  this.zipPartial += `&s=${s[1]}`;
                  this.unzipSettings(s[1]);
                }
              }
            }
            this.zip = urlZip;
          }
        }
      }
    } catch (e) {
      console.error('Navigation failed.');
      console.error(e);
    } finally {
      this.unzipping = false;
    }
  }

  zipProducts(products: Product[]): string[] {
    return products.map((product) => {
      const i = product.itemId;
      const t = product.rateType;
      const r = product.rate;
      return `${i}:${t}:${r}`;
    });
  }

  unzipProducts(zProducts: string[]) {
    const products: Product[] = [];
    let n = 0;
    for (const product of zProducts) {
      const p = product.split(':');
      products.push({
        id: n.toString(),
        itemId: p[0],
        rateType: Number(p[1]),
        rate: Number(p[2]),
      });
      n++;
    }
    this.store.dispatch(new Products.LoadAction(products));
  }

  zipItems(state: Items.ItemsState): string[] {
    return Object.keys(state).map((id) => {
      const settings = state[id];
      const i = id;
      const ig = settings.ignore == null ? '' : settings.ignore ? 1 : 0;
      const bl = settings.belt == null ? '' : settings.belt;
      return `${i}:${ig}:${bl}`;
    });
  }

  unzipItems(zItems: string[]) {
    const items: Items.ItemsState = {};
    for (const recipe of zItems) {
      const r = recipe.split(':');
      const u: ItemSettings = {};
      if (r[1] !== '') {
        u.ignore = r[1] === '1' ? true : false;
      }
      if (r[2] !== '') {
        u.belt = r[2];
      }
      items[r[0]] = u;
    }
    this.store.dispatch(new Items.LoadAction(items));
  }

  zipRecipes(state: Recipes.RecipesState): string[] {
    return Object.keys(state).map((id) => {
      const settings = state[id];
      const i = id;
      const fc = settings.factory == null ? '' : settings.factory;
      const md = settings.modules == null ? '' : settings.modules.join('.');
      const bt = settings.beaconModule == null ? '' : settings.beaconModule;
      const bc = settings.beaconCount == null ? '' : settings.beaconCount;
      return `${i}:${fc}:${md}:${bt}:${bc}`;
    });
  }

  unzipRecipes(zRecipes: string[]) {
    const recipes: Recipes.RecipesState = {};
    for (const recipe of zRecipes) {
      const r = recipe.split(':');
      const u: RecipeSettings = {};
      if (r[1] !== '') {
        u.factory = r[1];
      }
      if (r[2] !== '') {
        u.modules = r[2].split('.');
      }
      if (r[3] !== '') {
        u.beaconModule = r[3];
      }
      if (r[4] !== '') {
        u.beaconCount = Number(r[4]);
      }
      recipes[r[0]] = u;
    }
    this.store.dispatch(new Recipes.LoadAction(recipes));
  }

  zipSettings(state: Settings.SettingsState, defaults: Defaults): string {
    const init = Settings.initialSettingsState;
    const bd =
      state.baseDatasetId === init.baseDatasetId ? '' : state.baseDatasetId;
    const _defaultMD = [...init.modDatasetIds].sort().join('.');
    const _currentMD = [...state.modDatasetIds].sort().join('.');
    const md = _defaultMD === _currentMD ? '' : _currentMD ? _currentMD : '[]';
    const dr = state.displayRate === init.displayRate ? '' : state.displayRate;
    const ip =
      state.itemPrecision === init.itemPrecision
        ? ''
        : state.itemPrecision == null
        ? 'n'
        : state.itemPrecision;
    const bp =
      state.beltPrecision === init.beltPrecision
        ? ''
        : state.beltPrecision == null
        ? 'n'
        : state.beltPrecision;
    const fp =
      state.factoryPrecision === init.factoryPrecision
        ? ''
        : state.factoryPrecision == null
        ? 'n'
        : state.factoryPrecision;
    const tb = state.belt === defaults.belt ? '' : state.belt;
    const fl = state.fuel === defaults.fuel ? '' : state.fuel;
    const _defaultDI = [...defaults.disabledRecipes].sort().join('.');
    const _currentDI = Object.keys(state.recipeDisabled).sort().join('.');
    const di = _defaultDI === _currentDI ? '' : _currentDI ? _currentDI : '[]';
    const _defaultFR = defaults.factoryRank.join('.');
    const _currentFR = state.factoryRank.join('.');
    const fr = _defaultFR === _currentFR ? '' : _currentFR ? _currentFR : '[]';
    const _defaultMR = defaults.moduleRank.join('.');
    const _currentMR = state.moduleRank.join('.');
    const mr = _defaultMR === _currentMR ? '' : _currentMR ? _currentMR : '[]';
    const bm =
      state.beaconModule === defaults.beaconModule ? '' : state.beaconModule;
    const bc = state.beaconCount === init.beaconCount ? '' : state.beaconCount;
    const dm =
      state.drillModule === init.drillModule ? '' : Number(state.drillModule);
    const mb = state.miningBonus === init.miningBonus ? '' : state.miningBonus;
    const rs =
      state.researchSpeed === init.researchSpeed ? '' : state.researchSpeed;
    const fw = state.flowRate === init.flowRate ? '' : state.flowRate;
    const ex =
      state.expensive === init.expensive ? '' : Number(state.expensive);
    const value = `${bd}${md}${dr}:${ip}:${bp}:${fp}:${tb}:${fl}:${di}:${fr}:${mr}:${bm}:${bc}:${dm}:${mb}:${rs}:${fw}:${ex}`;
    return /^[:]+$/.test(value) ? '' : value;
  }

  unzipSettings(zSettings: string) {
    const s = zSettings.split(':');
    const settings: Settings.SettingsState = {} as any;
    if (s[0] !== '') {
      settings.baseDatasetId = s[0];
    }
    if (s[1] !== '') {
      settings.modDatasetIds = s[1] === '[]' ? [] : s[1].split('.');
    }
    if (s[2] !== '') {
      settings.displayRate = Number(s[0]);
    }
    if (s[3] !== '') {
      settings.itemPrecision = s[3] === 'n' ? null : Number(s[3]);
    }
    if (s[4] !== '') {
      settings.beltPrecision = s[4] === 'n' ? null : Number(s[4]);
    }
    if (s[5] !== '') {
      settings.factoryPrecision = s[5] === 'n' ? null : Number(s[5]);
    }
    if (s[6] !== '') {
      settings.belt = s[6];
    }
    if (s[7] !== '') {
      settings.fuel = s[7];
    }
    if (s[8] !== '') {
      settings.recipeDisabled =
        s[8] === '[]'
          ? {}
          : s[8]
              .split('.')
              .reduce(
                (e: Entities<boolean>, r) => ({ ...e, ...{ [r]: true } }),
                {}
              );
    }
    if (s[9] !== '') {
      settings.factoryRank = s[9] === '[]' ? [] : s[9].split('.');
    }
    if (s[10] !== '') {
      settings.moduleRank = s[10] === '[]' ? [] : s[10].split('.');
    }
    if (s[11] !== '') {
      settings.beaconModule = s[11];
    }
    if (s[12] !== '') {
      settings.beaconCount = Number(s[12]);
    }
    if (s[13] !== '') {
      settings.drillModule = s[13] === '1';
    }
    if (s[14] !== '') {
      settings.miningBonus = Number(s[14]);
    }
    if (s[15] !== '') {
      settings.researchSpeed = Number(s[15]);
    }
    if (s[16] !== '') {
      settings.flowRate = Number(s[16]);
    }
    if (s[17] !== '') {
      settings.expensive = s[17] === '1';
    }
    this.store.dispatch(new Settings.LoadAction(settings));
  }
}
