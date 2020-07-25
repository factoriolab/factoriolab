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
import * as Items from '~/store/items';
import * as Products from '~/store/products';
import * as Recipes from '~/store/recipes';
import * as Settings from '~/store/settings';

export const NULL = 'n';
export const EMPTY = 'e';
export const ARRAYSEP = '.';
export const FIELDSEP = ':';
export const TRUE = '1';
export const FALSE = '0';

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

      this.zip = this.getHash(zState);
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
    return '#' + this.getHash(`p=${zProducts.join(',')}`);
  }

  getHash(zProducts: string) {
    const unzipped = zProducts + this.zipPartial;
    const zipped = `z=${btoa(deflate(unzipped, { to: 'string' }))}`;
    return unzipped.length < zipped.length ? unzipped : zipped;
  }

  updateState(e: Event) {
    try {
      if (e instanceof NavigationEnd) {
        const fragments = e.url.split('#');
        if (fragments.length > 1) {
          const urlZip = fragments[fragments.length - 1];
          if (this.zip !== urlZip) {
            const state = urlZip.startsWith('z=')
              ? inflate(atob(urlZip.substr(2)), { to: 'string' })
              : urlZip;
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
      const r = product.rate;

      if (product.rateType === RateType.Items) {
        return `${i}:${r}`;
      } else {
        const t = product.rateType;
        return `${i}:${r}:${t}`;
      }
    });
  }

  unzipProducts(zProducts: string[]) {
    const products: Product[] = [];
    let n = 0;
    for (const product of zProducts) {
      const p = product.split(FIELDSEP);
      products.push({
        id: n.toString(),
        itemId: p[0],
        rate: Number(p[1]),
        rateType: p.length > 2 ? Number(p[2]) : RateType.Items,
      });
      n++;
    }
    this.store.dispatch(new Products.LoadAction(products));
  }

  zipItems(state: Items.ItemsState): string[] {
    return Object.keys(state).map((id) => {
      const settings = state[id];
      const i = id;
      const ig = this.zipTruthyBool(settings.ignore);
      const bl = this.zipTruthy(settings.belt);
      return [i, ig, bl].join(FIELDSEP);
    });
  }

  unzipItems(zItems: string[]) {
    const items: Items.ItemsState = {};
    for (const recipe of zItems) {
      const r = recipe.split(FIELDSEP);
      const u: ItemSettings = {};
      let i = 1;
      let v = r[i++];
      if (v !== '') {
        u.ignore = this.parseBool(v);
      }
      v = r[i++];
      if (v !== '') {
        u.belt = this.parseString(v);
      }
      items[r[0]] = u;
    }
    this.store.dispatch(new Items.LoadAction(items));
  }

  zipRecipes(state: Recipes.RecipesState): string[] {
    return Object.keys(state).map((id) => {
      const settings = state[id];
      const i = id;
      const fc = this.zipTruthy(settings.factory);
      const md = this.zipTruthyArray(settings.modules);
      const bt = this.zipTruthy(settings.beaconModule);
      const bc = this.zipTruthyNum(settings.beaconCount);
      return [i, fc, md, bt, bc].join(FIELDSEP);
    });
  }

  unzipRecipes(zRecipes: string[]) {
    const recipes: Recipes.RecipesState = {};
    for (const recipe of zRecipes) {
      const r = recipe.split(FIELDSEP);
      const u: RecipeSettings = {};
      let i = 1;
      let v = '';
      v = r[i++];
      if (v !== '') {
        u.factory = this.parseString(v);
      }
      v = r[i++];
      if (v !== '') {
        u.modules = this.parseArray(v);
      }
      v = r[i++];
      if (v !== '') {
        u.beaconModule = this.parseString(v);
      }
      v = r[i++];
      if (v !== '') {
        u.beaconCount = this.parseNumber(v);
      }
      recipes[r[0]] = u;
    }
    this.store.dispatch(new Recipes.LoadAction(recipes));
  }

  zipSettings(state: Settings.SettingsState, defaults: Defaults): string {
    const init = Settings.initialSettingsState;
    const bd = this.zipDiff(state.baseDatasetId, init.baseDatasetId);
    const md = this.zipDiffArray(state.modDatasetIds, init.modDatasetIds);
    const dr = this.zipDiffNum(state.displayRate, init.displayRate);
    const ip = this.zipDiffNum(state.itemPrecision, init.itemPrecision);
    const bp = this.zipDiffNum(state.beltPrecision, init.beltPrecision);
    const fp = this.zipDiffNum(state.factoryPrecision, init.factoryPrecision);
    const tb = this.zipDiff(state.belt, defaults.belt);
    const fl = this.zipDiff(state.fuel, defaults.fuel);
    const di = this.zipDiffArray(
      Object.keys(state.recipeDisabled),
      defaults.disabledRecipes
    );
    const fr = this.zipDiffRank(state.factoryRank, defaults.factoryRank);
    const mr = this.zipDiffRank(state.moduleRank, defaults.moduleRank);
    const bm = this.zipDiff(state.beaconModule, defaults.beaconModule);
    const bc = this.zipDiffNum(state.beaconCount, init.beaconCount);
    const dm = this.zipDiffBool(state.drillModule, init.drillModule);
    const mb = this.zipDiffNum(state.miningBonus, init.miningBonus);
    const rs = this.zipDiffNum(state.researchSpeed, init.researchSpeed);
    const fw = this.zipDiffNum(state.flowRate, init.flowRate);
    const ex = this.zipDiffBool(state.expensive, init.expensive);
    const value = [
      bd,
      md,
      dr,
      ip,
      bp,
      fp,
      tb,
      fl,
      di,
      fr,
      mr,
      bm,
      bc,
      dm,
      mb,
      rs,
      fw,
      ex,
    ].join(FIELDSEP);
    return /^[:]+$/.test(value) ? '' : value;
  }

  unzipSettings(zSettings: string) {
    const s = zSettings.split(FIELDSEP);
    const settings: Settings.SettingsState = {} as any;
    let i = 0;
    let v = '';
    v = s[i++];
    if (v !== '') {
      settings.baseDatasetId = v;
    }
    v = s[i++];
    if (v !== '') {
      settings.modDatasetIds = this.parseArray(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.displayRate = this.parseNumber(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.itemPrecision = this.parseNumber(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.beltPrecision = this.parseNumber(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.factoryPrecision = this.parseNumber(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.belt = this.parseString(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.fuel = this.parseString(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.recipeDisabled = this.parseBoolEntities(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.factoryRank = this.parseArray(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.moduleRank = this.parseArray(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.beaconModule = this.parseString(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.beaconCount = this.parseNumber(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.drillModule = this.parseBool(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.miningBonus = this.parseNumber(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.researchSpeed = this.parseNumber(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.flowRate = this.parseNumber(v);
    }
    v = s[i++];
    if (v !== '') {
      settings.expensive = this.parseBool(v);
    }
    this.store.dispatch(new Settings.LoadAction(settings));
  }

  zipTruthy(value: string) {
    return value == null ? '' : value;
  }

  zipTruthyNum(value: number) {
    return value == null ? '' : value.toString();
  }

  zipTruthyBool(value: boolean) {
    return value == null ? '' : value ? TRUE : FALSE;
  }

  zipTruthyArray(value: string[]) {
    return value == null ? '' : value.length ? value.join(ARRAYSEP) : EMPTY;
  }

  zipDiff(value: string, init: string) {
    return value === init ? '' : value == null ? NULL : value;
  }

  zipDiffNum(value: number, init: number) {
    return value === init ? '' : value == null ? NULL : value.toString();
  }

  zipDiffBool(value: boolean, init: boolean) {
    return value === init ? '' : value == null ? NULL : value ? TRUE : FALSE;
  }

  zipDiffArray(value: string[], init: string[]) {
    const zVal = [...value].sort().join(ARRAYSEP);
    const zInit = [...init].sort().join(ARRAYSEP);
    return zVal === zInit ? '' : zVal ? zVal : EMPTY;
  }

  zipDiffRank(value: string[], init: string[]) {
    const zVal = [...value].join(ARRAYSEP);
    const zInit = [...init].join(ARRAYSEP);
    return zVal === zInit ? '' : zVal ? zVal : EMPTY;
  }

  parseString(value: string) {
    return value === NULL ? null : value;
  }

  parseBool(value: string) {
    return value === NULL ? null : value === TRUE;
  }

  parseNumber(value: string) {
    return value === NULL ? null : Number(value);
  }

  parseArray(value: string) {
    return value === NULL ? null : value === EMPTY ? [] : value.split(ARRAYSEP);
  }

  parseBoolEntities(value: string) {
    return value === NULL
      ? null
      : value === EMPTY
      ? {}
      : value
          .split(ARRAYSEP)
          .reduce(
            (e: Entities<boolean>, r) => ({ ...e, ...{ [r]: true } }),
            {}
          );
  }
}
